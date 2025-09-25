-- Add selected_size column to cart_items table
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN public.cart_items.selected_size IS 'The selected size/number for the helmet in the cart';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);

-- Remove existing constraints
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_session_id_product_id_key;

-- Remove duplicate entries keeping only the most recent one for each user_id, product_id combination
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, product_id
           ORDER BY added_at DESC
         ) as row_num
  FROM public.cart_items
  WHERE user_id IS NOT NULL
)
DELETE FROM public.cart_items
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Remove duplicate entries for session_id
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY session_id, product_id
           ORDER BY added_at DESC
         ) as row_num
  FROM public.cart_items
  WHERE session_id IS NOT NULL
)
DELETE FROM public.cart_items
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Add new unique constraints that include selected_size
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_id_product_id_size_key 
ON public.cart_items (user_id, product_id, COALESCE(selected_size, -1)) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_session_id_product_id_size_key 
ON public.cart_items (session_id, product_id, COALESCE(selected_size, -1)) 
WHERE session_id IS NOT NULL;