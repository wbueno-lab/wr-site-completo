
# Solução para Problemas de Deploy no Vercel

## Problemas Identificados e Corrigidos

### 1. ✅ Arquivo `index.html` ausente
- **Problema**: O Vite não conseguia encontrar o arquivo de entrada
- **Solução**: Criado o arquivo `index.html` com configurações adequadas

### 2. ✅ Configuração complexa do `vercel.json`
- **Problema**: Configurações muito complexas causando conflitos
- **Solução**: Simplificado para configuração mínima necessária

### 3. ✅ Arquivo `LogoutTestPage.tsx` ausente
- **Problema**: Importação de arquivo inexistente
- **Solução**: Criado o arquivo baseado no componente existente

### 4. ✅ Scripts de build conflitantes
- **Problema**: Scripts desnecessários no package.json
- **Solução**: Limpeza dos scripts e adição do `vercel-build`

## Configurações Finais

### vercel.json (Simplificado)
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/admin",
      "dest": "/index.html"
    },
    {
      "src": "/contato",
      "dest": "/index.html"
    },
    {
      "src": "/catalogo",
      "dest": "/index.html"
    },
    {
      "src": "/promocoes",
      "dest": "/index.html"
    },
    {
      "src": "/favoritos",
      "dest": "/index.html"
    },
    {
      "src": "/pedidos",
      "dest": "/index.html"
    },
    {
      "src": "/auth",
      "dest": "/index.html"
    },
    {
      "src": "/produto/(.*)",
      "dest": "/index.html"
    },
    {
      "src": "/checkout/(.*)",
      "dest": "/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### package.json (Scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:vercel": "vite build --mode production",
    "lint": "eslint .",
    "preview": "vite preview",
    "vercel-build": "vite build"
  }
}
```

## Próximos Passos

### 1. Fazer Commit das Alterações
```bash
git add .
git commit -m "fix: simplificar configuração do Vercel para resolver deploy"
git push origin main
```

### 2. Configurar Variáveis de Ambiente no Vercel
No painel do Vercel, vá para **Settings > Environment Variables** e adicione:

```
VITE_SUPABASE_URL=https://fflomlvtgaqbzrjnvqaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-1234567890abcdef-12345678
VITE_MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-mercado-pago
VITE_MERCADO_PAGO_WEBHOOK_URL=https://seu-dominio.vercel.app/api/mercadopago/webhook
VITE_API_BASE_URL=https://seu-dominio.vercel.app
VITE_APP_URL=https://seu-dominio.vercel.app
```

### 3. Configurações do Projeto no Vercel
- **Framework Preset**: Vite (detecção automática)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Se o Deploy Ainda Falhar

#### Opção A: Deploy Manual
1. Acesse o painel do Vercel
2. Vá para o projeto
3. Clique em "Redeploy" na última versão

#### Opção B: Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

#### Opção C: Verificar Logs
1. No painel do Vercel, vá para "Functions" > "Logs"
2. Verifique os logs de build para identificar erros específicos

## Troubleshooting Adicional

### Se o Build Falhar no Vercel
1. Verifique se todas as dependências estão no `package.json`
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique se o Node.js está na versão 18.x ou superior
4. Certifique-se de que não há erros de TypeScript

### Se o Site Não Carregar
1. Verifique se as rotas estão configuradas corretamente
2. Confirme se o `index.html` está sendo servido corretamente
3. Verifique se as variáveis de ambiente estão sendo carregadas

### Se Houver Erros de CORS
1. Verifique se as URLs do Supabase estão corretas
2. Confirme se as variáveis de ambiente estão sendo carregadas
3. Verifique se o CSP está configurado corretamente

## Status Atual
- ✅ Build local funcionando
- ✅ Arquivos de configuração corrigidos
- ✅ Scripts de build otimizados
- ✅ Rotas configuradas corretamente
- ⏳ Aguardando deploy no Vercel
