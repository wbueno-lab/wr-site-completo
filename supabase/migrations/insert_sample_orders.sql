-- =====================================================
-- SCRIPT PARA INSERIR PEDIDOS DE TESTE
-- =====================================================

-- 1. Verificar se há usuários admin
SELECT id, full_name, email, is_admin 
FROM profiles 
WHERE is_admin = true;

-- 2. Se não houver admin, criar um (substitua o UUID pelo ID do usuário real)
-- INSERT INTO profiles (id, full_name, email, is_admin) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Admin Teste', 'admin@teste.com', true)
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- 3. Inserir pedidos de teste
INSERT INTO orders (
    id,
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
    gen_random_uuid(),
    'WR202501150001',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'pending',
    'pending',
    150.00,
    '{"name": "João Silva", "street": "Rua das Flores", "number": "123", "complement": "Apto 45", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}',
    'pix',
    '{"method": "pix", "status": "pending"}',
    now() - interval '2 days'
),
(
    gen_random_uuid(),
    'WR202501150002',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'processing',
    'paid',
    299.90,
    '{"name": "Maria Santos", "street": "Av. Paulista", "number": "1000", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}',
    'credit_card',
    '{"method": "credit_card", "status": "paid", "installments": 3, "card_brand": "Visa", "card_last_four": "1234"}',
    now() - interval '1 day'
),
(
    gen_random_uuid(),
    'WR202501150003',
    (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    'delivered',
    'paid',
    89.90,
    '{"name": "Pedro Costa", "street": "Rua Augusta", "number": "456", "neighborhood": "Consolação", "city": "São Paulo", "state": "SP", "zipCode": "01305-000"}',
    'pix',
    '{"method": "pix", "status": "paid"}',
    now() - interval '3 days'
)
ON CONFLICT (order_number) DO NOTHING;

-- 4. Verificar se os pedidos foram inseridos
SELECT 
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    created_at
FROM orders 
ORDER BY created_at DESC;

-- 5. Inserir itens de pedido de teste (assumindo que existem produtos)
INSERT INTO order_items (
    id,
    order_id,
    product_id,
    quantity,
    unit_price,
    total_price,
    product_snapshot
) 
SELECT 
    gen_random_uuid(),
    o.id,
    p.id,
    1,
    p.price,
    p.price,
    jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'image_url', p.image_url,
        'brand_model', p.brand_model,
        'helmet_type', p.helmet_type
    )
FROM orders o
CROSS JOIN products p
WHERE o.order_number IN ('WR202501150001', 'WR202501150002', 'WR202501150003')
AND p.is_active = true
LIMIT 3
ON CONFLICT DO NOTHING;

-- 6. Verificar os itens de pedido inseridos
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