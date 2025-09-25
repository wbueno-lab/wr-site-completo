-- Drop existing column if it exists to avoid conflicts
ALTER TABLE public.order_items DROP COLUMN IF EXISTS selected_size;

-- Add selected_size column to order_items table
ALTER TABLE public.order_items ADD COLUMN selected_size INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);

-- Update existing rows to extract selected_size from product_snapshot if available
UPDATE public.order_items
SET selected_size = (product_snapshot->>'selected_size')::INTEGER
WHERE product_snapshot->>'selected_size' IS NOT NULL;

-- Add trigger to automatically update selected_size in product_snapshot
CREATE OR REPLACE FUNCTION public.update_order_item_product_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.selected_size IS NOT NULL THEN
        NEW.product_snapshot = jsonb_set(
            COALESCE(NEW.product_snapshot, '{}'::jsonb),
            '{selected_size}',
            to_jsonb(NEW.selected_size)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_item_product_snapshot_trigger ON public.order_items;

CREATE TRIGGER update_order_item_product_snapshot_trigger
    BEFORE INSERT OR UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_item_product_snapshot();
