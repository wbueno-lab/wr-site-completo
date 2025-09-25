-- =====================================================
-- SCRIPT PARA TESTAR ACESSO A PEDIDOS
-- =====================================================

-- 1. Verificar se há pedidos na tabela (sem RLS)
SET row_security = off;
SELECT COUNT(*) as total_orders FROM orders;
SET row_security = on;

-- 2. Verificar se há pedidos com RLS ativo
SELECT COUNT(*) as total_orders_with_rls FROM orders;

-- 3. Verificar usuário atual
SELECT auth.uid() as current_user_id;

-- 4. Verificar se o usuário atual é admin
SELECT 
    id,
    full_name,
    email,
    is_admin
FROM profiles 
WHERE id = auth.uid();

-- 5. Verificar políticas RLS ativas
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 6. Testar consulta simples de pedidos
SELECT 
    id,
    order_number,
    status,
    total_amount,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Se não houver pedidos, inserir um de teste
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method
) VALUES (
    'TEST-DEBUG-001',
    auth.uid(),
    'pending',
    'pending',
    50.00,
    '{"name": "Teste Debug", "street": "Rua Teste", "number": "123", "neighborhood": "Centro", "city": "Teste", "state": "TS", "zipCode": "12345-678"}',
    'teste'
) ON CONFLICT (order_number) DO NOTHING;

-- 8. Verificar se o pedido de teste foi criado
SELECT * FROM orders WHERE order_number = 'TEST-DEBUG-001';
