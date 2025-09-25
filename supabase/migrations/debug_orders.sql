-- =====================================================
-- SCRIPT DE DEBUG PARA PEDIDOS
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

-- 4. Verificar políticas RLS para orders
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- 5. Verificar se a tabela orders tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- 6. Verificar usuários admin
SELECT 
    id,
    full_name,
    email,
    is_admin,
    created_at
FROM profiles 
WHERE is_admin = true;

-- 7. Verificar se há dados de teste
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method
) VALUES (
    'TEST001',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'pending',
    'pending',
    100.00,
    '{"name": "Teste", "street": "Rua Teste", "number": "123", "neighborhood": "Centro", "city": "Teste", "state": "TS", "zipCode": "12345-678"}',
    'teste'
) ON CONFLICT (order_number) DO NOTHING;

-- 8. Verificar se o pedido de teste foi criado
SELECT * FROM orders WHERE order_number = 'TEST001';

-- 9. Verificar order_items do pedido de teste
SELECT * FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_number = 'TEST001');
