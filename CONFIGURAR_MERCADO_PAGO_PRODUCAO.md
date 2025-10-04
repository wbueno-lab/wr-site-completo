# 🔧 Configurar Mercado Pago em Produção

## ❌ Problema Atual
A Edge Function está retornando erro "non-2xx status code", o que indica falta de credenciais ou credenciais inválidas.

## ✅ Solução: Configurar Credenciais no Supabase

### 1️⃣ **Obter Credenciais do Mercado Pago**

Acesse: https://www.mercadopago.com.br/developers/panel/credentials

**Você precisará de:**
- ✅ **Access Token** (credencial de produção, começa com `APP_USR-`)
- ✅ **Public Key** (credencial de produção, começa com `APP_USR-`)

**IMPORTANTE:** Use as credenciais de **PRODUÇÃO**, não as de teste!

### 2️⃣ **Configurar no Supabase Dashboard**

1. **Acesse:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions

2. **Clique em "Secrets"** ou "Environment Variables"

3. **Adicione estas variáveis:**

   **Variável 1:**
   - Nome: `MERCADO_PAGO_ACCESS_TOKEN`
   - Valor: Cole seu Access Token de produção (exemplo: `APP_USR-1234567890-abcdef...`)

   **Variável 2:**
   - Nome: `MERCADO_PAGO_PUBLIC_KEY`
   - Valor: Cole sua Public Key de produção (exemplo: `APP_USR-abc123...`)

4. **Clique em "Save"** ou "Add Secret"

### 3️⃣ **Verificar os Logs da Edge Function**

1. **Acesse:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/logs/edge-functions

2. **Selecione:** `mercado-pago-process-payment`

3. **Verifique os erros** nos logs para identificar o problema específico

Os logs podem mostrar:
- ❌ "MERCADO_PAGO_ACCESS_TOKEN não configurado" → Falta configurar a variável
- ❌ "401 Unauthorized" → Token inválido ou expirado
- ❌ "400 Bad Request" → Problema nos dados enviados

### 4️⃣ **Testar Após Configurar**

1. **Aguarde 1-2 minutos** após salvar as variáveis
2. **Recarregue a página** do site (Ctrl+R)
3. **Tente fazer um novo pedido**
4. **O pagamento PIX deve funcionar!** 🎉

## 🔍 **Troubleshooting**

### Se ainda der erro após configurar:

1. **Verifique se as credenciais são de PRODUÇÃO:**
   - Credenciais de TESTE começam com `TEST-`
   - Credenciais de PRODUÇÃO começam com `APP_USR-`

2. **Verifique no Mercado Pago se sua conta está ativa:**
   - Acesse: https://www.mercadopago.com.br/settings/account/status
   - Certifique-se que sua conta está aprovada para receber pagamentos

3. **Verifique os logs no Supabase:**
   - Vá em: Logs → Edge Functions → mercado-pago-process-payment
   - Procure por mensagens de erro específicas

4. **Teste as credenciais manualmente:**
   ```bash
   curl -X GET \
     'https://api.mercadopago.com/v1/payment_methods' \
     -H 'Authorization: Bearer SEU_ACCESS_TOKEN_AQUI'
   ```
   
   Se retornar 200 OK, as credenciais estão válidas!

## 📝 **Checklist de Configuração**

- [ ] Obtive as credenciais de PRODUÇÃO do Mercado Pago
- [ ] Adicionei `MERCADO_PAGO_ACCESS_TOKEN` no Supabase
- [ ] Adicionei `MERCADO_PAGO_PUBLIC_KEY` no Supabase
- [ ] Aguardei 1-2 minutos após salvar
- [ ] Recarreguei a página do site
- [ ] Testei criar um novo pedido PIX

## 🎯 **Links Úteis**

- **Credenciais Mercado Pago:** https://www.mercadopago.com.br/developers/panel/credentials
- **Supabase Functions Settings:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions
- **Logs Edge Functions:** https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/logs/edge-functions
- **Documentação Mercado Pago:** https://www.mercadopago.com.br/developers/pt/docs

---

**🔴 IMPORTANTE:** Nunca compartilhe suas credenciais de produção publicamente ou faça commit delas no Git!

