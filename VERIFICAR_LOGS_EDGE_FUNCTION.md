# 🔍 Como Verificar os Logs da Edge Function

## ✅ Redeploy Feito com Logs Super Detalhados!

Acabei de fazer deploy da versão v5 da Edge Function `mercado-pago-process-payment` com logs **extremamente detalhados**.

Agora vamos descobrir exatamente qual é o erro!

## 📋 Passo a Passo para Ver os Logs:

### Opção 1: Ver Logs no Dashboard do Supabase (RECOMENDADO)

1. **Acesse o Dashboard:**
   https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/functions

2. **Clique em "mercado-pago-process-payment"** na lista de funções

3. **Vá na aba "Logs"** (no topo da página)

4. **Mantenha a página de logs aberta**

5. **Em outra aba, acesse seu site** e tente gerar o PIX novamente

6. **Volte para a aba de logs** - você verá logs em tempo real mostrando:
   ```
   🔍 Processando pagamento: { ... }
   📦 Dados completos do pagamento: { ... }
   📥 Resposta da API Mercado Pago: { ... }
   ❌ Erro na API do Mercado Pago (Status: 400)
   ❌ Detalhes do erro: { ... }
   ```

7. **COPIE a mensagem completa** que aparece em "Detalhes do erro"

### Opção 2: Ver Logs via CLI (se preferir)

1. Abra o PowerShell no projeto:
   ```powershell
   cd "C:\Users\wessi\OneDrive\Desktop\Wr capacetes site 2 banco de dados"
   ```

2. Execute:
   ```powershell
   supabase functions logs mercado-pago-process-payment
   ```

3. Em outra janela, acesse o site e tente gerar o PIX

4. Os logs aparecerão no PowerShell

## 🔍 O Que Procurar nos Logs:

### Log 1: Dados Enviados
```
🔍 Processando pagamento: {
  paymentType: "pix",
  amount: 1224.8,
  paymentMethodId: "pix",
  hasEmail: true
}
```
✅ Isso mostra que os dados básicos estão OK

### Log 2: Resposta da API
```
📥 Resposta da API Mercado Pago: {
  status: 400,
  ok: false,
  data: { 
    message: "...",
    cause: [ ... ]
  }
}
```
⚠️ **ESTE É O LOG IMPORTANTE!** Ele mostra exatamente por que o Mercado Pago rejeitou o pagamento.

### Possíveis Mensagens de Erro:

#### 1. **"Invalid credentials"** ou **"Unauthorized"**
```json
{
  "message": "invalid credentials",
  "error": "unauthorized"
}
```
**Causa:** Access Token inválido ou expirado
**Solução:** Gerar novas credenciais no Mercado Pago

#### 2. **"Payer email is required"**
```json
{
  "cause": [
    { "code": "required", "description": "payer.email is required" }
  ]
}
```
**Causa:** Email não foi enviado
**Solução:** Verificar formulário de checkout

#### 3. **"Invalid amount"**
```json
{
  "cause": [
    { "code": "invalid", "description": "amount is invalid" }
  ]
}
```
**Causa:** Valor muito baixo ou formato errado
**Solução:** Testar com valor maior (ex: R$ 10,00)

#### 4. **"Account not activated"**
```json
{
  "message": "Merchant account not activated for this feature"
}
```
**Causa:** Conta Mercado Pago não aprovada para PIX
**Solução:** Usar credenciais de teste OU ativar a conta

## 🎯 Depois de Ver os Logs:

### Me envie as seguintes informações:

1. **A mensagem de erro completa** dos logs
2. **O status code** (provavelmente 400, 401 ou 403)
3. **Qual tipo de credencial** você está usando:
   - [ ] Credenciais de produção (reais)
   - [ ] Credenciais de teste

## 💡 Enquanto isso, vamos testar com credenciais de teste:

Se você ainda não tem credenciais de teste:

### Passo 1: Obter Credenciais de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Se não tiver uma aplicação, clique em "Criar aplicação"
3. Dê um nome (ex: "WR Capacetes Test")
4. Vá em **"Credenciais de teste"**
5. Copie:
   - **Public Key de teste** (começa com `TEST-...`)
   - **Access Token de teste** (começa com `TEST-...`)

### Passo 2: Configurar no Projeto

Edite o arquivo `.env`:
```env
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key-aqui
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
```

### Passo 3: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions
2. Vá em "Edge Functions" > "Secrets"
3. **Edite** os secrets existentes:
   - `MERCADO_PAGO_PUBLIC_KEY` → Cole a Public Key de TESTE
   - `MERCADO_PAGO_ACCESS_TOKEN` → Cole o Access Token de TESTE

### Passo 4: Teste Novamente

1. Reinicie o servidor: `npm run dev`
2. Limpe o cache: `Ctrl + Shift + Delete`
3. Tente gerar PIX novamente
4. Verifique os logs

## 📊 Checklist de Verificação:

- [ ] Logs visualizados no Dashboard ou CLI
- [ ] Mensagem de erro específica identificada
- [ ] Testado com credenciais de teste
- [ ] Formulário de checkout completamente preenchido
- [ ] Email válido no formulário

## 🆘 Se Ainda Não Funcionar:

Me envie:
1. **Screenshot dos logs** do Dashboard
2. **Qual credencial** você está usando (teste ou produção)
3. **Mensagem de erro completa**

Com essas informações, vou conseguir resolver o problema definitivamente! 🚀

---

**Próximo passo:** Acesse o Dashboard de logs e tente gerar o PIX para vermos o erro completo!

