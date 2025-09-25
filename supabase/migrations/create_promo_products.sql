-- Script para criar produtos promocionais diretamente no banco de dados
-- Execute este script no SQL Editor do Supabase

-- Primeiro, garantir que a coluna available_sizes existe
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_sizes INTEGER[] DEFAULT '{}';

-- Verificar se existem categorias
SELECT id, name FROM categories LIMIT 5;

-- Inserir produtos promocionais
INSERT INTO products (name, description, price, original_price, stock_quantity, is_active, is_new, is_promo, category_id, sku, image_url, available_sizes)
SELECT 
  'Capacete WR Pro Max - Promoção Especial',
  'Capacete premium com tecnologia avançada de proteção. Material de alta qualidade e design moderno.',
  299.90,
  399.90,
  15,
  true,
  false,
  true,
  c.id,
  'WR-PROMO-001',
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  ARRAY[54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
FROM categories c 
WHERE c.name = 'Racing' 
LIMIT 1;

INSERT INTO products (name, description, price, original_price, stock_quantity, is_active, is_new, is_promo, category_id, sku, image_url, available_sizes)
SELECT 
  'Capacete WR Sport - Oferta Limitada',
  'Capacete esportivo com ventilação otimizada e sistema de retenção ajustável.',
  199.90,
  279.90,
  20,
  true,
  false,
  true,
  c.id,
  'WR-PROMO-002',
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  ARRAY[54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
FROM categories c 
WHERE c.name = 'Sport' 
LIMIT 1;

INSERT INTO products (name, description, price, original_price, stock_quantity, is_active, is_new, is_promo, category_id, sku, image_url, available_sizes)
SELECT 
  'Capacete WR Classic - Desconto Especial',
  'Capacete clássico com proteção confiável e conforto excepcional.',
  149.90,
  199.90,
  25,
  true,
  false,
  true,
  c.id,
  'WR-PROMO-003',
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  ARRAY[54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
FROM categories c 
WHERE c.name = 'Racing' 
LIMIT 1;

-- Atualizar produtos existentes para incluir tamanhos
UPDATE products 
SET available_sizes = ARRAY[54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
WHERE available_sizes IS NULL OR array_length(available_sizes, 1) = 0;

-- Verificar se os produtos foram criados e atualizados
SELECT id, name, price, original_price, is_promo, is_active, available_sizes
FROM products 
WHERE is_promo = true 
ORDER BY created_at DESC;

-- Verificar todos os produtos com tamanhos
SELECT id, name, available_sizes
FROM products 
WHERE available_sizes IS NOT NULL AND array_length(available_sizes, 1) > 0
ORDER BY name;
