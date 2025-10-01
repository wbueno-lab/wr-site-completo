# Como Usar o Novo Checkout com Mercado Pago

## 🎯 Guia Rápido de Implementação

Este guia mostra como substituir o checkout antigo pelo novo checkout integrado com Mercado Pago e Correios.

---

## 📝 Passo 1: Importar o Novo Modal

### Antes (checkout antigo)
```typescript
import CheckoutModal from '@/components/CheckoutModal';
```

### Depois (novo checkout)
```typescript
import MercadoPagoCheckoutModal from '@/components/MercadoPagoCheckoutModal';
```

---

## 📝 Passo 2: Substituir o Componente

### Antes
```typescript
<CheckoutModal 
  isOpen={isCheckoutOpen} 
  onClose={() => setIsCheckoutOpen(false)} 
/>
```

### Depois
```typescript
<MercadoPagoCheckoutModal 
  isOpen={isCheckoutOpen} 
  onClose={() => setIsCheckoutOpen(false)} 
/>
```

**É só isso!** O novo modal já está integrado com Mercado Pago e Correios.

---

## 📄 Arquivos que Precisam Ser Atualizados

### 1. src/components/CartDrawer.tsx

Localizar:
```typescript
import CheckoutModal from './CheckoutModal';
```

Trocar por:
```typescript
import MercadoPagoCheckoutModal from './MercadoPagoCheckoutModal';
```

E substituir o uso:
```typescript
// Antes
<CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

// Depois
<MercadoPagoCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
```

### 2. Qualquer outro arquivo que use CheckoutModal

Faça a mesma substituição em qualquer arquivo que importe `CheckoutModal`.

---

## 🔍 Como Encontrar os Arquivos

Execute este comando no terminal:

```bash
grep -r "CheckoutModal" src/ --include="*.tsx" --include="*.ts"
```

Isso mostrará todos os arquivos que usam o `CheckoutModal` antigo.

---

## ✨ Diferenças Entre os Modais

### CheckoutModal Antigo
- ❌ Pagamento simulado (não cobra de verdade)
- ❌ Frete com valores fixos
- ❌ Sem integração real

### MercadoPagoCheckoutModal Novo
- ✅ Pagamento REAL via Mercado Pago
- ✅ Cartão, PIX e Boleto funcionando
- ✅ Frete calculado pelos Correios
- ✅ Webhook automático
- ✅ Notificações de status
- ✅ Pronto para produção

---

## 🎨 Interface do Novo Checkout

### Etapa 1: Endereço de Entrega
- Formulário completo com validação
- Busca automática de endereço por CEP
- Campos obrigatórios destacados

### Etapa 2: Frete
- Cálculo automático baseado no CEP
- Opções PAC e SEDEX
- Preços e prazos reais dos Correios
- Seleção visual das opções

### Etapa 3: Pagamento
- 3 métodos: Cartão, PIX e Boleto
- Formulários específicos para cada método
- Validação em tempo real
- Interface moderna e intuitiva

---

## 💡 Exemplo Completo de Uso

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import MercadoPagoCheckoutModal from '@/components/MercadoPagoCheckoutModal';

export default function MinhaLoja() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { items, getCartTotal } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div>
      {/* Botão de Checkout */}
      <Button onClick={handleCheckout}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Finalizar Compra - {formatPrice(getCartTotal())}
      </Button>

      {/* Modal de Checkout */}
      <MercadoPagoCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}

// Helper para formatar preço
function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
```

---

## 🔄 Migração Completa (Passo a Passo)

### 1. Fazer Backup

```bash
# Faça backup do checkout antigo (por segurança)
cp src/components/CheckoutModal.tsx src/components/CheckoutModal.tsx.backup
```

### 2. Atualizar Imports

Encontre todos os arquivos:
```bash
grep -rl "CheckoutModal" src/ --include="*.tsx"
```

### 3. Substituir em Cada Arquivo

Para cada arquivo encontrado, faça:

```typescript
// Linha de import
- import CheckoutModal from './CheckoutModal';
+ import MercadoPagoCheckoutModal from './MercadoPagoCheckoutModal';

