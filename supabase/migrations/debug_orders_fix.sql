-- =====================================================
-- SCRIPT PARA DIAGNOSTICAR E CORRIGIR PROBLEMA DOS PEDIDOS
-- =====================================================

-- 1. Verificar se há pedidos na tabela
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders;

-- 2. Verificar os últimos 5 pedidos
SELECT 
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    created_at,
    user_id
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Verificar usuários admin
SELECT 
    id,
    full_name,
    email,
    is_admin,
    created_at
FROM profiles 
WHERE is_admin = true;

-- 4. Verificar se RLS está habilitado na tabela orders
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'orders' AND n.nspname = 'public';

-- 5. Verificar políticas RLS para orders
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 6. Se não houver pedidos, criar alguns de teste
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method,
    customer_name,
    customer_email,
    created_at
) 
SELECT 
    'WR202501150001',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'pending',
    'pending',
    150.00,
    '{"name": "João Silva", "street": "Rua das Flores", "number": "123", "complement": "Apto 45", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}',
    'pix',
    'João Silva',
    'joao@teste.com',
    now() - interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'WR202501150001');

INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method,
    customer_name,
    customer_email,
    created_at
) 
SELECT 
    'WR202501150002',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'processing',
    'paid',
    299.90,
    '{"name": "Maria Santos", "street": "Av. Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}',
    'credit_card',
    'Maria Santos',
    'maria@teste.com',
    now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'WR202501150002');

INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method,
    customer_name,
    customer_email,
    created_at
) 
SELECT 
    'WR202501150003',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'delivered',
    'paid',
    89.90,
    '{"name": "Pedro Costa", "street": "Rua Augusta", "number": "456", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zipCode": "01305-000"}',
    'pix',
    'Pedro Costa',
    'pedro@teste.com',
    now() - interval '3 days'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'WR202501150003');

-- 7. Verificar se os pedidos foram criados
SELECT 
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    created_at,
    customer_name,
    customer_email
FROM orders 
ORDER BY created_at DESC;

-- 8. Inserir itens de pedido de teste (se houver produtos)
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

-- 9. Verificar os itens de pedido criados
SELECT 
    oi.id,
    o.order_number,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    oi.product_snapshot->>'name' as product_name
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.order_number IN ('WR202501150001', 'WR202501150002', 'WR202501150003');

-- 10. Verificar se o usuário atual é admin
SELECT 
    id,
    full_name,
    email,
    is_admin,
    'Você é admin: ' || CASE WHEN is_admin THEN 'SIM' ELSE 'NÃO' END as admin_status
FROM profiles 
WHERE id = auth.uid();
