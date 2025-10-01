// Configuração do Mercado Pago
import { ENV } from '@/config/env';

export const MERCADO_PAGO_CONFIG = {
  // Public Key - usado no frontend
  publicKey: ENV.MERCADO_PAGO_PUBLIC_KEY || '',
  
  // Access Token - usado no backend (Edge Functions)
  accessToken: ENV.MERCADO_PAGO_ACCESS_TOKEN || '',
  
  // Configurações de ambiente
  isProduction: !ENV.IS_DEVELOPMENT,
  
  // URLs de retorno
  urls: {
    success: `${window.location.origin}/checkout/success`,
    failure: `${window.location.origin}/checkout/failure`,
    pending: `${window.location.origin}/checkout/pending`
  },
  
  // Configurações de pagamento
  payment: {
    statementDescriptor: 'WR CAPACETES',
    installments: 12,
    minInstallmentAmount: 5.00
  }
};

// Validar configuração
export function validateMercadoPagoConfig(): boolean {
  if (!MERCADO_PAGO_CONFIG.publicKey) {
    console.warn('⚠️ VITE_MERCADO_PAGO_PUBLIC_KEY não configurada');
    return false;
  }
  
  if (!MERCADO_PAGO_CONFIG.accessToken) {
    console.warn('⚠️ VITE_MERCADO_PAGO_ACCESS_TOKEN não configurada');
    return false;
  }
  
  return true;
}

// Verificar se está configurado
export const isMercadoPagoConfigured = validateMercadoPagoConfig();


