import { ENV } from '@/config/env';

// Configuração do Mercado Pago
export const MERCADO_PAGO_CONFIG = {
  // Token de acesso (substitua pelo seu token real)
  accessToken: ENV.MERCADO_PAGO_ACCESS_TOKEN,
  
  // Configurações de pagamento
  currency: 'BRL',
  country: 'BR',
  
  // Configurações de parcelamento
  installments: {
    min: 1,
    max: 12,
    default: 1
  },
  
  // Métodos de pagamento permitidos
  paymentMethods: {
    credit_card: true,
    debit_card: true,
    pix: true,
    boleto: true,
    bank_transfer: false
  },
  
  // URLs de retorno
  returnUrls: {
    success: '/checkout/success',
    failure: '/checkout/failure',
    pending: '/checkout/pending'
  },
  
  // Configurações de notificação
  notificationUrl: ENV.MERCADO_PAGO_WEBHOOK_URL,
  
  // Configurações de ambiente
  environment: ENV.IS_PRODUCTION ? 'production' : 'sandbox',
  
  // URLs base da API
  apiUrls: {
    sandbox: 'https://api.mercadopago.com',
    production: 'https://api.mercadopago.com'
  },
  
  // Configurações de timeout
  timeout: 10000,
  
  // Configurações de retry
  retry: {
    attempts: 3,
    delay: 1000
  }
};

// Validar configuração
export const validateMercadoPagoConfig = () => {
  if (!MERCADO_PAGO_CONFIG.accessToken) {
    throw new Error('Token de acesso do Mercado Pago não configurado');
  }
  
  if (MERCADO_PAGO_CONFIG.accessToken.startsWith('TEST-') && MERCADO_PAGO_CONFIG.environment === 'production') {
    throw new Error('Token de teste não pode ser usado em produção');
  }
  
  if (!MERCADO_PAGO_CONFIG.accessToken.startsWith('TEST-') && MERCADO_PAGO_CONFIG.environment === 'sandbox') {
    console.warn('Token de produção sendo usado em ambiente de sandbox');
  }
  
  return true;
};

// Configurações de cartões de teste
export const TEST_CARDS = {
  visa: {
    number: '4000 0000 0000 0002',
    cvv: '123',
    expiry: '12/25',
    name: 'APRO'
  },
  mastercard: {
    number: '5000 0000 0000 0002',
    cvv: '123',
    expiry: '12/25',
    name: 'APRO'
  },
  amex: {
    number: '3753 651535 56885',
    cvv: '1234',
    expiry: '12/25',
    name: 'APRO'
  },
  rejected: {
    number: '4000 0000 0000 0003',
    cvv: '123',
    expiry: '12/25',
    name: 'OTHE'
  }
};

// Status de pagamento
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  AUTHORIZED: 'authorized',
  IN_PROCESS: 'in_process',
  IN_MEDIATION: 'in_mediation',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGED_BACK: 'charged_back'
} as const;

// Mensagens de status
export const PAYMENT_STATUS_MESSAGES = {
  [PAYMENT_STATUS.PENDING]: 'Pagamento pendente',
  [PAYMENT_STATUS.APPROVED]: 'Pagamento aprovado',
  [PAYMENT_STATUS.AUTHORIZED]: 'Pagamento autorizado',
  [PAYMENT_STATUS.IN_PROCESS]: 'Pagamento em processamento',
  [PAYMENT_STATUS.IN_MEDIATION]: 'Pagamento em mediação',
  [PAYMENT_STATUS.REJECTED]: 'Pagamento rejeitado',
  [PAYMENT_STATUS.CANCELLED]: 'Pagamento cancelado',
  [PAYMENT_STATUS.REFUNDED]: 'Pagamento estornado',
  [PAYMENT_STATUS.CHARGED_BACK]: 'Pagamento contestado'
} as const;