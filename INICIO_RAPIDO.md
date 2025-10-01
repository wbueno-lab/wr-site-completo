# 🚀 Início Rápido - Mercado Pago + Correios

## Sua loja em 5 passos simples!

---

### 📝 Passo 1: Criar Conta no Mercado Pago (5 minutos)

1. Acesse: https://www.mercadopago.com.br
2. Clique em **"Criar conta"**
3. Preencha seus dados
4. Confirme seu email

✅ **Pronto!** Você já pode receber pagamentos.

---

### 🔑 Passo 2: Obter Credenciais (3 minutos)

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em **"Suas integrações"** → **"Criar aplicação"**
3. Dê um nome: `WR Capacetes`
4. Copie estas 2 chaves:
   - **Public Key** (começa com `APP_USR-`)
   - **Access Token** (começa com `APP_USR-`)

✅ **Guarde essas chaves!** Vamos usar no próximo passo.

---

### ⚙️ Passo 3: Configurar no Projeto (2 minutos)

1. Abra o arquivo `.env` na raiz do projeto
2. Cole suas credenciais:

```bash
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-access-token-aqui
```

3. Salve o arquivo

✅ **Feito!** Agora vamos configurar o Supabase.

---

### 🔧 Passo 4: Configurar Supabase (3 minutos)

1. Acesse: https://supabase.com/dashboard
2. Abra seu projeto
3. Vá em **"Edge Functions"** → **"Manage secrets"**
4. Adicione as mesmas credenciais:

```bash
MERCADO_PAGO_PUBLIC_KEY = sua-public-key
MERCADO_PAGO_ACCESS_TOKEN = seu-access-token
```

5. Execute os deploys:

```bash
npx supabase functions deploy mercado-pago-process-payment
npx supabase functions deploy mercado-pago-webhook
npx supabase functions deploy mercado-pago-get-installments
npx supabase functions deploy mercado-pago-check-payment
npx supabase functions deploy correios-proxy
```

✅ **Quase lá!** Último passo.

---

### 🌐 Passo 5: Configurar Webhook (2 minutos)

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em **"Suas integrações"** → **"Webhooks"**
3. Cole esta URL (substitua `seu-projeto` pelo nome do seu projeto no Supabase):

```
https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook
```

4. Marque os eventos:
   - ✅ Pagamentos
   - ✅ Cobranças

5. Salve

✅ **PRONTO! SUA LOJA ESTÁ NO AR! 🎉**

---

## 🧪 Testar Agora

### Teste 1: Fazer um Pedido

1. Inicie o projeto: `npm run dev`
2. Adicione produtos ao carrinho
3. Vá para o checkout
4. Preencha os dados
5. Escolha o método de pagamento

### Teste 2: Cartão (Modo Teste)

Use este cartão de teste:

```
Número: 4509 9535 6623 3704
Nome: APRO
CVV: 123
Validade: 11/25
```

### Teste 3: PIX (Modo Teste)

- O PIX será aprovado automaticamente após 5 minutos em modo teste

### Teste 4: Boleto (Modo Teste)

- Boleto gerado pode ser marcado como pago no painel do Mercado Pago

---

## 💰 Onde Ver Seus Ganhos?

Acesse: https://www.mercadopago.com.br/activities

Você verá:
- ✅ Todas as vendas
- ✅ Quanto você ganhou
- ✅ Quando pode sacar
- ✅ Dados dos compradores

---

## 🏦 Como Sacar o Dinheiro?

1. Acesse: https://www.mercadopago.com.br/money/transfer
2. Clique em **"Transferir"**
3. Escolha sua conta bancária
4. Digite o valor
5. Confirme

**Transferência é GRÁTIS** e cai em 1 dia útil! 💰

---

## 📊 Taxas por Venda

| Método | Taxa |
|--------|------|
| PIX | 0,99% |
| Boleto | R$ 3,49 fixo |
| Cartão à vista | 3,79% + R$ 0,40 |
| Cartão parcelado | 4,89% a 5,49% + R$ 0,40 |

---

## ❓ Dúvidas Comuns

### Quanto tempo demora para cair o dinheiro?

- **Cartão:** 14 dias (pode antecipar com taxa)
- **PIX:** 2 dias (pode antecipar com taxa)
- **Boleto:** 2 dias após o pagamento

### Posso usar com CPF?

✅ **Sim!** Pode vender com CPF, mas tem limites menores. Com CNPJ os limites são maiores.

### E se o cliente quiser devolver?

Você pode estornar pelo painel do Mercado Pago:
1. Acesse a venda
2. Clique em "Estornar"
3. O dinheiro volta para o cliente

### Preciso de certificado SSL/HTTPS?

✅ **Sim**, mas se você usar Vercel ou Netlify, já vem automático e grátis!

---

## 🆘 Precisa de Ajuda?

- **Documentação completa:** Veja o arquivo `INTEGRACAO_MERCADO_PAGO_CORREIOS.md`
- **Suporte Mercado Pago:** https://www.mercadopago.com.br/help
- **Status da API:** https://status.mercadopago.com

---

## ✅ Checklist Rápido

Antes de divulgar sua loja:

- [ ] Credenciais configuradas
- [ ] Testou um pedido completo
- [ ] Webhook funcionando
- [ ] Domínio personalizado configurado
- [ ] HTTPS ativo
- [ ] Conta bancária cadastrada no Mercado Pago
- [ ] Termos de uso no site
- [ ] Política de privacidade no site

---

## 🎉 Tudo Pronto!

**Sua loja está pronta para vender! 🚀**

Compartilhe o link, divulgue nas redes sociais e comece a vender!

**Boa sorte! 💰**

