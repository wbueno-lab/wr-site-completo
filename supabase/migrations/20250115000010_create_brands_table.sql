-- Criar tabela de marcas de capacetes
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  country_of_origin TEXT,
  founded_year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar coluna brand_id na tabela products
ALTER TABLE public.products 
ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Habilitar RLS na tabela brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para brands
CREATE POLICY "Brands are viewable by everyone"
  ON public.brands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage brands"
  ON public.brands FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Trigger para updated_at na tabela brands
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar contagem de produtos por marca
CREATE OR REPLACE FUNCTION public.update_brand_product_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem para a marca afetada
  IF TG_OP = 'DELETE' THEN
    UPDATE public.brands 
    SET updated_at = now()
    WHERE id = OLD.brand_id;
    RETURN OLD;
  ELSE
    UPDATE public.brands 
    SET updated_at = now()
    WHERE id = NEW.brand_id;
    
    -- Se atualizando e marca mudou, atualizar marca antiga também
    IF TG_OP = 'UPDATE' AND OLD.brand_id != NEW.brand_id THEN
      UPDATE public.brands 
      SET updated_at = now()
      WHERE id = OLD.brand_id;
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar marca quando produto muda
CREATE TRIGGER update_brand_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_brand_product_count();

-- Inserir marcas populares de capacetes
INSERT INTO public.brands (name, description, country_of_origin, founded_year) VALUES
('Shoei', 'Fabricante japonês de capacetes premium com foco em segurança e tecnologia', 'Japão', 1959),
('Arai', 'Marca japonesa conhecida por capacetes de alta qualidade e segurança', 'Japão', 1926),
('AGV', 'Marca italiana especializada em capacetes esportivos e de corrida', 'Itália', 1947),
('HJC', 'Fabricante coreano de capacetes com excelente custo-benefício', 'Coreia do Sul', 1971),
('Bell', 'Marca americana pioneira em capacetes com inovações em segurança', 'Estados Unidos', 1954),
('Schuberth', 'Fabricante alemão de capacetes premium com tecnologia avançada', 'Alemanha', 1922),
('Nolan', 'Marca italiana conhecida por capacetes modulares e inovação', 'Itália', 1972),
('Scorpion', 'Fabricante americano de capacetes com foco em estilo e performance', 'Estados Unidos', 2002),
('LS2', 'Marca espanhola de capacetes com boa relação custo-benefício', 'Espanha', 1990),
('Caberg', 'Fabricante italiano de capacetes modulares e integrais', 'Itália', 1974);

-- Atualizar produtos existentes com marcas (exemplo)
UPDATE public.products 
SET brand_id = (SELECT id FROM public.brands WHERE name = 'Shoei' LIMIT 1)
WHERE name LIKE '%Racing%' OR name LIKE '%Pro%';

UPDATE public.products 
SET brand_id = (SELECT id FROM public.brands WHERE name = 'HJC' LIMIT 1)
WHERE name LIKE '%Sport%' OR name LIKE '%Evolution%';

UPDATE public.products 
SET brand_id = (SELECT id FROM public.brands WHERE name = 'Bell' LIMIT 1)
WHERE name LIKE '%Urban%' OR name LIKE '%Classic%';

UPDATE public.products 
SET brand_id = (SELECT id FROM public.brands WHERE name = 'AGV' LIMIT 1)
WHERE name LIKE '%Adventure%' OR name LIKE '%Trail%';
