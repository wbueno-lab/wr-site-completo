# Configuração de Variáveis de Ambiente para Vercel

## Variáveis que devem ser configuradas no painel do Vercel:

### Supabase
```
VITE_SUPABASE_URL=https://fflomlvtgaqbzrjnvqaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4
```

### Mercado Pago
```
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-1234567890abcdef-12345678
VITE_MERCADO_PAGO_WEBHOOK_URL=https://your-domain.vercel.app/api/mercadopago/webhook
```

### URLs de Produção
```
VITE_API_BASE_URL=https://your-domain.vercel.app
VITE_APP_URL=https://your-domain.vercel.app
```

## Como configurar no Vercel:

1. Acesse o painel do Vercel
2. Vá para Settings > Environment Variables
3. Adicione cada variável acima
4. Certifique-se de que estão habilitadas para Production, Preview e Development

## Notas importantes:

- Substitua `your-domain.vercel.app` pela URL real do seu projeto
- Configure as chaves do Mercado Pago com suas credenciais reais
- As variáveis do Supabase já estão configuradas com valores padrão
