-- Melhorar suporte para galeria de imagens com até 8 imagens
-- Atualizar constraints e adicionar validações

-- Adicionar constraint para limitar galeria a 8 imagens
ALTER TABLE public.products 
ADD CONSTRAINT check_gallery_images_limit 
CHECK (jsonb_array_length(gallery_images) <= 8);

-- Adicionar constraint para garantir que gallery_images seja um array
ALTER TABLE public.products 
ADD CONSTRAINT check_gallery_images_array 
CHECK (jsonb_typeof(gallery_images) = 'array');

-- Atualizar comentários para refletir o novo limite
COMMENT ON COLUMN public.products.gallery_images IS 'Array de URLs das imagens da galeria (máximo 8 imagens)';

-- Função para validar e limitar imagens da galeria
CREATE OR REPLACE FUNCTION public.validate_gallery_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que gallery_images seja um array
  IF NEW.gallery_images IS NOT NULL AND jsonb_typeof(NEW.gallery_images) != 'array' THEN
    NEW.gallery_images := '[]'::jsonb;
  END IF;
  
  -- Limitar a 8 imagens
  IF NEW.gallery_images IS NOT NULL AND jsonb_array_length(NEW.gallery_images) > 8 THEN
    NEW.gallery_images := NEW.gallery_images[1:8];
  END IF;
  
  -- Remover valores nulos ou vazios
  IF NEW.gallery_images IS NOT NULL THEN
    NEW.gallery_images := (
      SELECT jsonb_agg(value) 
      FROM jsonb_array_elements(NEW.gallery_images) 
      WHERE value IS NOT NULL AND value != '""'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para validação automática
DROP TRIGGER IF EXISTS validate_gallery_images_trigger ON public.products;
CREATE TRIGGER validate_gallery_images_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.validate_gallery_images();

-- Função para obter estatísticas da galeria
CREATE OR REPLACE FUNCTION public.get_gallery_stats(product_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  gallery_count INTEGER;
  has_main_image BOOLEAN;
BEGIN
  SELECT 
    COALESCE(jsonb_array_length(gallery_images), 0),
    image_url IS NOT NULL
  INTO gallery_count, has_main_image
  FROM public.products
  WHERE id = product_id;
  
  result := jsonb_build_object(
    'gallery_count', gallery_count,
    'has_main_image', has_main_image,
    'total_images', gallery_count + CASE WHEN has_main_image THEN 1 ELSE 0 END,
    'can_add_more', gallery_count < 8,
    'slots_remaining', 8 - gallery_count
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Índice para melhor performance em consultas de galeria
CREATE INDEX IF NOT EXISTS idx_products_gallery_count 
ON public.products USING GIN ((jsonb_array_length(gallery_images)));
