-- Garantir que as categorias principais existam para organização por tipo de produto
-- Esta migração cria as categorias principais: Capacetes, Jaquetas, Vestuário

-- Inserir categoria principal de Capacetes se não existir
INSERT INTO public.categories (name, description, slug, icon, color, product_count) 
VALUES ('Capacetes', 'Capacetes de motociclista para proteção e segurança', 'capacetes', 'Shield', 'from-blue-500 to-cyan-500', 0)
ON CONFLICT (slug) DO NOTHING;

-- Inserir categoria de Jaquetas se não existir (já deve existir, mas garantir)
INSERT INTO public.categories (name, description, slug, icon, color, product_count) 
VALUES ('Jaquetas', 'Jaquetas de motociclista para proteção e estilo', 'jaquetas', 'Shield', 'from-yellow-500 to-orange-500', 0)
ON CONFLICT (slug) DO NOTHING;

-- Inserir categoria de Vestuário se não existir (já deve existir, mas garantir)
INSERT INTO public.categories (name, description, slug, icon, color, product_count) 
VALUES ('Vestuário', 'Equipamentos de proteção e vestuário para motociclistas', 'vestuario', 'Shirt', 'from-indigo-500 to-purple-500', 0)
ON CONFLICT (slug) DO NOTHING;

-- Verificar se as categorias foram criadas
SELECT id, name, slug, description, icon, color FROM public.categories 
WHERE slug IN ('capacetes', 'jaquetas', 'vestuario')
ORDER BY name;
