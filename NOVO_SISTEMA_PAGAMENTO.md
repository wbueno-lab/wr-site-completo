# Novo Sistema de Pagamento e Frete

## Resumo das Mudanças

Foi implementado um novo sistema de pagamento completo, removendo toda a dependência do Mercado Pago e criando um sistema próprio com suporte a:

- **Pagamento com Cartão de Crédito/Débito** (com parcelamento)
- **PIX** (com QR Code e código copia e cola)
- **Boleto Bancário** (com linha digitável e código de barras)
- **Sistema de Frete dos Correios** (PAC e SEDEX)
- **Cálculo de frete por CEP** com zonas de entrega

## Arquivos Removidos

### Integração Mercado Pago
- `src/integrations/mercado-pago/` (diretório completo)
  - `client.ts`
  - `client-fetch.ts` 
  - `config.ts`
  - `types.ts`
- `src/components/MercadoPagoCardForm.tsx`
- `src/components/MercadoPagoPixForm.tsx`
- `supabase/functions/mercado-pago-webhook/index.ts`

## Arquivos Criados

### Tipos e Interfaces
- `src/types/payment.ts` - Tipos TypeScript para pagamento e frete

### Serviços
- `src/services/newPaymentService.ts` - Novo serviço de pagamento
- `src/services/shippingService.ts` - Serviço de cálculo de frete dos Correios

### Componentes de Pagamento
- `src/components/payment/CardPaymentForm.tsx` - Formulário de cartão
- `src/components/payment/PixPaymentForm.tsx` - Formulário PIX
- `src/components/payment/BoletoPaymentForm.tsx` - Formulário de boleto

### Componentes de Checkout
- `src/components/checkout/PaymentMethodSelector.tsx` - Seletor de método de pagamento
- `src/components/checkout/ShippingCalculator.tsx` - Calculadora de frete
- `src/components/NewCheckoutModal.tsx` - Modal de checkout completo

### Migrações do Banco
- `supabase/migrations/20250130200000_update_payment_system.sql` - Nova estrutura do banco

## Estrutura do Banco de Dados

### Tabelas Atualizadas
- **orders** - Adicionadas colunas para novo sistema:
  - `payment_method` (VARCHAR) - Método de pagamento escolhido
  - `payment_details` (JSONB) - Detalhes do pagamento
  - `shipping_cost` (DECIMAL) - Custo do frete
  - `shipping_service` (VARCHAR) - Serviço de entrega escolhido
  - `shipping_tracking_code` (VARCHAR) - Código de rastreamento

### Novas Tabelas
- **shipping_methods** - Métodos de entrega disponíveis
- **shipping_zones** - Zonas de entrega com multiplicadores de preço
- **payment_methods** - Métodos de pagamento (já existia, mantida)

### Novas Funções
- `calculate_shipping_cost()` - Calcula frete baseado em CEP, peso e método

## Funcionalidades Implementadas

### 1. Pagamento com Cartão
- Validação de dados do cartão em tempo real
- Detecção automática da bandeira (Visa, Mastercard, Elo, Amex)
- Parcelamento até 12x (com juros configuráveis)
- Simulação de pagamento para desenvolvimento
- Cartões de teste para desenvolvimento

### 2. Pagamento PIX
- Geração automática de código PIX
- QR Code visual para escaneamento
- Código copia e cola
- Timer de expiração (30 minutos)
- Verificação automática de pagamento
- Simulação de pagamento aprovado após 2 minutos (desenvolvimento)

### 3. Boleto Bancário
- Geração de linha digitável
- Código de barras
- Data de vencimento (3 dias)
- Download do boleto
- Verificação de status de pagamento
- Avisos de vencimento

### 4. Sistema de Frete
- Integração com API dos Correios (simulada em desenvolvimento)
- Cálculo por CEP de destino
- Suporte a PAC e SEDEX
- Cálculo baseado em peso e dimensões
- Zonas de entrega com multiplicadores
- Frete grátis para retirada na loja

