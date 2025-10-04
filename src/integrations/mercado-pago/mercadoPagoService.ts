// Serviço de integração com Mercado Pago
import { supabase } from '@/integrations/supabase/client';
import { MERCADO_PAGO_CONFIG } from './config';
import type {
  MercadoPagoPaymentRequest,
  MercadoPagoPaymentResponse,
  MercadoPagoPixPaymentRequest,
  MercadoPagoBoletoPaymentRequest,
  MercadoPagoInstallment,
  MercadoPagoError
} from './types';
import { PaymentResult, OrderData } from '@/types/payment';

class MercadoPagoService {
  /**
   * Criar pagamento com cartão de crédito
   */
  async createCardPayment(
    orderData: OrderData,
    cardToken: string,
    installments: number = 1
  ): Promise<PaymentResult> {
    try {
      const paymentData: MercadoPagoPaymentRequest = {
        transaction_amount: orderData.total_amount,
        token: cardToken,
        description: this.buildDescription(orderData.items),
        installments,
        payment_method_id: 'visa', // Será detectado automaticamente pelo token
        payer: {
          email: orderData.customer_email
        },
        statement_descriptor: MERCADO_PAGO_CONFIG.payment.statementDescriptor,
        external_reference: `order_${Date.now()}`,
        notification_url: this.getWebhookUrl(),
        additional_info: {
          items: orderData.items.map(item => ({
            id: item.product_id,
            title: item.product_name,
            quantity: item.quantity,
            unit_price: item.price
          })),
          payer: {
            first_name: orderData.customer_name.split(' ')[0],
            last_name: orderData.customer_name.split(' ').slice(1).join(' ') || orderData.customer_name,
            phone: {
              number: orderData.customer_phone
            },
            address: {
              zip_code: orderData.shipping_address.zip_code,
              street_name: orderData.shipping_address.street,
              street_number: orderData.shipping_address.number
            }
          },
          shipments: {
            receiver_address: {
              zip_code: orderData.shipping_address.zip_code,
              state_name: orderData.shipping_address.state,
              city_name: orderData.shipping_address.city,
              street_name: orderData.shipping_address.street,
              street_number: parseInt(orderData.shipping_address.number) || 0
            }
          }
        }
      };

      // Chamar Edge Function para processar pagamento
      const { data, error } = await supabase.functions.invoke('mercado-pago-process-payment', {
        body: { paymentData, orderData }
      });

      if (error) {
        throw new Error(error.message);
      }

      const response: MercadoPagoPaymentResponse = data.payment;

      return {
        success: response.status === 'approved',
        paymentId: response.id.toString(),
        transactionId: response.id.toString(),
        status: this.mapPaymentStatus(response.status),
        message: this.getStatusMessage(response.status, response.status_detail),
        details: {
          method: 'credit_card',
          amount: response.transaction_amount,
          total_amount: response.transaction_amount,
          installments: response.installments,
          status: this.mapPaymentStatus(response.status),
          transaction_id: response.id.toString(),
          external_id: response.external_reference,
          processed_at: new Date(response.date_created)
        }
      };
    } catch (error: any) {
      console.error('Erro ao processar pagamento com cartão:', error);
      return {
        success: false,
        message: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Criar pagamento PIX
   */
  async createPixPayment(orderData: OrderData): Promise<PaymentResult> {
    try {
      // Validar dados obrigatórios
      if (!orderData.customer_email || !orderData.customer_email.includes('@')) {
        throw new Error('Email do cliente é obrigatório e deve ser válido');
      }

      if (!orderData.customer_name || orderData.customer_name.trim().length < 3) {
        throw new Error('Nome do cliente é obrigatório');
      }

      // Garantir que o valor seja um número válido com 2 casas decimais
      const amount = Math.round(orderData.total_amount * 100) / 100;

      const firstName = orderData.customer_name.trim().split(' ')[0];
      const lastName = orderData.customer_name.trim().split(' ').slice(1).join(' ') || firstName;

      const paymentData: MercadoPagoPixPaymentRequest = {
        transaction_amount: amount,
        description: this.buildDescription(orderData.items).substring(0, 255), // Limitar descrição a 255 caracteres
        payment_method_id: 'pix',
        payer: {
          email: orderData.customer_email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          identification: orderData.customer_cpf ? {
            type: 'CPF',
            number: orderData.customer_cpf.replace(/\D/g, '')
          } : undefined
        },
        external_reference: `order_${Date.now()}`,
        notification_url: this.getWebhookUrl()
      };

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('mercado-pago-process-payment', {
        body: { paymentData, orderData, paymentType: 'pix' }
      });

      if (error) {
        console.error('❌ Erro ao chamar Edge Function:', error);
        throw new Error(error.message);
      }

      if (!data.success && data.error) {
        console.error('❌ Erro retornado pela Edge Function:', data);
        throw new Error(data.error + (data.details ? ` - ${JSON.stringify(data.details)}` : ''));
      }

      const response: MercadoPagoPaymentResponse = data.payment;

      // Extrair dados do PIX
      const qrCode = response.point_of_interaction?.transaction_data?.qr_code || '';
      const qrCodeBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64 || '';

      return {
        success: true,
        paymentId: response.id.toString(),
        qrCode,
        status: 'pending',
        message: 'PIX gerado com sucesso. Pague em até 30 minutos.',
        details: {
          method: 'pix',
          amount: response.transaction_amount,
          total_amount: response.transaction_amount,
          status: 'pending',
          transaction_id: response.id.toString(),
          external_id: response.external_reference,
          pix_data: {
            pixKey: orderData.customer_email,
            qrCode,
            qrCodeBase64,
            expirationTime: new Date(Date.now() + 30 * 60 * 1000),
            amount: response.transaction_amount
          }
        }
      };
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      return {
        success: false,
        message: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Criar pagamento com Boleto
   */
  async createBoletoPayment(orderData: OrderData): Promise<PaymentResult> {
    try {
      const [firstName, ...lastNameParts] = orderData.customer_name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const paymentData: MercadoPagoBoletoPaymentRequest = {
        transaction_amount: orderData.total_amount,
        description: this.buildDescription(orderData.items),
        payment_method_id: 'bolbradesco',
        payer: {
          email: orderData.customer_email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: '00000000000' // Cliente precisará fornecer
          },
          address: {
            zip_code: orderData.shipping_address.zip_code,
            street_name: orderData.shipping_address.street,
            street_number: orderData.shipping_address.number,
            neighborhood: orderData.shipping_address.neighborhood,
            city: orderData.shipping_address.city,
            federal_unit: orderData.shipping_address.state
          }
        },
        external_reference: `order_${Date.now()}`,
        notification_url: this.getWebhookUrl()
      };

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('mercado-pago-process-payment', {
        body: { paymentData, orderData, paymentType: 'boleto' }
      });

      if (error) {
        throw new Error(error.message);
      }

      const response: MercadoPagoPaymentResponse = data.payment;

      // Extrair dados do boleto
      const boletoUrl = response.point_of_interaction?.transaction_data?.ticket_url || '';

      return {
        success: true,
        paymentId: response.id.toString(),
        boletoUrl,
        status: 'pending',
        message: 'Boleto gerado com sucesso. Pague até o vencimento.',
        details: {
          method: 'boleto',
          amount: response.transaction_amount,
          total_amount: response.transaction_amount,
          status: 'pending',
          transaction_id: response.id.toString(),
          external_id: response.external_reference,
          boleto_data: {
            boletoCode: response.id.toString(),
            barCode: response.id.toString(),
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            amount: response.transaction_amount
          }
        }
      };
    } catch (error: any) {
      console.error('Erro ao criar boleto:', error);
      return {
        success: false,
        message: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Buscar parcelas disponíveis
   */
  async getInstallments(
    amount: number,
    paymentMethodId: string = 'visa'
  ): Promise<MercadoPagoInstallment[]> {
    try {
      console.log('🔍 Buscando parcelas via Edge Function:', { amount, paymentMethodId });
      
      const { data, error } = await supabase.functions.invoke('mercado-pago-get-installments', {
        body: { amount, paymentMethodId }
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error(error.message);
      }

      console.log('✅ Parcelas recebidas:', data);
      return data.installments || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar parcelas:', error);
      console.log('⚠️ Usando parcelas padrão como fallback');
      return this.generateDefaultInstallments(amount);
    }
  }

  /**
   * Verificar status do pagamento
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-check-payment', {
        body: { paymentId }
      });

      if (error) {
        throw new Error(error.message);
      }

      const response: MercadoPagoPaymentResponse = data.payment;

      return {
        success: response.status === 'approved',
        paymentId: response.id.toString(),
        status: this.mapPaymentStatus(response.status),
        message: this.getStatusMessage(response.status, response.status_detail)
      };
    } catch (error: any) {
      console.error('Erro ao verificar status do pagamento:', error);
      return {
        success: false,
        message: 'Erro ao verificar status do pagamento'
      };
    }
  }

  /**
   * Buscar pedido por payment_id
   */
  async getOrder(paymentId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!inner (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            selected_size,
            product_snapshot,
            product:products (*)
          )
        `)
        .eq('payment_id', paymentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

  /**
   * Mapear status do Mercado Pago para status interno
   */
  private mapPaymentStatus(status: string): 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' {
    switch (status) {
      case 'approved':
      case 'authorized':
        return 'approved';
      case 'rejected':
      case 'cancelled':
        return 'rejected';
      case 'refunded':
      case 'charged_back':
        return 'refunded';
      case 'pending':
      case 'in_process':
      case 'in_mediation':
      default:
        return 'pending';
    }
  }

  /**
   * Obter mensagem de status
   */
  private getStatusMessage(status: string, statusDetail: string): string {
    const messages: Record<string, string> = {
      'approved': 'Pagamento aprovado com sucesso!',
      'pending': 'Pagamento pendente. Aguardando confirmação.',
      'in_process': 'Pagamento em processamento.',
      'rejected': 'Pagamento rejeitado. Verifique os dados e tente novamente.',
      'cancelled': 'Pagamento cancelado.',
      'refunded': 'Pagamento estornado.',
      'charged_back': 'Pagamento contestado.'
    };

    return messages[status] || `Status: ${status} - ${statusDetail}`;
  }

  /**
   * Construir descrição do pagamento
   */
  private buildDescription(items: OrderData['items']): string {
    if (items.length === 1) {
      return items[0].product_name;
    }
    return `Pedido com ${items.length} itens - WR Capacetes`;
  }

  /**
   * Obter URL do webhook
   */
  private getWebhookUrl(): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/mercado-pago-webhook`;
  }

  /**
   * Extrair mensagem de erro
   */
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Erro ao processar pagamento. Tente novamente.';
  }

  /**
   * Gerar parcelas padrão (fallback)
   */
  private generateDefaultInstallments(amount: number): MercadoPagoInstallment[] {
    const installments: MercadoPagoInstallment[] = [];
    const maxInstallments = Math.min(12, Math.floor(amount / MERCADO_PAGO_CONFIG.payment.minInstallmentAmount));

    for (let i = 1; i <= maxInstallments; i++) {
      const installmentAmount = amount / i;
      const rate = i === 1 ? 0 : (i - 1) * 1.5; // 1.5% de juros por parcela

      installments.push({
        installments: i,
        installment_rate: rate,
        discount_rate: 0,
        reimbursement_rate: null,
        labels: i === 1 ? ['CFT_ZERO'] : [],
        installment_rate_collector: [],
        min_allowed_amount: MERCADO_PAGO_CONFIG.payment.minInstallmentAmount,
        max_allowed_amount: amount,
        recommended_message: `${i}x de ${this.formatCurrency(installmentAmount * (1 + rate / 100))}`,
        installment_amount: installmentAmount * (1 + rate / 100),
        total_amount: amount * (1 + rate / 100),
        payment_method_option_id: `visa-${i}`
      });
    }

    return installments;
  }

  /**
   * Formatar valor monetário
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}

export const mercadoPagoService = new MercadoPagoService();

