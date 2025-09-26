# Deploy Manual via GitHub no Vercel

## Método: Painel do Vercel + GitHub

### 1. Acessar o Painel do Vercel

1. **Abra o navegador** e acesse: [vercel.com](https://vercel.com)
2. **Faça login** com sua conta (mesma conta do GitHub)
3. **Clique em "New Project"** ou **"Add New..."**

### 2. Importar Projeto do GitHub

#### Passo 1: Conectar GitHub
- **Clique em "Import Git Repository"**
- **Selecione "GitHub"** como provedor
- **Autorize** o acesso ao GitHub se necessário

#### Passo 2: Escolher Repositório
- **Procure por**: `wr-site-completo` ou o nome do seu repositório
- **Clique em "Import"** no repositório correto

### 3. Configurar o Projeto

#### Configurações Automáticas (deixar como está):
- **Framework Preset**: Vite (detectado automaticamente)
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `dist` (automático)
- **Install Command**: `npm install` (automático)

#### Configurações Opcionais:
- **Project Name**: `wr-capacetes-site` (ou o nome que preferir)
- **Team**: Sua conta pessoal

### 4. Configurar Variáveis de Ambiente

**IMPORTANTE**: Configure as variáveis ANTES do primeiro deploy:

#### No painel do Vercel, vá para:
**Settings > Environment Variables**

#### Adicione estas variáveis (uma por vez):

```
VITE_SUPABASE_URL
Valor: https://fflomlvtgaqbzrjnvqaz.supabase.co
Ambientes: Production, Preview, Development

VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4
Ambientes: Production, Preview, Development

VITE_MERCADO_PAGO_ACCESS_TOKEN
Valor: TEST-1234567890-abcdef-1234567890abcdef-12345678
Ambientes: Production, Preview, Development

VITE_MERCADO_PAGO_PUBLIC_KEY
Valor: sua-chave-publica-mercado-pago
Ambientes: Production, Preview, Development

VITE_MERCADO_PAGO_WEBHOOK_URL
Valor: https://seu-dominio.vercel.app/api/mercadopago/webhook
Ambientes: Production, Preview, Development

VITE_API_BASE_URL
Valor: https://seu-dominio.vercel.app
Ambientes: Production, Preview, Development

VITE_APP_URL
Valor: https://seu-dominio.vercel.app
Ambientes: Production, Preview, Development
```

### 5. Fazer o Deploy

#### Opção A: Deploy Automático
- **Clique em "Deploy"**
- **Aguarde** o build ser concluído (2-3 minutos)
- **Acesse** a URL fornecida

#### Opção B: Deploy Manual (se necessário)
- **Vá para**: Deployments
- **Clique em**: "Redeploy" na última versão
- **Ou**: "Deploy" para forçar novo deploy

### 6. Verificar o Deploy

#### Após o deploy:
1. **Acesse** a URL fornecida pelo Vercel
2. **Abra F12** (console do navegador)
3. **Verifique** se não há erros de MIME type
4. **Teste** a navegação entre páginas

### 7. Configurações Adicionais

#### Domínio Personalizado (Opcional):
- **Vá para**: Settings > Domains
- **Adicione** seu domínio personalizado
- **Configure** os registros DNS conforme instruído

#### Monitoramento:
- **Analytics**: Disponível no painel
- **Logs**: Functions > Logs para debug
- **Performance**: Speed Insights automático

## Troubleshooting

### Se o Deploy Falhar:

#### 1. Verificar Logs
- **Vá para**: Deployments > [último deploy] > Logs
- **Procure por**: erros específicos
- **Verifique**: se as variáveis estão configuradas

#### 2. Verificar Build Local
```bash
npm run build
# Deve funcionar sem erros
```

#### 3. Verificar Variáveis
- **Confirme** que todas as variáveis estão configuradas
- **Verifique** se estão em todos os ambientes (Production, Preview, Development)

### Se o Site Não Carregar:

#### 1. Aguardar Propagação
- **Aguarde** 2-3 minutos após o deploy
- **Limpe** o cache do navegador (Ctrl+Shift+R)

#### 2. Verificar Console
- **Abra F12** e verifique erros
- **Procure** por erros de MIME type
- **Verifique** se as variáveis estão sendo carregadas

### Se Houver Erros de MIME Type:

#### 1. Verificar Configuração
- **Confirme** que não há `vercel.json` conflitante
- **Verifique** se o `_redirects` está correto

#### 2. Redeploy
- **Vá para**: Deployments
- **Clique em**: "Redeploy" para forçar novo build

## Vantagens do Deploy via GitHub

1. **Integração automática**: Cada push faz deploy automático
2. **Histórico de versões**: Pode reverter para versões anteriores
3. **Configuração visual**: Interface amigável
4. **Monitoramento**: Logs e analytics integrados
5. **Domínios**: Fácil configuração de domínios personalizados

## Próximos Passos

1. **Acesse**: [vercel.com](https://vercel.com)
2. **Importe**: Seu repositório GitHub
3. **Configure**: Variáveis de ambiente
4. **Deploy**: Clique em "Deploy"
5. **Teste**: Acesse a URL fornecida

## Status Atual

- ✅ Repositório no GitHub atualizado
- ✅ Configuração simplificada implementada
- ✅ Build local funcionando
- ⏳ Aguardando configuração no painel do Vercel
- ⏳ Deploy manual via GitHub em andamento

Este método deve resolver definitivamente os problemas de deploy! 🚀
