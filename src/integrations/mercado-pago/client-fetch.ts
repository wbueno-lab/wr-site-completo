import { 
  MercadoPagoPreference, 
  MercadoPagoPayment, 
  PaymentResult,
  MercadoPagoItem,
  MercadoPagoPayer 
} from './types';
import { MERCADO_PAGO_CONFIG, validateMercadoPagoConfig } from './config';

// Cliente do Mercado Pago usando fetch direto
class MercadoPagoClient {
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    
    try {
      validateMercadoPagoConfig();
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar Mercado Pago:', error);
      throw error;
    }
  }

  // Criar preferência de pagamento
  async createPreference(preferenceData: MercadoPagoPreference): Promise<PaymentResult> {
    try {
      await this.initialize();
      
      // Garantir que as URLs estão definidas
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      
      // Definir URLs de retorno obrigatórias
      const backUrls = {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      };
      
      // Log para debug
      console.log('🔍 Debug Mercado Pago - URLs de retorno:', backUrls);
      console.log('🔍 Debug Mercado Pago - Base URL:', baseUrl);
      
      // Verificar se as URLs são válidas
      if (!backUrls.success || !backUrls.failure || !backUrls.pending) {
        console.error('❌ URLs de retorno inválidas:', backUrls);
        throw new Error('URLs de retorno não configuradas corretamente');
      }
      
      const requestBody = {
        ...preferenceData,
        back_urls: backUrls,
        // Temporariamente removendo auto_return para testar
        // auto_return: 'approved',
        payment_methods: {
          ...preferenceData.payment_methods,
          installments: MERCADO_PAGO_CONFIG.installments.max
        }
      };
      
      // Log do corpo da requisição para debug
      console.log('🔍 Debug Mercado Pago - Corpo da requisição:', JSON.stringify(requestBody, null, 2));
      
      // Log do token e ambiente
      console.log('🔍 Debug Mercado Pago - Access Token:', MERCADO_PAGO_CONFIG.accessToken);
      console.log('🔍 Debug Mercado Pago - Environment:', MERCADO_PAGO_CONFIG.environment);
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      // Log da resposta bruta
      console.log('🔍 Debug Mercado Pago - Response status:', response.status);
      console.log('🔍 Debug Mercado Pago - Response headers:', Object.fromEntries(response.headers.entries()));
      const responseText = await response.clone().text();
      console.log('🔍 Debug Mercado Pago - Response body:', responseText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro do Mercado Pago:', errorData);
        console.error('❌ Status HTTP:', response.status);
        console.error('❌ Headers da resposta:', Object.fromEntries(response.headers.entries()));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const preference = await response.json();

      return {
        success: true,
        paymentId: preference.id,
        redirectUrl: preference.init_point,
        message: 'Preferência criada com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao criar preferência:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar preferência de pagamento'
      };
    }
  }

  // Buscar pagamento por ID
  async getPayment(paymentId: string): Promise<MercadoPagoPayment | null> {
    try {
      await this.initialize();
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      return null;
    }
  }

  // Criar itens do carrinho para o Mercado Pago
  createItemsFromCart(cartItems: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>): MercadoPagoItem[] {
    return cartItems.map(item => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: MERCADO_PAGO_CONFIG.currency
    }));
  }

  // Criar dados do pagador
  createPayer(email: string, name?: string, phone?: string): MercadoPagoPayer {
    const payer: MercadoPagoPayer = {
      email,
      name: name?.split(' ')[0],
      surname: name?.split(' ').slice(1).join(' ')
    };

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      payer.phone = {
        area_code: cleanPhone.substring(0, 2),
        number: cleanPhone.substring(2)
      };
    }

    return payer;
  }

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const payment = await this.getPayment(paymentId);
      
      if (!payment) {
        return {
          success: false,
          message: 'Pagamento não encontrado'
        };
      }

      return {
        success: payment.status === 'approved',
        paymentId: payment.id,
        status: payment.status,
        message: this.getStatusMessage(payment.status)
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao verificar status do pagamento'
      };
    }
  }

  private getStatusMessage(status: string): string {
    const statusMessages: Record<string, string> = {
      'pending': 'Pagamento pendente',
      'approved': 'Pagamento aprovado',
      'authorized': 'Pagamento autorizado',
      'in_process': 'Pagamento em processamento',
      'in_mediation': 'Pagamento em mediação',
      'rejected': 'Pagamento rejeitado',
      'cancelled': 'Pagamento cancelado',
      'refunded': 'Pagamento estornado',
      'charged_back': 'Pagamento contestado'
    };

    return statusMessages[status] || 'Status desconhecido';
  }
}

// Instância singleton do cliente
export const mercadoPagoClient = new MercadoPagoClient();
