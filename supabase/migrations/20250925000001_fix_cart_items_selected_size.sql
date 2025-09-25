-- Adicionar coluna selected_size à tabela cart_items se não existir
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size/number for the helmet in the cart';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);

-- Remover constraints existentes que não incluem selected_size
DROP INDEX IF EXISTS cart_items_user_id_product_id_key;
DROP INDEX IF EXISTS cart_items_session_id_product_id_key;

-- Criar índices únicos que consideram a numeração selecionada
-- Para usuários logados: user_id + product_id + selected_size devem ser únicos
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_product_size_unique 
ON public.cart_items (user_id, product_id, COALESCE(selected_size, -1)) 
WHERE user_id IS NOT NULL;

-- Para sessões: session_id + product_id + selected_size devem ser únicos  
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_session_product_size_unique 
ON public.cart_items (session_id, product_id, COALESCE(selected_size, -1)) 
WHERE session_id IS NOT NULL;
