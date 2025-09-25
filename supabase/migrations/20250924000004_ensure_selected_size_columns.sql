-- Ensure selected_size columns exist in both tables
-- This migration is more robust and handles edge cases

-- For order_items table
DO $$ 
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'selected_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN selected_size INTEGER;
        COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';
    END IF;
END $$;

-- For cart_items table
DO $$ 
BEGIN
    -- Check if column exists, if not add it
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);
CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);

-- Update existing order_items to extract selected_size from product_snapshot if available
UPDATE public.order_items
SET selected_size = (product_snapshot->>'selected_size')::INTEGER
WHERE product_snapshot->>'selected_size' IS NOT NULL 
AND selected_size IS NULL;

-- Show current state
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
