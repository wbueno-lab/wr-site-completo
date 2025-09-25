-- Desabilitar RLS temporariamente para testar
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Se a tabela payment_methods existir, desabilitar também
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
        ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Inserir alguns produtos de teste se não existirem
INSERT INTO products (name, description, price, stock_quantity, is_active, sku, image_url)
SELECT 
    'Capacete Integral WR-001',
    'Capacete integral com proteção total e design moderno',
    299.90,
    50,
    true,
    'WR-001',
    '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Capacete Integral WR-001');

INSERT INTO products (name, description, price, stock_quantity, is_active, sku, image_url)
SELECT 
    'Capacete Modular WR-002',
    'Capacete modular versátil para uso urbano e estrada',
    399.90,
    30,
    true,
    'WR-002',
    '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Capacete Modular WR-002');

INSERT INTO products (name, description, price, stock_quantity, is_active, sku, image_url)
SELECT 
    'Capacete Cross WR-003',
    'Capacete cross para trilhas e aventuras off-road',
    249.90,
    25,
    true,
    'WR-003',
    '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Capacete Cross WR-003');

-- Inserir categoria se não existir
INSERT INTO categories (name, slug, description, color, icon)
SELECT 
    'Capacetes Integrais',
    'capacetes-integrais',
    'Capacetes com proteção total',
    '#00ff88',
    'shield'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'capacetes-integrais');

INSERT INTO categories (name, slug, description, color, icon)
SELECT 
    'Capacetes Modulares',
    'capacetes-modulares',
    'Capacetes versáteis para uso urbano',
    '#00ff88',
    'shield'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'capacetes-modulares');

-- Atualizar produtos com categoria
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'capacetes-integrais' LIMIT 1)
WHERE name = 'Capacete Integral WR-001';

UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'capacetes-modulares' LIMIT 1)
WHERE name = 'Capacete Modular WR-002';

UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'capacetes-integrais' LIMIT 1)
WHERE name = 'Capacete Cross WR-003';

-- Verificar se os produtos foram criados
SELECT 
    id, 
    name, 
    price, 
    is_active, 
    category_id,
    image_url
FROM products 
ORDER BY created_at DESC;
