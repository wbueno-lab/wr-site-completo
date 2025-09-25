-- Simple migration to add selected_size column
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Add comment
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';
