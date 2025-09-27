-- Organizar marcas por tipo de produto (capacetes e jaquetas)
-- Esta migração adiciona um campo para identificar o tipo de produto de cada marca

-- Adicionar campo para identificar o tipo de produto da marca
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS product_types TEXT[] DEFAULT '{}';

-- Limpar todas as marcas existentes para começar do zero
DELETE FROM public.brands;

-- Inserir marcas de capacetes (apenas as especificadas)
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active, product_types) VALUES
('AGV', 'Marca italiana especializada em capacetes esportivos e de corrida', 'Itália', 1947, true, '{"capacetes"}'),
('Norisk', 'Fabricante brasileiro de capacetes e equipamentos de proteção', 'Brasil', 2010, true, '{"capacetes"}'),
('LS2', 'Marca espanhola de capacetes com boa relação custo-benefício', 'Espanha', 1990, true, '{"capacetes"}'),
('KYT', 'Marca italiana de capacetes esportivos de alta performance', 'Itália', 1990, true, '{"capacetes"}'),
('Race Tech', 'Fabricante brasileiro de capacetes esportivos', 'Brasil', 2008, true, '{"capacetes"}'),
('ASX', 'Marca brasileira de capacetes com design moderno', 'Brasil', 2012, true, '{"capacetes"}'),
('FW3', 'Fabricante brasileiro de capacetes urbanos e esportivos', 'Brasil', 2010, true, '{"capacetes"}'),
('Bieffe', 'Marca brasileira de capacetes com boa relação custo-benefício', 'Brasil', 2005, true, '{"capacetes"}'),
('Peels', 'Marca brasileira de capacetes urbanos e clássicos', 'Brasil', 1998, true, '{"capacetes"}'),
('Texx', 'Marca brasileira de capacetes, jaquetas e equipamentos de proteção para motociclistas', 'Brasil', 1985, true, '{"capacetes", "jaquetas"}');

-- Inserir marcas de jaquetas
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active, product_types) VALUES
('Alpinestars', 'Marca italiana líder mundial em equipamentos de proteção para motociclismo, especializada em jaquetas técnicas e inovadoras', 'Itália', 1963, true, '{"jaquetas"}'),
('X11', 'Marca brasileira reconhecida por suas jaquetas e equipamentos de alta qualidade para motociclistas', 'Brasil', 1995, true, '{"jaquetas"}');

-- Atualizar marcas que fazem tanto capacetes quanto jaquetas
UPDATE public.brands 
SET product_types = '{"capacetes", "jaquetas"}',
    description = 'Fabricante brasileiro de capacetes e jaquetas de proteção para motociclistas'
WHERE name = 'Norisk';

-- Criar índice para facilitar consultas por tipo de produto
CREATE INDEX IF NOT EXISTS idx_brands_product_types ON public.brands USING GIN (product_types);

-- Criar função para filtrar marcas por tipo de produto
CREATE OR REPLACE FUNCTION get_brands_by_product_type(product_type TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    country_of_origin TEXT,
    founded_year INTEGER,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT b.id, b.name, b.description, b.country_of_origin, b.founded_year, b.is_active
    FROM public.brands b
    WHERE b.is_active = true 
    AND product_type = ANY(b.product_types)
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON COLUMN public.brands.product_types IS 'Array de tipos de produtos que a marca fabrica: capacetes, jaquetas, vestuario';
COMMENT ON FUNCTION get_brands_by_product_type(TEXT) IS 'Função para buscar marcas por tipo de produto específico';

-- Exemplos de uso da função:
-- SELECT * FROM get_brands_by_product_type('capacetes');
-- SELECT * FROM get_brands_by_product_type('jaquetas');
