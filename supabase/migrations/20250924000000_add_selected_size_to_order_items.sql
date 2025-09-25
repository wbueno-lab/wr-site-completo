-- Add selected_size column to order_items table
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Update existing rows to extract selected_size from product_snapshot if available
UPDATE public.order_items
SET selected_size = (product_snapshot->>'selected_size')::INTEGER
WHERE product_snapshot->>'selected_size' IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';
