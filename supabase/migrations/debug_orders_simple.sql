-- =====================================================
-- SCRIPT SIMPLES DE DEBUG PARA PEDIDOS (COMPATÍVEL COM SUPABASE)
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

-- 3. Verificar se há order_items
SELECT 
    COUNT(*) as total_order_items,
    COUNT(DISTINCT order_id) as orders_with_items
FROM order_items;

-- 4. Verificar usuários admin
SELECT 
    id,
    full_name,
    email,
    is_admin,
    created_at
FROM profiles 
WHERE is_admin = true;

-- 5. Verificar se há produtos ativos
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
FROM products;

-- 6. Criar um pedido de teste se não houver nenhum
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method
) 
SELECT 
    'TEST-DEBUG-' || to_char(now(), 'YYYYMMDDHH24MISS'),
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'pending',
    'pending',
    100.00,
    '{"name": "Teste Debug", "street": "Rua Teste", "number": "123", "neighborhood": "Centro", "city": "Teste", "state": "TS", "zipCode": "12345-678"}',
    'teste'
WHERE NOT EXISTS (SELECT 1 FROM orders LIMIT 1);

-- 7. Verificar se o pedido de teste foi criado
SELECT * FROM orders WHERE order_number LIKE 'TEST-DEBUG-%';

-- 8. Verificar políticas RLS para orders
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 9. Verificar se RLS está habilitado na tabela orders
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'orders' AND n.nspname = 'public';
