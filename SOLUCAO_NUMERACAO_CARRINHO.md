# Solução - Problema de Numeração no Carrinho

## Problema Identificado

O sistema não estava tratando produtos com numerações diferentes como itens separados no carrinho. Quando um usuário adicionava múltiplos capacetes com numerações diferentes, eles eram agrupados como um único item, causando problemas na gestão do carrinho e nos pedidos.

## Análise do Problema

1. **Identificação Incorreta**: A lógica do carrinho usava apenas `product_id` para identificar itens únicos
2. **Armazenamento Local**: A numeração era armazenada apenas no localStorage, não no banco de dados
3. **Visualização Admin**: A página admin não mostrava claramente a numeração selecionada nos detalhes dos pedidos

## Soluções Implementadas

### 1. Migração do Banco de Dados

**Arquivo**: `supabase/migrations/20250925000001_fix_cart_items_selected_size.sql`

- Adicionada coluna `selected_size` à tabela `cart_items`
- Criados índices únicos que consideram `user_id/session_id + product_id + selected_size`
- Garantida integridade referencial para produtos com numerações diferentes

**Arquivo**: `supabase/migrations/20250925000002_ensure_order_items_selected_size.sql`

- Garantida a existência da coluna `selected_size` na tabela `order_items`
- Criado índice para melhor performance nas consultas

### 2. Correção da Lógica do Carrinho

**Arquivo**: `src/contexts/CartContext.tsx`

#### Alterações Principais:

1. **Query de Carregamento**:
   ```typescript
   .select(`
     id,
     product_id,
     quantity,
     selected_size,  // ← Adicionado
     user_id,
     session_id,
     products!inner(...)
   `)
   ```

2. **Identificação de Itens Únicos**:
   ```typescript
   // Antes: Apenas product_id
   const existingItem = items.find(item => item.product_id === productId);
   
   // Depois: product_id + selected_size
   const existingItem = items.find(item => {
     return item.product_id === productId && item.selectedSize === selectedSize;
   });
   ```

3. **Inserção de Novos Itens**:
   ```typescript
   const cartData = {
     user_id: user.id,
     product_id: productId,
     quantity,
     selected_size: selectedSize  // ← Armazenado no banco
   };
   ```

4. **Função addMultipleToCart**:
   - Corrigida para verificar `selected_size` diretamente no banco
   - Removida dependência do localStorage para identificação

### 3. Atualização do PaymentService

**Arquivo**: `src/services/paymentService.ts`

1. **Criação de Pedidos**:
   ```typescript
   const orderItemData = {
     order_id: data.id,
     product_id: item.product_id,
     quantity: item.quantity,
     unit_price: item.price,
     total_price: item.price * item.quantity,
     selected_size: item.selectedSize,  // ← Incluído nos order_items
     product_snapshot: { ... }
   };
   ```

2. **Queries Atualizadas**:
   - `getOrder()`: Incluído `selected_size` na query
   - `getUserOrders()`: Incluído `selected_size` na query

### 4. Visualização Admin Aprimorada

**Arquivo**: `src/components/admin/OrderManager.tsx`

1. **Exibição da Numeração**:
   ```typescript
   // Verificar se há selected_size diretamente no item
   let selectedSize = item.selected_size;
   
   // Se não tiver, verificar no product_snapshot
   if (!selectedSize && item.product_snapshot && typeof item.product_snapshot === 'object') {
     selectedSize = item.product_snapshot.selected_size;
   }
   
   if (selectedSize) {
     return (
       <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
         Numeração {selectedSize}
       </Badge>
     );
   }
   ```

2. **Interface Melhorada**:
   - Badge destacado em verde para numerações específicas
   - Texto claro "Numeração não especificada" quando não há numeração
   - Compatibilidade com campos antigos (`helmet_size`, `helmet_sizes`)

### 5. RealtimeContext Atualizado

**Arquivo**: `src/contexts/RealtimeContext.tsx`

- Query de pedidos já incluía `selected_size` (linha 272)
- Mantida compatibilidade com sistema em tempo real

## Benefícios da Solução

1. **Identificação Única**: Cada produto + numeração é tratado como item separado
2. **Integridade de Dados**: Numeração armazenada no banco, não apenas localStorage
3. **Visualização Clara**: Admin pode ver exatamente qual numeração foi selecionada
4. **Compatibilidade**: Mantida compatibilidade com pedidos antigos
5. **Performance**: Índices otimizados para consultas rápidas

## Como Testar

1. **Adicionar Produtos com Numerações**:
   - Adicione um capacete com numeração 58
   - Adicione o mesmo capacete com numeração 60
   - Verifique se aparecem como 2 itens separados no carrinho

2. **Verificar Admin**:
   - Faça um pedido com produtos numerados
   - Acesse a página admin
   - Verifique se a numeração aparece nos detalhes do pedido

3. **Atualizar Quantidade**:
   - Altere a quantidade de um item específico
   - Verifique se apenas aquele item (com aquela numeração) é afetado

## Arquivos Modificados

- `supabase/migrations/20250925000001_fix_cart_items_selected_size.sql`
- `supabase/migrations/20250925000002_ensure_order_items_selected_size.sql`
- `src/contexts/CartContext.tsx`
- `src/services/paymentService.ts`
- `src/components/admin/OrderManager.tsx`

## Status

✅ **Implementação Completa**
- Problema de numeração no carrinho resolvido
- Visualização admin implementada
- Migrações do banco aplicadas
- Testes recomendados para validação final

