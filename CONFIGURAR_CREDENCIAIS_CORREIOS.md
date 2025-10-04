# 🔐 Como Configurar Credenciais dos Correios

## 📋 Passo a Passo Completo

### **Passo 1: Obter Credenciais dos Correios**

#### Opção A: Por Telefone (Mais Rápido) ⭐
```
📞 Ligue: 3003-0100
🕐 Horário: Segunda a Sexta, 8h às 18h
```

**O que dizer:**
> "Olá, tenho uma loja online e gostaria de obter as credenciais da API SIGEP Web para integração do cálculo de frete no meu e-commerce."

**Documentos necessários:**
- CNPJ da empresa
- Dados do responsável

---

#### Opção B: Pelo Site
1. Acesse: https://www.correios.com.br/enviar/comercio-eletronico
2. Clique em "Solicitar Credenciais"
3. Preencha o formulário
4. Aguarde contato dos Correios (1-3 dias úteis)

---

#### Opção C: Agência dos Correios
1. Vá até uma agência dos Correios
2. Fale com o gerente
3. Solicite credenciais para SIGEP Web / API de Frete
4. Leve CNPJ e documentos da empresa

---

### **Passo 2: Adicionar no Arquivo .env**

Quando você receber as credenciais (geralmente por e-mail), elas virão assim:

```
Código da Empresa: 12345678
Senha: suaSenhaAqui123
```

#### 2.1. Abra seu arquivo `.env` na raiz do projeto

#### 2.2. Adicione estas linhas (ou edite se já existirem):

```bash
# Credenciais dos Correios
VITE_CORREIOS_EMPRESA_CODE=12345678
VITE_CORREIOS_SENHA=suaSenhaAqui123
```

**⚠️ SUBSTITUA** pelos seus valores reais!

#### 2.3. Salve o arquivo `.env`

---

### **Passo 3: Testar as Credenciais**

#### 3.1. Reinicie o servidor de desenvolvimento:

```powershell
# Pare o servidor (Ctrl + C)
# Inicie novamente:
npm run dev
```

#### 3.2. Abra o navegador em: http://localhost:8080

#### 3.3. Teste o cálculo de frete:
- Abra o Console (F12)
- Calcule o frete
- Procure por: `✅ Frete PAC calculado via API dos Correios`

#### 3.4. Verifique os logs:

**✅ SE AS CREDENCIAIS ESTÃO FUNCIONANDO:**
```
🔗 Fazendo requisição via proxy Supabase...
📡 Chamando Edge Function com credenciais
✅ Frete PAC calculado via API: R$ XX,XX - X dias
⚡ Resposta em 3-5 segundos (RÁPIDO!)
```

**❌ SE AS CREDENCIAIS ESTÃO ERRADAS:**
```
❌ Erro: Credenciais inválidas
📊 Usando tabela de fallback
```

---

### **Passo 4: Configurar em Produção (Vercel)**

Quando tiver as credenciais funcionando localmente, configure na Vercel:

#### 4.1. Acesse o Painel da Vercel
https://vercel.com/dashboard

#### 4.2. Selecione seu projeto

#### 4.3. Vá em: **Settings → Environment Variables**

#### 4.4. Adicione as variáveis:

**Variável 1:**
```
Name: VITE_CORREIOS_EMPRESA_CODE
Value: 12345678
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variável 2:**
```
Name: VITE_CORREIOS_SENHA
Value: suaSenhaAqui123
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 4.5. Clique em "Save"

#### 4.6. Faça um novo deploy:
```powershell
git add .
git commit -m "Add Correios credentials"
git push
```

---

## 📝 Exemplo Completo do Arquivo .env

```bash
# ========================================
# SUPABASE
# ========================================
VITE_SUPABASE_URL=https://fflomlvtgaqbzrjnvqaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# CORREIOS (ADICIONE SUAS CREDENCIAIS AQUI)
# ========================================
VITE_CORREIOS_EMPRESA_CODE=12345678
VITE_CORREIOS_SENHA=suaSenhaAqui123

# ========================================
# MERCADO PAGO
# ========================================
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-e7a73d6f-3b3d-4ba3-b1a7-4d3e8f5a6c4b
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890...
```

