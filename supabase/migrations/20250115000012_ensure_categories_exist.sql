-- Garantir que as categorias existam
INSERT INTO public.categories (name, description, slug, icon, color, product_count) VALUES
('Racing', 'Capacetes para alta performance', 'racing', 'Bike', 'from-red-500 to-orange-500', 0),
('Sport', 'Estilo e proteção urbana', 'sport', 'Shield', 'from-blue-500 to-cyan-500', 0),
('Adventure', 'Para todas as aventuras', 'adventure', 'Mountain', 'from-green-500 to-emerald-500', 0),
('Urban', 'Clássico e confortável', 'urban', 'Car', 'from-purple-500 to-pink-500', 0)
ON CONFLICT (slug) DO NOTHING;

