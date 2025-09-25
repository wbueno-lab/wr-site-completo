-- Garantir que order_items tenha a coluna selected_size
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size INTEGER;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.order_items.selected_size IS 'The selected size/number for the helmet when ordered';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);

