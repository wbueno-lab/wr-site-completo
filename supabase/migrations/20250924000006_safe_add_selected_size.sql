-- Migração SEGURA para adicionar selected_size
-- Esta migração evita erros de conversão

-- 1. Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Para order_items
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN selected_size INTEGER;
        COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';
    END IF;

    -- Para cart_items
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cart_items ADD COLUMN selected_size INTEGER;
        COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size/number for the helmet in the cart';
    END IF;
END $$;

-- 2. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);
CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);

-- 3. Atualizar dados existentes de forma SEGURA
-- Só atualiza se o valor for um número válido
UPDATE public.order_items
SET selected_size = CASE 
    WHEN product_snapshot->>'selected_size' IS NOT NULL 
    AND product_snapshot->>'selected_size' != 'null'
    AND product_snapshot->>'selected_size' != ''
    AND product_snapshot->>'selected_size' ~ '^[0-9]+$'
    THEN (product_snapshot->>'selected_size')::INTEGER
    ELSE NULL
END
WHERE product_snapshot IS NOT NULL;

-- 4. Verificar resultado
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
