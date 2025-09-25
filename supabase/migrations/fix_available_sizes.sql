-- Script para corrigir o problema da coluna available_sizes
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, adicionar a coluna se ela não existir
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_sizes INTEGER[] DEFAULT '{}';

-- 2. Adicionar comentário para documentação
COMMENT ON COLUMN public.products.available_sizes IS 'Array de tamanhos disponíveis para o produto (ex: [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64])';

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_available_sizes ON public.products USING GIN(available_sizes);

-- 4. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
AND column_name = 'available_sizes';

-- 5. Atualizar todos os produtos para incluir tamanhos padrão
UPDATE products 
SET available_sizes = ARRAY[54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
WHERE available_sizes IS NULL OR array_length(available_sizes, 1) = 0;

-- 6. Verificar se a atualização foi bem-sucedida
SELECT id, name, available_sizes
FROM products 
ORDER BY name
LIMIT 5;
