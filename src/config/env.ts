// Configuração de variáveis de ambiente para o cliente
// Este arquivo centraliza todas as variáveis de ambiente usadas no frontend

export const ENV = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://fflomlvtgaqbzrjnvqaz.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4',
  
  // Mercado Pago
  MERCADO_PAGO_ACCESS_TOKEN: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'TEST-1234567890-abcdef-1234567890abcdef-12345678',
  MERCADO_PAGO_WEBHOOK_URL: import.meta.env.VITE_MERCADO_PAGO_WEBHOOK_URL || 'https://your-domain.com/api/mercadopago/webhook',
  
  // Ambiente
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  
  // URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
} as const;

// Validação das variáveis de ambiente obrigatórias
export const validateEnv = () => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !ENV[varName as keyof typeof ENV]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variáveis de ambiente ausentes:', missing);
  }
  
  return missing.length === 0;
};

// Inicializar validação
validateEnv();

