-- Converter available_sizes de INTEGER[] para TEXT[] para suportar tamanhos como strings
-- Isso permite usar tamanhos como PP, P, M, G, GG, 3G, 4G, etc.

-- Primeiro, criar uma coluna temporária para armazenar os dados convertidos
ALTER TABLE public.products 
ADD COLUMN available_sizes_temp TEXT[] DEFAULT '{}';

-- Converter os dados existentes de INTEGER[] para TEXT[]
UPDATE public.products 
SET available_sizes_temp = (
  SELECT ARRAY_AGG(size::TEXT) 
  FROM unnest(available_sizes) AS size
)
WHERE available_sizes IS NOT NULL 
  AND array_length(available_sizes, 1) > 0;

-- Remover a coluna original
ALTER TABLE public.products 
DROP COLUMN available_sizes;

-- Renomear a coluna temporária para o nome original
ALTER TABLE public.products 
RENAME COLUMN available_sizes_temp TO available_sizes;

-- Adicionar comentário atualizado
COMMENT ON COLUMN public.products.available_sizes IS 'Array de tamanhos disponíveis como strings (ex: [PP, P, M, G, GG, 3G, 4G, 5G])';

-- Recriar o índice GIN para melhor performance
DROP INDEX IF EXISTS idx_products_available_sizes;
CREATE INDEX idx_products_available_sizes ON public.products USING GIN(available_sizes);

-- Atualizar a função de validação se existir
CREATE OR REPLACE FUNCTION public.validate_available_sizes()
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que available_sizes seja um array
  IF NEW.available_sizes IS NOT NULL AND jsonb_typeof(NEW.available_sizes::jsonb) != 'array' THEN
    NEW.available_sizes := '{}';
  END IF;
  
  -- Remover valores nulos ou vazios
  IF NEW.available_sizes IS NOT NULL THEN
    NEW.available_sizes := (
      SELECT ARRAY_AGG(value) 
      FROM unnest(NEW.available_sizes) AS value
      WHERE value IS NOT NULL AND value != ''
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para validação automática
DROP TRIGGER IF EXISTS validate_available_sizes_trigger ON public.products;
CREATE TRIGGER validate_available_sizes_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.validate_available_sizes();

-- Verificar os dados convertidos
SELECT 
  id, 
  name, 
  available_sizes,
  array_length(available_sizes, 1) as size_count
FROM public.products 
WHERE available_sizes IS NOT NULL 
  AND array_length(available_sizes, 1) > 0
LIMIT 10;
