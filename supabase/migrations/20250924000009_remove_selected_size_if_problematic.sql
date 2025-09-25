-- Migração para remover selected_size se estiver causando problemas
-- Esta é uma solução drástica para resolver o erro de tipo

-- Verificar se as colunas existem e remover se necessário
DO $$ 
BEGIN
    -- Para order_items - remover selected_size se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.order_items DROP COLUMN selected_size;
        RAISE NOTICE 'Coluna selected_size removida de order_items';
    END IF;

    -- Para cart_items - remover selected_size se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.cart_items DROP COLUMN selected_size;
        RAISE NOTICE 'Coluna selected_size removida de cart_items';
    END IF;
END $$;

-- Remover índices relacionados se existirem
DROP INDEX IF EXISTS idx_order_items_selected_size;
DROP INDEX IF EXISTS idx_cart_items_selected_size;
