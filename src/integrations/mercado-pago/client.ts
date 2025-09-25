// Importação será feita dinamicamente
import { 
  MercadoPagoPreference, 
  MercadoPagoPayment, 
  PaymentResult,
  MercadoPagoItem,
  MercadoPagoPayer 
} from './types';
import { MERCADO_PAGO_CONFIG, validateMercadoPagoConfig } from './config';

// Cliente do Mercado Pago
class MercadoPagoClient {
  private config: any;
  private initialized = false;

  constructor() {
    this.config = {
      accessToken: MERCADO_PAGO_CONFIG.accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    };
  }

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
      
      const MercadoPago = (await import('mercadopago')).default;
      const mp = new MercadoPago(this.config);

      // Garantir que as URLs estão definidas
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      
      // Definir URLs de retorno obrigatórias
      const backUrls = {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      };
      
      // Verificar se as URLs são válidas
      if (!backUrls.success || !backUrls.failure || !backUrls.pending) {
        throw new Error('URLs de retorno não configuradas corretamente');
      }

      const preference = await mp.preferences.create({
        body: {
          ...preferenceData,
          back_urls: backUrls,
          auto_return: 'approved',
          payment_methods: {
            ...preferenceData.payment_methods,
            installments: MERCADO_PAGO_CONFIG.installments.max
          }
        }
      });

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
      
      const MercadoPago = (await import('mercadopago')).default;
      const mp = new MercadoPago(this.config);

      const payment = await mp.payment.get(paymentId);
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

