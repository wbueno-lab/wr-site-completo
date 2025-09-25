-- Migração MUITO SIMPLES e SEGURA
-- Apenas adiciona as colunas sem tentar converter dados existentes

-- Adicionar coluna em order_items se não existir
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Adicionar coluna em cart_items se não existir  
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Adicionar comentários
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';
COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size/number for the helmet in the cart';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);
CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);
