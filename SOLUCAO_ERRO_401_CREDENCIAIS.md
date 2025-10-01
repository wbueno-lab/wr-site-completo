# 🔐 Solução: Erro 401 - Credenciais Inválidas

## ❌ Problema Identificado

**Erro nos logs:**
```
Status: 401 - Unauthorized
Code: 7
Description: Unauthorized
```

**Causa:** O `MERCADO_PAGO_ACCESS_TOKEN` configurado no Supabase está **inválido, expirado ou incorreto**.

---

## ✅ Solução: Configurar Credenciais Corretas

### Opção 1: Usar Script Automático (RECOMENDADO)

Execute este comando no PowerShell:

```powershell
cd "C:\Users\wessi\OneDrive\Desktop\Wr capacetes site 2 banco de dados"
.\configurar-credenciais-mercadopago.ps1
```

O script vai:
1. ✅ Pedir suas credenciais do Mercado Pago
2. ✅ Detectar automaticamente se são de teste ou produção
3. ✅ Configurar no Supabase
4. ✅ Verificar se foi aplicado

---

### Opção 2: Configurar Manualmente

#### Passo 1: Obter Credenciais do Mercado Pago

1. **Acesse:** https://www.mercadopago.com.br/developers/panel/app

2. **Clique em sua aplicação** (ou crie uma nova)

3. **Escolha o tipo de credencial:**

   **Para TESTES (Recomendado para começar):**
   - Clique em **"Credenciais de teste"**
   - Copie a **Public Key de teste** (começa com `TEST-...`)
   - Copie o **Access Token de teste** (começa com `TEST-...`)

   **Para PRODUÇÃO (Pagamentos reais):**
   - Clique em **"Credenciais de produção"**
   - Copie a **Public Key** (começa com `APP-...`)
   - Copie o **Access Token** (começa com `APP-...`)

#### Passo 2: Configurar no Supabase via CLI

```powershell
cd "C:\Users\wessi\OneDrive\Desktop\Wr capacetes site 2 banco de dados"

# Configurar Public Key
supabase secrets set MERCADO_PAGO_PUBLIC_KEY="SUA_PUBLIC_KEY_AQUI"

# Configurar Access Token
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN="SEU_ACCESS_TOKEN_AQUI"

# Verificar
supabase secrets list
```

#### Passo 3: Configurar no Supabase via Dashboard

1. **Acesse:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions

2. **Vá em "Edge Functions" > "Secrets"**

3. **Edite ou adicione:**
   - Nome: `MERCADO_PAGO_PUBLIC_KEY`
   - Valor: Sua Public Key (TEST-... ou APP-...)

4. **Edite ou adicione:**
   - Nome: `MERCADO_PAGO_ACCESS_TOKEN`
   - Valor: Seu Access Token (TEST-... ou APP-...)

5. **Clique em "Save"**

---

## 🧪 Testar

### Passo 1: Aguardar 1-2 minutos

As variáveis de ambiente levam um tempinho para serem aplicadas às Edge Functions.

### Passo 2: Limpar Cache

```
Ctrl + Shift + Delete
```

Ou botão direito em Recarregar > "Esvaziar cache e recarregar forçado"

### Passo 3: Testar o PIX

1. Acesse o site
2. Adicione produtos ao carrinho
3. Vá até o checkout
4. Selecione "PIX"
5. Clique em "Gerar Código PIX"

### Passo 4: Verificar Logs

Acesse: https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/functions

Clique em "mercado-pago-process-payment" > Aba "Logs"

**Agora deve aparecer:**
```
✅ Pagamento processado: { id: 12345..., status: "pending" }
```

**Ao invés de:**
```
❌ Erro na API do Mercado Pago (Status: 401)
```

---

## 🔍 Diferença entre Credenciais de Teste e Produção

### 🧪 Credenciais de TESTE

**Quando usar:**
- ✅ Durante desenvolvimento
- ✅ Para testar fluxos de pagamento
- ✅ Sem medo de cobranças reais

**Características:**
- Começam com `TEST-...`
- Não processam dinheiro real
- Podem usar cartões de teste
- Não precisam de aprovação do Mercado Pago

### 💰 Credenciais de PRODUÇÃO

**Quando usar:**
- ✅ Site em produção
- ✅ Para receber pagamentos reais
- ✅ Depois de testar tudo

**Características:**
- Começam com `APP-...`
- Processam dinheiro real
- Precisam de cartões reais
- Conta precisa estar aprovada

---

## 🎯 Checklist de Verificação

Antes de testar, confirme:

- [ ] Obteve credenciais do Mercado Pago
- [ ] Configurou `MERCADO_PAGO_PUBLIC_KEY` no Supabase
- [ ] Configurou `MERCADO_PAGO_ACCESS_TOKEN` no Supabase
- [ ] Aguardou 1-2 minutos
- [ ] Limpou o cache do navegador
- [ ] Tentou gerar PIX novamente
- [ ] Verificou os logs no Dashboard

---

## 💡 Dicas Importantes

### 1. Use Credenciais de Teste Primeiro

Sempre comece com credenciais de teste para evitar problemas.

### 2. Mantenha as Credenciais Seguras

Nunca commit credenciais no Git. Use apenas variáveis de ambiente.

### 3. Troque Credenciais Periodicamente

Por segurança, gere novas credenciais a cada 6 meses.

### 4. Diferentes Ambientes

Se você tiver staging/produção, use credenciais diferentes para cada um.

---

## 🆘 Troubleshooting

### Erro: "supabase: command not found"

```powershell
& "$env:USERPROFILE\scoop\shims\supabase.exe" secrets set ...
```

### Erro: "not logged in"

```powershell
supabase login
```

### Erro: "project not linked"

```powershell
supabase link --project-ref fflomlvtgaqbzrjnvqaz
```

### Ainda dá erro 401

1. Verifique se as credenciais estão corretas
2. Tente gerar novas credenciais no Mercado Pago
3. Confirme que você está usando o mesmo tipo (teste com teste, prod com prod)
4. Aguarde mais 2-3 minutos após configurar

---

## 📚 Links Úteis

- **Dashboard Mercado Pago:** https://www.mercadopago.com.br/developers/panel/app
- **Dashboard Supabase Functions:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions
- **Logs das Edge Functions:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/functions
- **Documentação Mercado Pago:** https://www.mercadopago.com.br/developers/pt/docs

---

## ✅ Depois de Configurar

Com as credenciais corretas configuradas:

1. ✅ O erro 401 vai sumir
2. ✅ O PIX será gerado com sucesso
3. ✅ Você verá o QR Code e o código PIX
4. ✅ Poderá testar pagamentos

**Próximo passo:** Execute o script `configurar-credenciais-mercadopago.ps1` e teste! 🚀

