# Integração Completa: Mercado Pago + Correios

## 📋 Resumo

Foi implementada a integração completa do Mercado Pago para pagamentos e dos Correios para cálculo de frete. Esta é uma solução profissional pronta para receber pagamentos reais.

---

## 🚀 O Que Foi Implementado

### 1. Integração Mercado Pago

✅ **Pagamento com Cartão de Crédito**
- Suporte a todas as bandeiras (Visa, Mastercard, Elo, Amex, etc.)
- Parcelamento em até 12x
- Detecção automática da bandeira
- Validação em tempo real dos dados do cartão
- Processamento seguro via API do Mercado Pago

✅ **Pagamento via PIX**
- Geração automática de QR Code
- Código copia e cola
- Verificação automática de pagamento
- Timer de expiração (30 minutos)
- Sem taxas adicionais

✅ **Pagamento via Boleto Bancário**
- Geração de boleto com vencimento em 3 dias
- Download do boleto em PDF
- Código de barras para pagamento
- Notificação automática de pagamento

### 2. Integração Correios

✅ **Cálculo de Frete Automático**
- Integração com API dos Correios
- Suporte a PAC e SEDEX
- Cálculo baseado em CEP, peso e dimensões
- Fallback para valores estimados se API indisponível
- Cache de consultas para melhor performance

✅ **Opções de Entrega**
- PAC - Entrega econômica (7-15 dias)
- SEDEX - Entrega expressa (3-5 dias)
- Cálculo de prazo por região
- Valores realistas baseados nos Correios

### 3. Fluxo de Checkout Completo

✅ **Processo em 3 Etapas**
1. **Endereço de Entrega** - Formulário completo com validação de CEP
2. **Frete** - Cálculo automático e seleção de método
3. **Pagamento** - Escolha do método e processamento

✅ **Recursos do Checkout**
- Indicador visual de progresso
- Resumo do pedido sempre visível
- Navegação entre etapas
- Validação em cada passo
- Interface responsiva

---

## 📦 Arquivos Criados

### Configuração e Tipos
```
src/config/env.ts (atualizado)
src/integrations/mercado-pago/
  ├── config.ts
  ├── types.ts
  └── mercadoPagoService.ts
```

### Componentes de Pagamento
```
src/components/payment/
  ├── MercadoPagoCardForm.tsx
  ├── MercadoPagoPixForm.tsx
  └── MercadoPagoBoletoForm.tsx

src/components/
  └── MercadoPagoCheckoutModal.tsx
```

### Edge Functions (Supabase)
```
supabase/functions/
  ├── mercado-pago-process-payment/index.ts
  ├── mercado-pago-webhook/index.ts
  ├── mercado-pago-get-installments/index.ts
  ├── mercado-pago-check-payment/index.ts
  └── correios-proxy/index.ts (já existia)
```

### Serviços de Integração
```
src/services/
  ├── correiosAPI.ts (já existia)
  └── shippingService.ts (já existia)
```

---

## ⚙️ Configuração - PASSO A PASSO

### Passo 1: Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br
2. Clique em "Criar conta"
3. Preencha seus dados (pode ser pessoa física ou jurídica)
4. Complete a verificação de identidade

### Passo 2: Obter Credenciais do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login com sua conta
3. Vá em **"Suas integrações"**
4. Clique em **"Criar aplicação"**
5. Dê um nome (ex: "WR Capacetes")
6. Selecione o modelo de integração: **"Pagamentos online"**
7. Copie as credenciais:
   - **Public Key** (começa com `APP_USR-`)
   - **Access Token** (começa com `APP_USR-`)

### Passo 3: Configurar Variáveis de Ambiente

Abra o arquivo `.env` na raiz do projeto e adicione:

```bash
# Mercado Pago - CREDENCIAIS DE PRODUÇÃO
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-access-token-aqui

# Correios (opcional - se tiver contrato com os Correios)
VITE_CORREIOS_EMPRESA_CODE=seu-codigo-empresa
VITE_CORREIOS_SENHA=sua-senha
```

**IMPORTANTE:** As credenciais acima são REAIS e devem ser mantidas em segredo!

### Passo 4: Configurar Variáveis nas Edge Functions

As Edge Functions precisam das mesmas credenciais. Configure no Supabase:

1. Acesse: https://supabase.com/dashboard
2. Vá em seu projeto
3. Clique em **"Edge Functions"** no menu lateral
4. Clique em **"Manage secrets"**
5. Adicione as seguintes variáveis:

