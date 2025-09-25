-- =====================================================
-- SCRIPT PARA CRIAR PEDIDOS DE TESTE
-- =====================================================

-- 1. Verificar se há usuários admin
SELECT 
    id,
    full_name,
    email,
    is_admin
FROM profiles 
WHERE is_admin = true;

-- 2. Se não houver admin, criar um (substitua pelo ID do seu usuário)
-- Primeiro, verifique seu ID de usuário:
SELECT auth.uid() as meu_user_id;

-- 3. Tornar o usuário atual admin (substitua pelo ID correto)
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- 4. Inserir pedidos de teste
INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    shipping_address,
    payment_method,
    payment_details,
    created_at
) VALUES 
(
    'WR202501150001',
    auth.uid(),
    'pending',
    'pending',
    150.00,
    '{"name": "João Silva", "street": "Rua das Flores", "number": "123", "complement": "Apto 45", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}',
    'pix',
    '{"method": "pix", "status": "pending"}',
    now() - interval '2 days'
),
(
    'WR202501150002',
    auth.uid(),
    'processing',
    'paid',
    299.90,
    '{"name": "Maria Santos", "street": "Av. Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}',
    'credit_card',
    '{"method": "credit_card", "status": "paid", "installments": 3, "card_brand": "Visa", "card_last_four": "1234"}',
    now() - interval '1 day'
),
(
    'WR202501150003',
    auth.uid(),
    'delivered',
    'paid',
    89.90,
    '{"name": "Pedro Costa", "street": "Rua Augusta", "number": "456", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zipCode": "01305-000"}',
    'pix',
    '{"method": "pix", "status": "paid"}',
    now() - interval '3 days'
)
ON CONFLICT (order_number) DO NOTHING;

-- 5. Verificar se os pedidos foram criados
SELECT 
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    created_at
FROM orders 
ORDER BY created_at DESC;

-- 6. Inserir itens de pedido de teste (se houver produtos)
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

-- 7. Verificar os itens de pedido criados
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
