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

**Variáveis Obrigatórias:**
```
VITE_SUPABASE_URL=https://fflomlvtgaqbzrjnvqaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-1234567890abcdef-12345678
VITE_MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-mercado-pago
VITE_MERCADO_PAGO_WEBHOOK_URL=https://seu-dominio.vercel.app/api/mercadopago/webhook
VITE_API_BASE_URL=https://seu-dominio.vercel.app
VITE_APP_URL=https://seu-dominio.vercel.app
```

**Importante:** 
- Substitua `seu-dominio.vercel.app` pela URL real do seu projeto
- Configure as chaves do Mercado Pago com suas credenciais reais
- Todas as variáveis devem estar configuradas para os ambientes Production, Preview e Development

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

**Problema:** "Build failed" ou "Deployment failed"

**Soluções:**
1. Verifique se todas as dependências estão no `package.json`
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique os logs de build no painel do Vercel
4. Certifique-se de que o Node.js está na versão 18.x ou superior
5. Verifique se não há erros de TypeScript no projeto

### Erro de CORS

**Problema:** Erros de CORS no console do navegador

**Soluções:**
1. Verifique se as URLs do Supabase estão corretas
2. Confirme se o CSP está configurado no `vercel.json`
3. Verifique se as variáveis de ambiente estão sendo carregadas corretamente

### Variáveis de Ambiente

**Problema:** "Environment variables not found"

**Soluções:**
1. Certifique-se de que todas as variáveis VITE_* estão configuradas
2. Verifique se as variáveis estão configuradas para todos os ambientes (Production, Preview, Development)
3. Reinicie o deploy após adicionar novas variáveis

### Performance

1. Use o Vercel Speed Insights
2. Otimize imagens com `next/image` ou similar
3. Configure cache headers no `vercel.json`

### Comandos de Debug

```bash
# Verificar se o build funciona localmente
npm run build

# Verificar variáveis de ambiente
npm run dev

# Testar preview local
npm run preview
```

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
