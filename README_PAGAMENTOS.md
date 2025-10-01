# 💰 Sistema de Pagamentos - Mercado Pago + Correios

## ✅ STATUS: IMPLEMENTADO E PRONTO PARA USO

---

## 🚀 O Que Foi Feito

Integração **COMPLETA** e **PROFISSIONAL** de pagamentos reais:

- ✅ **Cartão de Crédito** (até 12x)
- ✅ **PIX** (QR Code + código)
- ✅ **Boleto Bancário**
- ✅ **Frete dos Correios** (PAC + SEDEX)
- ✅ **Webhook automático**
- ✅ **Pronto para produção**

---

## 💵 Onde o Dinheiro Cai?

**Todos os pagamentos vão para sua conta do Mercado Pago**

- Você acompanha em: https://www.mercadopago.com.br/activities
- Pode transferir para seu banco **GRÁTIS**
- Transferência cai em **1 dia útil**

---

## ⚙️ Como Configurar (5 minutos)

### 1. Criar conta Mercado Pago
https://www.mercadopago.com.br

### 2. Obter credenciais
https://www.mercadopago.com.br/developers → Suas integrações

### 3. Configurar `.env`
```bash
VITE_MERCADO_PAGO_PUBLIC_KEY=sua-chave
VITE_MERCADO_PAGO_ACCESS_TOKEN=seu-token
```

### 4. Deploy das Edge Functions
```bash
npx supabase functions deploy mercado-pago-process-payment
npx supabase functions deploy mercado-pago-webhook
npx supabase functions deploy mercado-pago-get-installments
npx supabase functions deploy mercado-pago-check-payment
```

### 5. Configurar webhook
URL: `https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook`

**Guia detalhado:** `INICIO_RAPIDO.md`

---

## 📊 Taxas

| Método | Taxa |
|--------|------|
| PIX | 0,99% |
| Boleto | R$ 3,49 |
| Cartão | 3,79% a 5,49% |

---

## 🧪 Testar Agora

### Cartão de Teste
```
Número: 4509 9535 6623 3704
Nome: APRO
CVV: 123
Validade: 11/25
```

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `INICIO_RAPIDO.md` | **↓ Comece por aqui!** Setup em 5 passos |
| `INTEGRACAO_MERCADO_PAGO_CORREIOS.md` | Documentação completa |
| `COMO_USAR_NOVO_CHECKOUT.md` | Como integrar no código |
| `RESUMO_INTEGRACAO.md` | Resumo técnico |
| `README_PAGAMENTOS.md` | Este arquivo |

---

## 🎯 Próximo Passo

**Leia o arquivo `INICIO_RAPIDO.md` e configure em 5 passos simples!**

**Sua loja está pronta para vender! 🚀**