```bash
MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-access-token-aqui
```

### Passo 5: Deploy das Edge Functions

Execute os seguintes comandos para fazer deploy das Edge Functions:

```bash
# Fazer login no Supabase (se ainda não fez)
npx supabase login

# Deploy da função de processar pagamento
npx supabase functions deploy mercado-pago-process-payment

# Deploy da função de webhook
npx supabase functions deploy mercado-pago-webhook

# Deploy da função de parcelas
npx supabase functions deploy mercado-pago-get-installments

# Deploy da função de verificação
npx supabase functions deploy mercado-pago-check-payment

# Deploy do proxy dos Correios
npx supabase functions deploy correios-proxy
```

### Passo 6: Configurar Webhook no Mercado Pago

O webhook é usado para receber notificações de mudanças no status dos pagamentos.

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em **"Suas integrações"**
3. Selecione sua aplicação
4. Clique em **"Webhooks"**
5. Adicione a URL do webhook:
   ```
   https://seu-projeto-supabase.supabase.co/functions/v1/mercado-pago-webhook
   ```
6. Selecione os eventos:
   - ✅ Pagamentos
   - ✅ Cobranças
7. Salve as configurações

### Passo 7: Configurar CEP de Origem (Frete)

Abra o arquivo `src/services/shippingService.ts` e altere a linha 7:

```typescript
private readonly CEP_ORIGIN = '01310-100'; // Substitua pelo CEP da sua loja/empresa
```

---

## 🧪 Como Testar

### Modo de Teste (Sandbox)

O Mercado Pago oferece um modo de teste para você testar antes de ir para produção:

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Selecione **"Credenciais de teste"**
3. Use essas credenciais no `.env` para testar

**Cartões de Teste:**

| Bandeira | Número | CVV | Data | Nome | Comportamento |
|----------|--------|-----|------|------|---------------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | APRO | Aprovado |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | APRO | Aprovado |
| Visa | 4774 0614 2253 5733 | 123 | 11/25 | OTHE | Rejeitado |

### Teste de PIX (Sandbox)

No modo de teste, o PIX é aprovado automaticamente após 5 minutos.

### Teste de Boleto (Sandbox)

No modo de teste, o boleto pode ser marcado como pago manualmente no painel do Mercado Pago.

---

## 💰 Onde o Dinheiro Cai?

### Mercado Pago

✅ **O dinheiro vai direto para sua conta Mercado Pago**
- Você recebe uma notificação por email de cada venda
- Pode acompanhar todas as vendas no painel: https://www.mercadopago.com.br/activities
- O dinheiro fica disponível para saque após o prazo de liberação

### Prazos de Liberação

| Método | Prazo Padrão | Pode Antecipar? |
|--------|--------------|-----------------|
| Cartão de Crédito | 14 dias | ✅ Sim (com taxa) |
| PIX | 2 dias | ✅ Sim (com taxa) |
| Boleto | 2 dias após pagamento | ❌ Não |

**Nota:** Os prazos diminuem conforme você ganha reputação na plataforma.

### Transferir para Conta Bancária

1. Acesse: https://www.mercadopago.com.br/money/transfer
2. Clique em **"Transferir"**
3. Escolha sua conta bancária (cadastre se ainda não tiver)
4. Digite o valor
5. Confirme a transferência

**Transferências são gratuitas** e caem na conta em até 1 dia útil.

---

## 💵 Taxas do Mercado Pago

| Método de Pagamento | Taxa por Transação |
|---------------------|-------------------|
| Cartão de Crédito (à vista) | 3,79% + R$ 0,40 |
| Cartão de Crédito (parcelado 2-6x) | 4,89% + R$ 0,40 |
| Cartão de Crédito (parcelado 7-12x) | 5,49% + R$ 0,40 |
| PIX | 0,99% |
| Boleto | R$ 3,49 por boleto |

**Nota:** As taxas podem variar. Consulte: https://www.mercadopago.com.br/costs-section/release-options

---

## 📊 Acompanhamento de Vendas

### Painel do Mercado Pago

Acesse: https://www.mercadopago.com.br/activities

Você pode ver:
- ✅ Todas as vendas realizadas
- ✅ Status de cada pagamento
- ✅ Valor líquido (após taxas)
- ✅ Data de liberação do dinheiro
- ✅ Dados do comprador
- ✅ Reembolsos e estornos

### Seu Painel Admin

