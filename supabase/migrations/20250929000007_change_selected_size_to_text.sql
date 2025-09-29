-- Alterar o tipo da coluna selected_size de INTEGER para TEXT para suportar tanto números (capacetes) quanto strings (jaquetas)

-- Primeiro, alterar a coluna em order_items
ALTER TABLE public.order_items 
ALTER COLUMN selected_size TYPE TEXT USING selected_size::TEXT;

-- Atualizar comentário
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size for the product: number for helmets (53-64) or string for jackets (PP, P, M, G, GG, etc.)';

-- Alterar também em cart_items se existir a coluna
ALTER TABLE public.cart_items 
ALTER COLUMN selected_size TYPE TEXT USING selected_size::TEXT;

-- Atualizar comentário para cart_items
COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size for the product: number for helmets (53-64) or string for jackets (PP, P, M, G, GG, etc.)';

-- Recriar índices se necessário
DROP INDEX IF EXISTS idx_order_items_selected_size;
CREATE INDEX idx_order_items_selected_size ON public.order_items(selected_size);

DROP INDEX IF EXISTS idx_cart_items_selected_size;
CREATE INDEX idx_cart_items_selected_size ON public.cart_items(selected_size);
