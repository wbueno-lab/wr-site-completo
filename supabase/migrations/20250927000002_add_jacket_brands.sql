-- Adicionar marcas específicas de jaquetas de motociclista
-- Esta migração adiciona as marcas mencionadas pelo usuário

INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active) VALUES
('Alpinestars', 'Marca italiana líder mundial em equipamentos de proteção para motociclismo, conhecida por suas jaquetas técnicas e inovadoras', 'Itália', 1963, true),
('Texx', 'Marca brasileira especializada em equipamentos de proteção para motociclistas, oferecendo produtos de qualidade com excelente custo-benefício', 'Brasil', 1985, true),
('Norisk', 'Fabricante brasileiro de equipamentos de proteção individual, incluindo jaquetas e acessórios para motociclistas', 'Brasil', 2010, true),
('X11', 'Marca brasileira reconhecida por seus produtos de alta qualidade para motociclistas, incluindo jaquetas, capacetes e acessórios', 'Brasil', 1995, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  country_of_origin = EXCLUDED.country_of_origin,
  founded_year = EXCLUDED.founded_year,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Atualizar a marca LS2 se já existir, adicionando informação sobre jaquetas
UPDATE public.brands 
SET description = 'Marca espanhola conhecida por capacetes e equipamentos de proteção, incluindo jaquetas de alta qualidade com boa relação custo-benefício',
    updated_at = now()
WHERE name = 'LS2';

-- Inserir LS2 se não existir
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active) 
SELECT 'LS2', 'Marca espanhola conhecida por capacetes e equipamentos de proteção, incluindo jaquetas de alta qualidade com boa relação custo-benefício', 'Espanha', 1990, true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'LS2');

-- Comentários para documentação
COMMENT ON TABLE public.brands IS 'Tabela de marcas de equipamentos para motociclistas, incluindo capacetes, jaquetas e vestuário';

-- Verificar se as marcas foram inseridas corretamente
-- SELECT name, description, country_of_origin FROM public.brands WHERE name IN ('Alpinestars', 'LS2', 'Norisk', 'Texx', 'X11') ORDER BY name;
