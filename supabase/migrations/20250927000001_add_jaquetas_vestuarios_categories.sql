-- Adicionar categorias para Jaquetas e Vestuários
-- Esta migração adiciona as categorias necessárias para os novos módulos do admin

-- Inserir categoria de Jaquetas se não existir
INSERT INTO public.categories (name, description, slug, icon, color, product_count) 
VALUES ('Jaquetas', 'Jaquetas de motociclista para proteção e estilo', 'jaquetas', 'Shield', 'from-yellow-500 to-orange-500', 0)
ON CONFLICT (slug) DO NOTHING;

-- Inserir categoria de Vestuário se não existir
INSERT INTO public.categories (name, description, slug, icon, color, product_count) 
VALUES ('Vestuário', 'Equipamentos de proteção e vestuário para motociclistas', 'vestuario', 'Shirt', 'from-indigo-500 to-purple-500', 0)
ON CONFLICT (slug) DO NOTHING;

-- Adicionar campos específicos para jaquetas e vestuário na tabela products (se não existirem)
DO $$ 
BEGIN
    -- Adicionar campo jacket_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' 
                  AND column_name = 'jacket_type') THEN
        ALTER TABLE public.products ADD COLUMN jacket_type TEXT;
    END IF;
    
    -- Adicionar campo clothing_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' 
                  AND column_name = 'clothing_type') THEN
        ALTER TABLE public.products ADD COLUMN clothing_type TEXT;
    END IF;
    
    -- Adicionar campo protection_level se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' 
                  AND column_name = 'protection_level') THEN
        ALTER TABLE public.products ADD COLUMN protection_level TEXT;
    END IF;
END $$;
