// Verificar se as variáveis de ambiente estão configuradas
export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_MERCADO_PAGO_ACCESS_TOKEN',
    'VITE_MERCADO_PAGO_PUBLIC_KEY'
  ];

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('seu_') || value.includes('aqui') || value.includes('exemplo')) {
      invalidVars.push(varName);
    }
  });

  return {
    isValid: missingVars.length === 0 && invalidVars.length === 0,
    missingVars,
    invalidVars,
    allVars: requiredVars.map(varName => ({
      name: varName,
      value: import.meta.env[varName],
      isSet: !!import.meta.env[varName],
      isValid: !import.meta.env[varName]?.includes('seu_') && !import.meta.env[varName]?.includes('aqui')
    }))
  };
};
