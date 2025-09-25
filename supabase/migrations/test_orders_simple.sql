-- =====================================================
-- TESTE SIMPLES PARA VERIFICAR PEDIDOS
-- =====================================================

-- 1. Verificar se há pedidos
SELECT COUNT(*) as total_orders FROM orders;

-- 2. Verificar se o usuário atual é admin
SELECT 
    id,
    full_name,
    email,
    is_admin
FROM profiles 
WHERE id = auth.uid();

-- 3. Se não for admin, tornar admin
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- 4. Criar um pedido de teste simples
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    customer_name,
    customer_email,
    created_at
) VALUES (
    'TEST-' || extract(epoch from now())::text,
    auth.uid(),
    'pending',
    'pending',
    100.00,
    'Teste Admin',
    'admin@teste.com',
    now()
);

-- 5. Verificar se o pedido foi criado
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
ORDER BY created_at DESC 
LIMIT 5;
