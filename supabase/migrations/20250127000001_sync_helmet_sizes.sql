-- Sincronizar tamanhos de capacetes
-- Copiar dados de helmet_numbers para available_sizes se available_sizes estiver vazio

-- Atualizar produtos que têm helmet_numbers mas não têm available_sizes
UPDATE public.products 
SET available_sizes = helmet_numbers
WHERE helmet_numbers IS NOT NULL 
  AND array_length(helmet_numbers, 1) > 0
  AND (available_sizes IS NULL OR array_length(available_sizes, 1) = 0);

-- Adicionar shell_sizes como strings para compatibilidade com sistema antigo
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shell_sizes TEXT[] DEFAULT '{}';

-- Sincronizar available_sizes para shell_sizes como strings
UPDATE public.products 
SET shell_sizes = array(
  SELECT size::TEXT 
  FROM unnest(available_sizes) AS size
)
WHERE available_sizes IS NOT NULL 
  AND array_length(available_sizes, 1) > 0
  AND (shell_sizes IS NULL OR array_length(shell_sizes, 1) = 0);

-- Criar índice para shell_sizes
CREATE INDEX IF NOT EXISTS idx_products_shell_sizes ON public.products USING GIN(shell_sizes);

-- Comentários para documentação
COMMENT ON COLUMN public.products.shell_sizes IS 'Array de tamanhos disponíveis como strings (ex: ["54", "56", "58"])';
COMMENT ON COLUMN public.products.available_sizes IS 'Array de tamanhos disponíveis como números (ex: [54, 56, 58])';

