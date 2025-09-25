-- Atualizar tabela products para suportar galeria de imagens
-- Adicionar campos para diferentes tamanhos de imagem

-- Adicionar campos para variantes de imagem
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS image_medium TEXT,
ADD COLUMN IF NOT EXISTS image_large TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '{}'::jsonb;

-- Atualizar produtos existentes para usar o campo image_url como image_large
UPDATE public.products 
SET image_large = image_url 
WHERE image_large IS NULL AND image_url IS NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_image_thumbnail ON public.products(image_thumbnail);
CREATE INDEX IF NOT EXISTS idx_products_image_medium ON public.products(image_medium);
CREATE INDEX IF NOT EXISTS idx_products_image_large ON public.products(image_large);
CREATE INDEX IF NOT EXISTS idx_products_gallery_images ON public.products USING GIN(gallery_images);

-- Comentários para documentação
COMMENT ON COLUMN public.products.image_thumbnail IS 'URL da imagem thumbnail (300x300)';
COMMENT ON COLUMN public.products.image_medium IS 'URL da imagem média (800x800)';
COMMENT ON COLUMN public.products.image_large IS 'URL da imagem grande (1920x1920)';
COMMENT ON COLUMN public.products.gallery_images IS 'Array de URLs das imagens da galeria';
COMMENT ON COLUMN public.products.image_metadata IS 'Metadados das imagens (tamanhos, compressão, etc.)';

-- Função para atualizar metadados da imagem
CREATE OR REPLACE FUNCTION public.update_image_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Se image_url foi atualizado, copia para image_large se não estiver definido
  IF NEW.image_url IS NOT NULL AND NEW.image_large IS NULL THEN
    NEW.image_large := NEW.image_url;
  END IF;
  
  -- Se image_large foi atualizado, copia para image_url se não estiver definido
  IF NEW.image_large IS NOT NULL AND NEW.image_url IS NULL THEN
    NEW.image_url := NEW.image_large;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar metadados automaticamente
CREATE TRIGGER update_image_metadata_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_image_metadata();

-- Função para obter a melhor imagem disponível
CREATE OR REPLACE FUNCTION public.get_best_image_url(product_id UUID, size TEXT DEFAULT 'large')
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT CASE 
    WHEN size = 'thumbnail' AND image_thumbnail IS NOT NULL THEN image_thumbnail
    WHEN size = 'medium' AND image_medium IS NOT NULL THEN image_medium
    WHEN size = 'large' AND image_large IS NOT NULL THEN image_large
    WHEN image_large IS NOT NULL THEN image_large
    WHEN image_medium IS NOT NULL THEN image_medium
    WHEN image_thumbnail IS NOT NULL THEN image_thumbnail
    WHEN image_url IS NOT NULL THEN image_url
    ELSE '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
  END INTO result
  FROM public.products
  WHERE id = product_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para obter todas as imagens de um produto
CREATE OR REPLACE FUNCTION public.get_product_images(product_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'thumbnail', image_thumbnail,
    'medium', image_medium,
    'large', image_large,
    'gallery', gallery_images,
    'metadata', image_metadata
  ) INTO result
  FROM public.products
  WHERE id = product_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;