No seu site, você pode:
1. Acessar `/admin`
2. Ver todos os pedidos
3. Acompanhar status dos pagamentos
4. Gerenciar entregas

---

## 🔔 Notificações Automáticas

### O que acontece quando um cliente paga?

1. **Cliente finaliza o pagamento**
2. **Mercado Pago processa**
3. **Webhook notifica seu sistema** ← Automático!
4. **Pedido é atualizado no banco de dados**
5. **Você recebe email do Mercado Pago**

**Você não precisa fazer nada manualmente!** Tudo é automático.

---

## 🛠️ Solução de Problemas

### "Mercado Pago não configurado"

❌ **Problema:** Mensagem aparece no checkout

✅ **Solução:**
1. Verifique se as variáveis `VITE_MERCADO_PAGO_PUBLIC_KEY` e `VITE_MERCADO_PAGO_ACCESS_TOKEN` estão no `.env`
2. Reinicie o servidor de desenvolvimento: `npm run dev`

### "Erro ao processar pagamento"

❌ **Problema:** Pagamento não é processado

✅ **Solução:**
1. Verifique se fez deploy das Edge Functions
2. Verifique se configurou as variáveis de ambiente no Supabase
3. Verifique os logs no Supabase: Dashboard → Edge Functions → Logs

### "Frete não está calculando"

❌ **Problema:** Frete sempre mostra valores estimados

✅ **Solução:**
1. A integração usa fallback automático se a API dos Correios estiver indisponível
2. Para usar a API real, configure as credenciais dos Correios
3. Ou simplesmente use os valores estimados (são baseados em preços reais)

### Webhook não está recebendo notificações

❌ **Problema:** Status do pedido não atualiza automaticamente

✅ **Solução:**
1. Verifique se configurou o webhook no painel do Mercado Pago
2. Verifique a URL do webhook: `https://seu-projeto.supabase.co/functions/v1/mercado-pago-webhook`
3. Teste o webhook manualmente: painel do Mercado Pago → Webhooks → Enviar teste

---

## 🎯 Próximos Passos Recomendados

### Para Produção

1. ✅ **Trocar para credenciais de produção**
   - Use as credenciais de produção no `.env`
   - Remova as credenciais de teste

2. ✅ **Configurar domínio personalizado**
   - Configure seu domínio no Vercel/Netlify
   - Atualize URL do webhook no Mercado Pago

3. ✅ **Ativar HTTPS**
   - O Mercado Pago exige HTTPS em produção
   - Vercel/Netlify já fornecem HTTPS automaticamente

4. ✅ **Testar com valores reais pequenos**
   - Faça alguns pedidos teste com valores baixos
   - Verifique se o dinheiro está caindo na conta

5. ✅ **Configurar emails de notificação**
   - Configure SMTP no Supabase
   - Implemente emails de confirmação de pedido

### Melhorias Futuras

- 🔄 Rastreamento de entregas
- 💬 Chat de suporte
- 🎁 Cupons de desconto
- 📧 Email marketing
- 📱 Notificações push
- ⭐ Sistema de avaliações

---

## 📞 Suporte

### Mercado Pago

- **Documentação:** https://www.mercadopago.com.br/developers/pt
- **Suporte:** https://www.mercadopago.com.br/help
- **Status da API:** https://status.mercadopago.com

### Correios

- **Documentação:** https://www.correios.com.br/enviar/precisa-de-ajuda/desenvolvedores
- **Contrato:** https://www.correios.com.br/enviar/precisa-de-ajuda/contrate-os-servicos-dos-correios/correios-empresarial

---

## ✅ Checklist Final

Antes de colocar no ar, verifique:

- [ ] Credenciais de produção configuradas no `.env`
- [ ] Credenciais configuradas no Supabase (Edge Functions)
- [ ] Deploy de todas as Edge Functions realizado
- [ ] Webhook configurado no Mercado Pago
- [ ] CEP de origem configurado corretamente
- [ ] Testes realizados com pagamentos reais (valores baixos)
- [ ] HTTPS ativado (domínio configurado)
- [ ] Termos de uso e política de privacidade no site
- [ ] CNPJ ou CPF cadastrado no Mercado Pago
- [ ] Conta bancária cadastrada para saques

---

## 🎉 Pronto!

Sua loja está pronta para receber pagamentos reais! 🚀

Todas as vendas cairão automaticamente na sua conta do Mercado Pago, e você poderá transferir para sua conta bancária quando quiser.

**Boa sorte com as vendas! 💰**


