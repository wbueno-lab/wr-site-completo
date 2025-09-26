# Deploy Manual no Vercel

## Situação Atual

O Vercel CLI está detectando que o projeto foi deletado, transferido ou você não tem mais acesso. Vamos configurar um novo projeto.

## Passos para Deploy Manual

### 1. ✅ Vercel CLI Instalado
```bash
npm install -g vercel
# ✅ Concluído
```

### 2. ✅ Login Realizado
```bash
vercel login
# ✅ Concluído - você fez login com sucesso
```

### 3. 🔄 Configurar Novo Projeto

Quando o Vercel perguntar:
```
? Set up and deploy "~\OneDrive\Desktop\Wr capacetes site 2 banco de dados"? (Y/n)
```

**Responda: `Y` (Yes)**

### 4. Configurações do Projeto

O Vercel vai fazer algumas perguntas. Responda assim:

#### Pergunta 1: "Which scope do you want to deploy to?"
- **Escolha**: Sua conta pessoal (ou a conta que você quer usar)

#### Pergunta 2: "Link to existing project?"
- **Responda**: `N` (No) - queremos criar um novo projeto

#### Pergunta 3: "What's your project's name?"
- **Sugestão**: `wr-capacetes-site` ou `wr-capacetes-loja`

#### Pergunta 4: "In which directory is your code located?"
- **Responda**: `./` (diretório atual)

#### Pergunta 5: "Want to override the settings?"
- **Responda**: `N` (No) - deixar detecção automática

### 5. Deploy Automático

Após as configurações, o Vercel vai:
1. **Detectar** que é um projeto Vite
2. **Instalar** dependências (`npm install`)
3. **Fazer build** (`npm run build`)
4. **Deploy** para produção
5. **Fornecer** a URL do site

## Configurações Automáticas do Vercel

O Vercel detectará automaticamente:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x (automático)

## Variáveis de Ambiente

Após o deploy, você precisará configurar as variáveis de ambiente:

### No Painel do Vercel:
1. Acesse o projeto no painel do Vercel
2. Vá para **Settings > Environment Variables**
3. Adicione as variáveis:

```
VITE_SUPABASE_URL=https://fflomlvtgaqbzrjnvqaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-1234567890abcdef-12345678
VITE_MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-mercado-pago
VITE_MERCADO_PAGO_WEBHOOK_URL=https://seu-dominio.vercel.app/api/mercadopago/webhook
VITE_API_BASE_URL=https://seu-dominio.vercel.app
VITE_APP_URL=https://seu-dominio.vercel.app
```

## Comandos Alternativos

### Se Quiser Usar o Projeto Existente:
```bash
# Listar projetos existentes
vercel ls

# Linkar a um projeto existente
vercel link

# Deploy para produção
vercel --prod
```

### Se Quiser Deploy de Preview:
```bash
# Deploy de preview (não produção)
vercel
```

## Troubleshooting

### Se o Deploy Falhar:
1. **Verificar logs**: O Vercel CLI mostra logs detalhados
2. **Verificar variáveis**: Certifique-se de que estão configuradas
3. **Verificar build local**: `npm run build` deve funcionar

### Se Houver Erro de Permissão:
```bash
# Fazer logout e login novamente
vercel logout
vercel login
```

### Se o Projeto Não Aparecer:
```bash
# Listar todos os projetos
vercel ls

# Verificar status
vercel status
```

## Vantagens do Deploy Manual

1. **Controle total**: Você vê cada passo do processo
2. **Logs detalhados**: Pode identificar problemas específicos
3. **Configuração personalizada**: Pode ajustar configurações
4. **Debugging**: Mais fácil identificar onde está o problema

## Próximos Passos

1. **Execute**: `vercel` no terminal
2. **Responda**: `Y` para configurar novo projeto
3. **Configure**: Nome e diretório do projeto
4. **Aguarde**: Deploy automático
5. **Configure**: Variáveis de ambiente no painel
6. **Teste**: Acesse a URL fornecida

## Status Atual

- ✅ Vercel CLI instalado
- ✅ Login realizado
- ✅ Projeto pronto para configuração
- ⏳ Aguardando configuração do projeto
- ⏳ Deploy manual em andamento

O deploy manual deve resolver os problemas que estávamos enfrentando! 🚀