// Uso do componente
- <CheckoutModal isOpen={isOpen} onClose={onClose} />
+ <MercadoPagoCheckoutModal isOpen={isOpen} onClose={onClose} />
```

### 4. Testar

```bash
npm run dev
```

Teste o fluxo completo:
1. Adicione produtos ao carrinho
2. Clique em "Finalizar Compra"
3. Preencha o endereço
4. Escolha o frete
5. Teste um pagamento (use cartão de teste)

---

## ⚙️ Configurações Opcionais

### Customizar CEP de Origem (Frete)

Se quiser alterar o CEP de origem para cálculo do frete:

1. Abra: `src/services/shippingService.ts`
2. Altere a linha 7:

```typescript
private readonly CEP_ORIGIN = '01310-100'; // Seu CEP aqui
```

### Customizar Métodos de Pagamento

Se quiser desabilitar algum método (ex: boleto):

1. Abra: `src/components/MercadoPagoCheckoutModal.tsx`
2. Remova ou comente o botão do método:

```typescript
{/* Comentar para desabilitar boleto */}
{/* <button onClick={() => setSelectedPaymentMethod('boleto')}>
  Boleto
</button> */}
```

### Customizar Valor Mínimo

Para definir valor mínimo do pedido:

```typescript
// No início do componente
const MIN_ORDER_VALUE = 50; // R$ 50,00

// Na validação
if (getCartTotal() < MIN_ORDER_VALUE) {
  toast({
    title: "Valor mínimo",
    description: `Pedido mínimo de ${formatPrice(MIN_ORDER_VALUE)}`,
    variant: "destructive"
  });
  return;
}
```

---

## 🧪 Testando o Novo Checkout

### Teste Básico

1. Adicione produtos ao carrinho
2. Clique em "Finalizar Compra"
3. Você deve ver 3 etapas no topo:
   - 🔵 Endereço → Frete → Pagamento

### Teste de Endereço

1. Preencha um CEP válido (ex: 01310-100)
2. O endereço deve ser preenchido automaticamente
3. Clique em "Continuar"

### Teste de Frete

1. Deve aparecer PAC e SEDEX
2. Selecione uma opção
3. O valor deve aparecer no resumo
4. Clique em "Continuar para Pagamento"

### Teste de Pagamento (Cartão)

Use credenciais de TESTE:

```
Cartão: 4509 9535 6623 3704
Nome: APRO
CVV: 123
Validade: 11/25
```

### Teste de Pagamento (PIX)

1. Clique no botão PIX
2. Deve gerar QR Code e código copia e cola
3. Em modo teste, é aprovado automaticamente após 5 min

### Teste de Pagamento (Boleto)

1. Clique no botão Boleto
2. Preencha o CPF
3. Deve gerar o boleto para download

---

## ✅ Checklist de Migração

- [ ] Backup do checkout antigo feito
- [ ] Novo modal importado
- [ ] Todos os arquivos atualizados
- [ ] Teste de checkout completo realizado
- [ ] Teste de cada método de pagamento
- [ ] Teste de cálculo de frete
- [ ] Verificado que não quebrou nada

---

## 🐛 Problemas Comuns

### "Mercado Pago não configurado"

**Solução:** Configure as credenciais no `.env`:

```bash
VITE_MERCADO_PAGO_PUBLIC_KEY=sua-chave
VITE_MERCADO_PAGO_ACCESS_TOKEN=seu-token
```

### "Erro ao calcular frete"

**Solução:** O sistema usa fallback automático. Valores estimados serão usados se a API dos Correios estiver indisponível. Isso é normal.

### Modal não abre

**Solução:** Verifique se o estado está funcionando:

```typescript
const [checkoutOpen, setCheckoutOpen] = useState(false);

// Verificar no console
console.log('Checkout open?', checkoutOpen);
```

### Carrinho vazio no checkout

**Solução:** Verifique se o `CartContext` está sendo usado corretamente:

```typescript
const { items } = useCart();
console.log('Items no carrinho:', items);
```

---

## 📞 Precisa de Ajuda?

### Documentação Completa

- `INTEGRACAO_MERCADO_PAGO_CORREIOS.md` - Guia completo
- `INICIO_RAPIDO.md` - Setup em 5 passos
- `RESUMO_INTEGRACAO.md` - Resumo geral

### Links Úteis

- **Mercado Pago Developers:** https://www.mercadopago.com.br/developers
- **Documentação API:** https://www.mercadopago.com.br/developers/pt/docs
- **Suporte:** https://www.mercadopago.com.br/help

---

## 🎉 Pronto!

Após seguir este guia, seu site estará usando o novo checkout integrado com Mercado Pago e Correios!

**Sua loja está pronta para receber pagamentos reais! 🚀💰**


