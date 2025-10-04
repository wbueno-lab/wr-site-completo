-- =====================================================
-- CORREÇÃO: ADICIONAR ORDER_ITEMS AOS PEDIDOS EXISTENTES
-- =====================================================

-- 1. Verificar se existem pedidos sem itens
SELECT 
    o.id,
    o.order_number,
    o.created_at,
    o.total_amount,
    COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.created_at, o.total_amount
HAVING COUNT(oi.id) = 0;

-- 2. Para cada pedido sem itens, criar um item de exemplo
-- (Isso é apenas para teste - em produção você precisaria dos dados reais)
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
        WHEN p.category_id IN (SELECT id FROM categories WHERE name LIKE '%Capacete%') THEN '58'
        WHEN p.category_id IN (SELECT id FROM categories WHERE name LIKE '%Jaqueta%') THEN 'M'
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
            WHEN p.category_id IN (SELECT id FROM categories WHERE name LIKE '%Capacete%') THEN '58'
            WHEN p.category_id IN (SELECT id FROM categories WHERE name LIKE '%Jaqueta%') THEN 'M'
            ELSE NULL
        END
    ) as product_snapshot
FROM orders o
CROSS JOIN LATERAL (
    SELECT * FROM products 
    WHERE is_active = true 
    ORDER BY RANDOM() 
    LIMIT 1
) p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
)
AND o.created_at >= NOW() - INTERVAL '30 days'; -- Apenas pedidos dos últimos 30 dias

-- 3. Verificar o resultado
SELECT 
    o.id,
    o.order_number,
    COUNT(oi.id) as items_count,
    array_agg(oi.selected_size) as sizes
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY o.id, o.order_number
ORDER BY o.created_at DESC;

-- 4. Garantir que as políticas RLS estão corretas
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem ver todos os itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;

-- Criar política permissiva para admins
CREATE POLICY "Admins podem ver todos os itens de pedidos" ON order_items
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Criar política para usuários verem seus próprios itens
CREATE POLICY "Usuários podem ver itens de seus pedidos" ON order_items
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );
