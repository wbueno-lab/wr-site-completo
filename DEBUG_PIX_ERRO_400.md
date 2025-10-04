# 🐛 Debug: Erro 400 ao Gerar PIX

## ❌ Problema Encontrado

Quando você clica em "Gerar Código PIX", a Edge Function retorna erro 400, mas sem detalhes suficientes sobre o que está errado.

## ✅ Correções Aplicadas

### 1. Melhorias no Tratamento de Erro

**Edge Function (`mercado-pago-process-payment`):**
- Agora retorna detalhes completos do erro da API do Mercado Pago
- Inclui status HTTP e mensagem específica
- Logs mais detalhados no console

**Frontend (`mercadoPagoService.ts`):**
- Agora captura e exibe erros detalhados da Edge Function
- Mostra a mensagem completa de erro no console
- Facilita identificar o problema real

### 2. Redeploy Realizado

✅ Edge Function `mercado-pago-process-payment` v4 deployada

## 🧪 Como Testar Agora

### Passo 1: Limpar Cache NOVAMENTE

```
Ctrl + Shift + Delete
```

Ou botão direito em Recarregar > "Esvaziar cache e recarregar forçado"

### Passo 2: Recarregar a Página

Feche e reabra o navegador, depois acesse o checkout novamente.

### Passo 3: Abrir o Console

Pressione `F12` > Aba "Console"

### Passo 4: Tentar Gerar PIX

Clique no botão "Gerar Código PIX"

### Passo 5: Verificar a Mensagem de Erro DETALHADA

Agora o console deve mostrar **exatamente** qual é o problema! Procure por:

```
❌ Erro retornado pela Edge Function: { ... }
```

Isso vai nos mostrar o erro real da API do Mercado Pago.

## 🔍 Possíveis Causas do Erro 400

### 1. **Credenciais Inválidas**
- A chave `MERCADO_PAGO_ACCESS_TOKEN` pode estar errada ou expirada
- Solução: Gerar nova credencial no Mercado Pago

### 2. **Dados do Pagamento Incompletos**
- Falta algum campo obrigatório (email, nome, etc)
- Solução: Verificar se o formulário está preenchido corretamente

### 3. **Valor Inválido**
- O valor pode estar muito baixo ou muito alto
- Solução: Testar com valor entre R$ 5,00 e R$ 50.000,00

### 4. **Conta Mercado Pago em Teste**
- A conta pode não estar aprovada para receber pagamentos reais
- Solução: Usar credenciais de teste ou ativar a conta

## 📋 Checklist de Verificação

Antes de testar, confirme:

- [ ] Você tem uma conta válida no Mercado Pago
- [ ] As credenciais estão corretas no `.env`:
  - `VITE_MERCADO_PAGO_PUBLIC_KEY`
  - `VITE_MERCADO_PAGO_ACCESS_TOKEN`
- [ ] As mesmas credenciais estão nas variáveis de ambiente do Supabase:
  - `MERCADO_PAGO_PUBLIC_KEY`
  - `MERCADO_PAGO_ACCESS_TOKEN`
- [ ] A conta Mercado Pago está ativa e aprovada
- [ ] O formulário de checkout está completamente preenchido

## 🎯 Próximos Passos

1. **TESTE AGORA** com as melhorias aplicadas
2. **COPIE A MENSAGEM DE ERRO COMPLETA** do console
3. **ME ENVIE** a mensagem de erro para eu analisar

Com o erro detalhado, vou conseguir identificar exatamente o que precisa ser corrigido!

## 💡 Dica: Usar Credenciais de Teste

Se você ainda está testando, use as **credenciais de teste** do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Clique em "Criar aplicação" (se não tiver uma)
3. Vá em "Credenciais de teste"
4. Copie:
   - **Public Key** de teste
   - **Access Token** de teste
5. Use essas credenciais no `.env` e no Supabase

Com credenciais de teste, você pode testar pagamentos sem medo!

---

**Aguardando:** Teste novamente e me envie a mensagem de erro detalhada do console! 🚀










