-- Adicionar coluna selected_size à tabela cart_items
ALTER TABLE public.cart_items 
ADD COLUMN selected_size INTEGER;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.cart_items.selected_size IS 'Tamanho selecionado do produto (em cm)';

-- Atualizar a constraint UNIQUE para incluir selected_size
-- Primeiro, remover as constraints existentes
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_session_id_product_id_key;

-- Adicionar novas constraints que incluem selected_size
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_user_id_product_id_selected_size_key 
UNIQUE (user_id, product_id, selected_size);

ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_session_id_product_id_selected_size_key 
UNIQUE (session_id, product_id, selected_size);
