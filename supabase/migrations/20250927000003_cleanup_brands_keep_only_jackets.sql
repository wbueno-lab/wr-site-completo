-- Limpar marcas de capacetes e manter apenas marcas de jaquetas
-- Esta migração remove todas as marcas antigas de capacetes e mantém apenas as marcas de jaquetas

-- Primeiro, remover a associação de produtos com marcas que serão excluídas
-- (definir brand_id como NULL para produtos que usam marcas de capacetes)
UPDATE public.products 
SET brand_id = NULL 
WHERE brand_id IN (
  SELECT id FROM public.brands 
  WHERE name IN ('Shoei', 'Arai', 'AGV', 'HJC', 'Bell', 'Schuberth', 'Nolan', 'Scorpion', 'Caberg')
);

-- Remover marcas de capacetes específicas
DELETE FROM public.brands 
WHERE name IN (
  'Shoei', 
  'Arai', 
  'AGV', 
  'HJC', 
  'Bell', 
  'Schuberth', 
  'Nolan', 
  'Scorpion', 
  'Caberg'
);

-- Atualizar a descrição da LS2 para focar em jaquetas (já que ela permanece)
UPDATE public.brands 
SET description = 'Marca espanhola especializada em jaquetas e equipamentos de proteção para motociclistas com excelente qualidade e custo-benefício',
    updated_at = now()
WHERE name = 'LS2';

-- Garantir que as marcas de jaquetas estão presentes e ativas
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active) VALUES
('Alpinestars', 'Marca italiana líder mundial em equipamentos de proteção para motociclismo, conhecida por suas jaquetas técnicas e inovadoras', 'Itália', 1963, true),
('Texx', 'Marca brasileira especializada em equipamentos de proteção para motociclistas, oferecendo jaquetas de qualidade com excelente custo-benefício', 'Brasil', 1985, true),
('Norisk', 'Fabricante brasileiro de equipamentos de proteção individual, incluindo jaquetas e acessórios para motociclistas', 'Brasil', 2010, true),
('X11', 'Marca brasileira reconhecida por seus produtos de alta qualidade para motociclistas, incluindo jaquetas, capacetes e acessórios', 'Brasil', 1995, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  country_of_origin = EXCLUDED.country_of_origin,
  founded_year = EXCLUDED.founded_year,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Comentário para documentação
COMMENT ON TABLE public.brands IS 'Tabela de marcas focada em jaquetas e equipamentos de proteção para motociclistas';

-- Verificar quais marcas restaram após a limpeza
-- SELECT name, description, country_of_origin FROM public.brands ORDER BY name;
