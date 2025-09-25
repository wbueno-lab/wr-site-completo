-- Migração FORÇADA para adicionar selected_size
-- Esta migração é mais agressiva e deve resolver o problema

-- Remover coluna se existir e recriar (para garantir que está correta)
ALTER TABLE public.order_items DROP COLUMN IF EXISTS selected_size;
ALTER TABLE public.cart_items DROP COLUMN IF EXISTS selected_size;

-- Adicionar colunas novamente
ALTER TABLE public.order_items ADD COLUMN selected_size INTEGER;
ALTER TABLE public.cart_items ADD COLUMN selected_size INTEGER;

-- Adicionar comentários
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';
COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size/number for the helmet in the cart';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);
CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);

-- Atualizar dados existentes se houver product_snapshot com selected_size
UPDATE public.order_items
SET selected_size = (product_snapshot->>'selected_size')::INTEGER
WHERE product_snapshot->>'selected_size' IS NOT NULL;

-- Verificar resultado
SELECT 
    'order_items' as table_name,
    COUNT(*) as total_rows,
    COUNT(selected_size) as rows_with_size,
    COUNT(*) - COUNT(selected_size) as rows_without_size
FROM public.order_items
UNION ALL
SELECT 
    'cart_items' as table_name,
    COUNT(*) as total_rows,
    COUNT(selected_size) as rows_with_size,
    COUNT(*) - COUNT(selected_size) as rows_without_size
FROM public.cart_items;
