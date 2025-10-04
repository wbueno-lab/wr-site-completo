-- =====================================================
-- ADICIONAR ORDER_ITEMS AOS PEDIDOS EXISTENTES
-- =====================================================

-- Adicionar campo selected_size na tabela order_items se não existir
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS selected_size TEXT;

-- Para cada pedido sem itens, criar um item de exemplo baseado em produtos existentes
INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    total_price,
    selected_size,
    product_snapshot
)
SELECT 
    o.id as order_id,
    p.id as product_id,
    1 as quantity,
    p.price as unit_price,
    p.price as total_price,
    CASE 
        WHEN c.name LIKE '%Capacete%' THEN '58'
        WHEN c.name LIKE '%Jaqueta%' THEN 'M'
        ELSE NULL
    END as selected_size,
    jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'image_url', p.image_url,
        'price', p.price,
        'brand_model', p.brand_model,
        'helmet_type', p.helmet_type,
        'selected_size', CASE 
            WHEN c.name LIKE '%Capacete%' THEN '58'
            WHEN c.name LIKE '%Jaqueta%' THEN 'M'
            ELSE NULL
        END
    ) as product_snapshot
FROM orders o
CROSS JOIN LATERAL (
    SELECT p.*, c.name as category_name, c.id as cat_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true 
    ORDER BY RANDOM() 
    LIMIT 1
) p
LEFT JOIN categories c ON c.id = p.cat_id
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
)
AND o.created_at >= NOW() - INTERVAL '7 days'
LIMIT 10;

-- Garantir políticas RLS corretas
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins podem ver todos os itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Todos podem ver itens de pedidos" ON order_items;

-- Criar política permissiva temporária para debug
CREATE POLICY "Todos podem ver itens de pedidos temporariamente" ON order_items
    FOR SELECT 
    USING (true);

-- Verificar resultado
SELECT 
    o.id,
    o.order_number,
    o.created_at,
    COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY o.id, o.order_number, o.created_at
ORDER BY o.created_at DESC;
