-- Script para atualizar todos os produtos com tamanhos de capacete
-- Execute este script no SQL Editor do Supabase

-- Primeiro, verificar se a coluna available_sizes existe
-- Se não existir, criar a coluna
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'available_sizes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN available_sizes INTEGER[] DEFAULT '{}';
        
        COMMENT ON COLUMN public.products.available_sizes IS 'Array de tamanhos disponíveis para o produto (ex: [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64])';
        
        CREATE INDEX IF NOT EXISTS idx_products_available_sizes ON public.products USING GIN(available_sizes);
    END IF;
END $$;

-- Verificar produtos existentes sem tamanhos
SELECT id, name, available_sizes 
FROM products 
WHERE available_sizes IS NULL OR array_length(available_sizes, 1) = 0
ORDER BY name;

-- Atualizar todos os produtos para incluir tamanhos padrão de capacete
UPDATE products 
SET available_sizes = ARRAY[54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
WHERE available_sizes IS NULL OR array_length(available_sizes, 1) = 0;

-- Verificar se a atualização foi bem-sucedida
SELECT id, name, available_sizes
FROM products 
WHERE available_sizes IS NOT NULL AND array_length(available_sizes, 1) > 0
ORDER BY name;

-- Contar produtos com tamanhos
SELECT 
  COUNT(*) as total_produtos,
  COUNT(CASE WHEN available_sizes IS NOT NULL AND array_length(available_sizes, 1) > 0 THEN 1 END) as produtos_com_tamanhos
FROM products;