### 5. Checkout Completo
- Processo em 3 etapas: Endereço → Frete → Pagamento
- Indicador visual de progresso
- Resumo do pedido sempre visível
- Navegação entre etapas
- Validação em cada etapa
- Responsivo para mobile

## Configurações

### Variáveis de Ambiente
```bash
# Correios (opcional - usa simulação se não configurado)
VITE_CORREIOS_API_KEY=sua-chave-dos-correios

# Removidas (não são mais necessárias)
# VITE_MERCADO_PAGO_ACCESS_TOKEN
# VITE_MERCADO_PAGO_WEBHOOK_URL
```

### Configuração dos Correios
O sistema usa valores simulados em desenvolvimento. Para produção, configure:
1. Obtenha uma chave da API dos Correios
2. Configure `VITE_CORREIOS_API_KEY`
3. Ajuste `CEP_ORIGIN` em `shippingService.ts` para o CEP da sua loja

## Modo de Desenvolvimento

### Cartões de Teste
- **Visa**: 4000 0000 0000 0002
- **Mastercard**: 5000 0000 0000 0004
- **CVV**: 123
- **Validade**: Qualquer data futura

### PIX Simulado
- Código gerado automaticamente
- Pagamento aprovado após 2 minutos
- QR Code placeholder

### Boleto Simulado
- Linha digitável e código de barras simulados
- Vencimento em 3 dias
- Verificação de pagamento aleatória

### Frete Simulado
- Valores calculados por algoritmo
- PAC: R$ 15,00 + peso + distância
- SEDEX: R$ 25,00 + peso + distância
- Prazos baseados na região do CEP

## Migração de Dados

O sistema mantém compatibilidade com pedidos existentes:
- Pedidos antigos continuam funcionando
- Novos pedidos usam a nova estrutura
- Método de pagamento padrão: 'credit_card'

## Próximos Passos

### Para Produção
1. **Integração Real dos Correios**
   - Configurar chave da API
   - Testar cálculos reais
   - Ajustar multiplicadores das zonas

2. **Gateway de Pagamento**
   - Integrar com gateway real (ex: Stripe, PagSeguro)
   - Configurar webhooks
   - Implementar verificação de pagamento real

3. **Boleto Bancário**
   - Integrar com banco emissor
   - Configurar geração de PDF
   - Implementar notificações de pagamento

4. **PIX**
   - Integrar com API do banco
   - Configurar chave PIX da empresa
   - Implementar verificação automática

### Melhorias Futuras
- Desconto para pagamento à vista
- Frete grátis acima de valor mínimo
- Múltiplos endereços de entrega
- Agendamento de entrega
- Rastreamento de pedidos
- Notificações por email/SMS

## Testes

### Teste de Cartão
1. Adicione produtos ao carrinho
2. Preencha endereço de entrega
3. Calcule o frete
4. Selecione "Cartão de Crédito"
5. Use cartão de teste: 4000 0000 0000 0002
6. Confirme o pagamento

### Teste de PIX
1. Siga passos 1-4 acima
2. Selecione "PIX"
3. Aguarde geração do código
4. Em desenvolvimento, aguarde 2 minutos para aprovação automática

### Teste de Boleto
1. Siga passos 1-4 acima
2. Selecione "Boleto Bancário"
3. Aguarde geração do boleto
4. Baixe ou copie os códigos

### Teste de Frete
1. No checkout, insira diferentes CEPs:
   - São Paulo: 01310-100 (mais barato)
   - Rio de Janeiro: 20040-020 (médio)
   - Manaus: 69010-010 (mais caro)
2. Compare preços e prazos

## Suporte e Manutenção

### Logs Importantes
- Erros de pagamento são logados no console
- Falhas de cálculo de frete são tratadas com fallback
- Timeouts de API são configuráveis

### Monitoramento
- Acompanhe taxa de conversão por método
- Monitore tempo de carregamento do checkout
- Verifique erros de validação frequentes

### Backup
- Faça backup das migrações antes de aplicar
- Mantenha cópia dos dados de `payment_methods`
- Documente personalizações de zona de frete




