-- Migração para garantir que selected_size seja nullable
-- Esta migração corrige problemas de tipo de dados

-- Verificar se as colunas existem e ajustar se necessário
DO $$ 
BEGIN
    -- Para order_items
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        -- Alterar para permitir NULL explicitamente
        ALTER TABLE public.order_items 
        ALTER COLUMN selected_size DROP NOT NULL;
        
        -- Definir valor padrão como NULL
        ALTER TABLE public.order_items 
        ALTER COLUMN selected_size SET DEFAULT NULL;
    END IF;

    -- Para cart_items
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        -- Alterar para permitir NULL explicitamente
        ALTER TABLE public.cart_items 
        ALTER COLUMN selected_size DROP NOT NULL;
        
        -- Definir valor padrão como NULL
        ALTER TABLE public.cart_items 
        ALTER COLUMN selected_size SET DEFAULT NULL;
    END IF;
END $$;

-- Atualizar comentários
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered (nullable)';
COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size/number for the helmet in the cart (nullable)';
