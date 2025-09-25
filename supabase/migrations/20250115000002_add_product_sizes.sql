-- Adicionar campo de tamanhos disponíveis para produtos (capacetes)
-- Tamanhos de 54 a 64 conforme solicitado

-- Adicionar coluna para armazenar os tamanhos disponíveis
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_sizes INTEGER[] DEFAULT '{}';

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.products.available_sizes IS 'Array de tamanhos disponíveis para o produto (ex: [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64])';

-- Criar índice para melhor performance em consultas por tamanho
CREATE INDEX IF NOT EXISTS idx_products_available_sizes ON public.products USING GIN(available_sizes);

-- Função auxiliar para verificar se um produto tem um tamanho específico
CREATE OR REPLACE FUNCTION public.product_has_size(product_id UUID, size INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.products 
    WHERE id = product_id 
    AND available_sizes @> ARRAY[size]
  );
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para obter produtos por tamanho
CREATE OR REPLACE FUNCTION public.get_products_by_size(size INTEGER)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  available_sizes INTEGER[],
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.available_sizes,
    p.is_active
  FROM public.products p
  WHERE p.available_sizes @> ARRAY[size]
  AND p.is_active = true
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;








