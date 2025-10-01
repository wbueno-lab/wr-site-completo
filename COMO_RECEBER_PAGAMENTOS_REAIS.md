# Como Receber Pagamentos Reais no Seu Site

## 🚨 Situação Atual

Atualmente, o sistema está em **modo de simulação**. Nenhum pagamento real está sendo processado. Os pedidos são criados no banco de dados, mas nenhum dinheiro está sendo cobrado dos clientes.

## 💰 Como Começar a Receber Pagamentos

### Opção 1: Mercado Pago (RECOMENDADO - Mais Fácil)

O Mercado Pago é a solução mais popular no Brasil e a mais fácil de integrar.

#### Passo 1: Criar Conta Mercado Pago

1. Acesse: https://www.mercadopago.com.br
2. Crie uma conta (pode ser pessoa física ou jurídica)
3. Complete o cadastro com seus dados

#### Passo 2: Obter Credenciais

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em "Suas integrações" → "Criar aplicação"
3. Anote suas credenciais:
   - **Access Token** (para fazer cobranças)
   - **Public Key** (para o frontend)

#### Passo 3: Configurar no Projeto

```bash
# Adicionar no arquivo .env
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxxxx
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxxxx
```

#### Passo 4: Instalar SDK do Mercado Pago

```bash
npm install mercadopago @mercadopago/sdk-react
```

#### Onde o Dinheiro Cai?

- **Vai direto para sua conta Mercado Pago**
- Você pode transferir para sua conta bancária quando quiser
- Taxa: ~3,5% + R$ 0,40 por transação
- Prazo: Dinheiro fica disponível em 14 dias (pode reduzir conforme seu histórico)

---

### Opção 2: PagSeguro/PagBank

Similar ao Mercado Pago, mas com taxas um pouco mais altas.

#### Como Configurar:

1. Criar conta em: https://pagseguro.uol.com.br
2. Obter token de integração
3. Integrar usando a SDK do PagSeguro

#### Onde o Dinheiro Cai?

- **Conta PagSeguro/PagBank**
- Pode transferir para conta bancária
- Taxa: ~3,99% por transação
- Prazo: 14 a 30 dias

---

### Opção 3: Stripe (Mais Moderno)

Opção internacional com ótima documentação e ferramentas.

#### Como Configurar:

1. Criar conta em: https://stripe.com/br
2. Completar verificação de identidade
3. Obter API keys
4. Integrar com a SDK

#### Onde o Dinheiro Cai?

- **Direto na sua conta bancária** (você cadastra)
- Taxa: ~3,9% + R$ 0,39 por transação
- Prazo: 7 dias (padrão no Brasil)

---

### Opção 4: PIX Direto (Sem Gateway)

Se você quer cobrar APENAS PIX e não quer pagar taxas de gateway:

#### Como Configurar:

1. **Obter uma chave PIX** da sua empresa no banco
2. **Gerar QR Codes dinâmicos** usando API do seu banco:
   - Banco do Brasil: https://developers.bb.com.br
   - Itaú: https://developer.itau.com.br
   - Bradesco: https://developers.bradesco.com.br
3. Integrar com a API do banco

#### Onde o Dinheiro Cai?

- **Direto na sua conta bancária**
- **Sem taxas** (apenas tarifas do banco, se houver)
- **Instantâneo**

---

## 🔧 Qual Escolher?

### Para Começar RÁPIDO:
**Mercado Pago** - Mais fácil de integrar, aceita tudo (cartão, PIX, boleto)

### Para Pagar MENOS Taxas:
**Stripe** ou **Asaas** - Taxas menores e dinheiro cai mais rápido

### Para NÃO Pagar Taxas (só PIX):
**API do seu banco** - Mas mais complexo de integrar

---

## 📊 Comparação Rápida

| Gateway | Taxa | Onde Recebe | Prazo | Facilidade |
|---------|------|-------------|-------|------------|
| Mercado Pago | 3,5% + R$0,40 | Conta MP | 14 dias | ⭐⭐⭐⭐⭐ |
| PagSeguro | 3,99% | Conta PagBank | 14-30 dias | ⭐⭐⭐⭐ |
| Stripe | 3,9% + R$0,39 | Conta Bancária | 7 dias | ⭐⭐⭐⭐ |
| API Banco (PIX) | 0% | Conta Bancária | Instantâneo | ⭐⭐ |

---

## 🚀 Próximos Passos

1. **Escolher um gateway** (recomendo Mercado Pago para começar)
2. **Criar conta e obter credenciais**
3. **Me avisar qual você escolheu** - Eu ajudo a integrar no código!
4. **Testar com pequenos valores** antes de divulgar

---

## ⚠️ IMPORTANTE - Conformidade Legal

Antes de receber pagamentos reais, você deve:

1. ✅ **Ter CNPJ** (ou CPF para MEI)
2. ✅ **Emitir notas fiscais** para os clientes
3. ✅ **Ter política de privacidade** no site
4. ✅ **Ter termos de uso e política de troca/devolução**
5. ✅ **Seguir as leis de proteção ao consumidor (CDC)**

---

## 📞 Precisa de Ajuda?

Depois que você:
1. Escolher o gateway
2. Criar a conta
3. Obter as credenciais

**Me avise que eu faço a integração no código para você!**


