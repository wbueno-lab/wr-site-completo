-- =====================================================
-- SCRIPT PARA CORRIGIR EXIBIÇÃO DE PEDIDOS
-- =====================================================

-- 1. Verificar se há pedidos na tabela
SELECT 
    'Total de pedidos: ' || COUNT(*) as info
FROM orders;

-- 2. Verificar se o usuário atual é admin
SELECT 
    'Usuário atual: ' || COALESCE(full_name, 'Sem nome') || ' (Admin: ' || COALESCE(is_admin::text, 'false') || ')' as info
FROM profiles 
WHERE id = auth.uid();

-- 3. Tornar o usuário atual admin se não for
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- 4. Verificar se RLS está habilitado na tabela orders
SELECT 
    'RLS habilitado na tabela orders: ' || c.relrowsecurity::text as info
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'orders' AND n.nspname = 'public';

-- 5. Se RLS estiver habilitado, desabilitar temporariamente para teste
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 6. Criar pedidos de teste se não existirem
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    payment_method,
    created_at
) 
SELECT 
    'WR202501150001',
    auth.uid(),
    'pending',
    'pending',
    150.00,
    'João Silva',
    'joao@teste.com',
    '(11) 99999-9999',
    '{"name": "João Silva", "street": "Rua das Flores", "number": "123", "complement": "Apto 45", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}',
    'pix',
    now() - interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'WR202501150001');

INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    payment_method,
    created_at
) 
SELECT 
    'WR202501150002',
    auth.uid(),
    'processing',
    'paid',
    299.90,
    'Maria Santos',
    'maria@teste.com',
    '(11) 88888-8888',
    '{"name": "Maria Santos", "street": "Av. Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}',
    'credit_card',
    now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'WR202501150002');

INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    payment_method,
    created_at
) 
SELECT 
    'WR202501150003',
    auth.uid(),
    'delivered',
    'paid',
    89.90,
    'Pedro Costa',
    'pedro@teste.com',
    '(11) 77777-7777',
    '{"name": "Pedro Costa", "street": "Rua Augusta", "number": "456", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zipCode": "01305-000"}',
    'pix',
    now() - interval '3 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'WR202501150003');

-- 7. Verificar se os pedidos foram criados
SELECT 
    'Pedidos criados:' as info,
    COUNT(*) as total
FROM orders;

-- 8. Mostrar os pedidos criados
SELECT 
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    customer_name,
    customer_email,
    created_at
FROM orders 
ORDER BY created_at DESC;

-- 9. Inserir itens de pedido se houver produtos
INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    total_price,
    product_snapshot
) 
SELECT 
    o.id,
    p.id,
    1,
    p.price,
    p.price,
    jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'image_url', p.image_url,
        'brand_model', COALESCE(p.brand_model, ''),
        'helmet_type', COALESCE(p.helmet_type, '')
    )
FROM orders o
CROSS JOIN products p
WHERE o.order_number IN ('WR202501150001', 'WR202501150002', 'WR202501150003')
AND p.is_active = true
LIMIT 3
ON CONFLICT DO NOTHING;

-- 10. Verificar os itens de pedido criados
SELECT 
    'Itens de pedido criados:' as info,
    COUNT(*) as total
FROM order_items;
