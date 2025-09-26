# Guia de Deploy para Vercel

## Pré-requisitos

1. Conta no Vercel (gratuita)
2. Projeto conectado ao GitHub
3. Variáveis de ambiente configuradas

## Passos para Deploy

### 1. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe seu repositório do GitHub

### 2. Configurar Build Settings

O Vercel detectará automaticamente que é um projeto Vite. As configurações serão:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

No painel do Vercel, vá para Settings > Environment Variables e adicione:

```
VITE_SUPABASE_URL=https://fflomlvtgaqbzrjnvqaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-1234567890abcdef-12345678
VITE_MERCADO_PAGO_WEBHOOK_URL=https://your-domain.vercel.app/api/mercadopago/webhook
VITE_API_BASE_URL=https://your-domain.vercel.app
VITE_APP_URL=https://your-domain.vercel.app
```

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build ser concluído
3. Seu site estará disponível na URL fornecida

## Configurações Adicionais

### Domínio Personalizado

1. Vá para Settings > Domains
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído

### Edge Functions (Opcional)

Se você quiser usar Edge Functions do Vercel:

1. Crie uma pasta `api/` na raiz do projeto
2. Adicione suas funções serverless
3. O Vercel detectará automaticamente

## Monitoramento

- **Analytics**: Disponível no painel do Vercel
- **Logs**: Acesse Functions > Logs para ver logs em tempo real
- **Performance**: Use o Vercel Speed Insights

## Troubleshooting

### Build Falha

1. Verifique se todas as dependências estão no `package.json`
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique os logs de build no painel do Vercel

### Erro de CORS

1. Verifique se as URLs do Supabase estão corretas
2. Confirme se o CSP está configurado no `vercel.json`

### Performance

1. Use o Vercel Speed Insights
2. Otimize imagens com `next/image` ou similar
3. Configure cache headers no `vercel.json`

## Comandos Úteis

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy local
vercel

# Deploy para produção
vercel --prod

# Ver logs
vercel logs
```

## Suporte

- [Documentação do Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/guides/deploying-vitejs-to-vercel)
- [Supabase + Vercel](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