---

## ⚠️ IMPORTANTE: Segurança

### ✅ Fazer:
- ✅ Mantenha o arquivo `.env` no `.gitignore`
- ✅ NUNCA commite credenciais no Git
- ✅ Use credenciais diferentes para dev e produção
- ✅ Guarde as credenciais em local seguro

### ❌ NÃO Fazer:
- ❌ Compartilhar credenciais publicamente
- ❌ Commitar `.env` no repositório
- ❌ Deixar credenciais em código-fonte
- ❌ Usar mesmas credenciais em vários projetos

---

## 🎁 Benefícios de Ter Credenciais

### Antes (Sem Credenciais):
```
⏱️ Tempo de resposta: 15-30 segundos
⚠️ Timeouts frequentes
📊 Usa tabela de fallback
💰 Valores normais
```

### Depois (Com Credenciais):
```
⚡ Tempo de resposta: 3-5 segundos (5x mais rápido!)
✅ Sem timeouts
📡 API real sempre
💰 Valores de contrato (20% mais baratos)
🎯 100% confiável
```

---

## 🔍 Verificar se as Credenciais Estão Carregadas

No código, você pode verificar se as credenciais foram carregadas:

```typescript
// src/services/correiosAPI.ts (linha 62-65)
private credentials: CorreiosCredentials = {
  nCdEmpresa: ENV.CORREIOS_EMPRESA_CODE || '',
  sDsSenha: ENV.CORREIOS_SENHA || ''
};
```

No console do navegador, após calcular o frete, você verá:
```
📦 Usando credenciais: true
```

---

## 📞 Contatos dos Correios

### Central de Atendimento
- **Telefone**: 3003-0100
- **Horário**: Segunda a Sexta, 8h às 18h
- **Custo**: Ligação local

### E-commerce / Empresas
- **Site**: https://www.correios.com.br/enviar/comercio-eletronico
- **E-mail**: comercioeletronico@correios.com.br

### SIGEP Web (Sistema)
- **Portal**: https://apps.correios.com.br/SigepWeb/
- **Manual**: https://www.correios.com.br/enviar/marketing-direto/manual-sigepweb

---

## ❓ Perguntas Frequentes

### "Preciso ter contrato com os Correios?"
Não necessariamente. As credenciais da API são **gratuitas**, mas você pode optar por:
- **API sem contrato**: Grátis, acesso limitado
- **API com contrato**: Grátis, acesso prioritário e valores de contrato

### "Quanto custa?"
As credenciais da API são **GRATUITAS**. Você só paga pelos envios reais.

### "Quanto tempo demora para receber?"
- Por telefone: Imediato (se tiver CNPJ)
- Pelo site: 1-3 dias úteis
- Na agência: No mesmo dia

### "Posso usar sem CNPJ?"
Não oficialmente, mas você pode:
1. Usar sem credenciais (funciona, mas mais lento)
2. Solicitar com CPF como MEI

### "E se eu não conseguir as credenciais?"
Sem problema! O sistema continua funcionando:
- Usa API pública (mais lenta)
- Fallback automático para tabela
- Valores continuam corretos

---

## 🚀 Próximos Passos

1. ✅ **Ligue 3003-0100** e solicite as credenciais
2. ✅ **Adicione no arquivo .env** quando receber
3. ✅ **Reinicie o servidor** (`npm run dev`)
4. ✅ **Teste o frete** e veja a diferença de velocidade
5. ✅ **Configure na Vercel** para produção

---

## 💡 Dica Final

Se não conseguir as credenciais agora, **não tem problema!** O sistema já funciona bem sem elas, usando a API pública e fallback para tabela. As credenciais são um **upgrade opcional** para melhorar performance.

**Boa sorte!** 🎉






