-- =====================================================
-- SCRIPT SIMPLES PARA CORRIGIR RLS DE PEDIDOS
-- =====================================================

-- 1. Remover políticas existentes de orders
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON orders;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON orders;
DROP POLICY IF EXISTS "Usuários podem criar pedidos" ON orders;
DROP POLICY IF EXISTS "Apenas admins podem atualizar pedidos" ON orders;
DROP POLICY IF EXISTS "Todos podem ver pedidos" ON orders;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar pedidos" ON orders;

-- 2. Remover políticas existentes de order_items
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Admins podem ver todos os itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Sistema pode inserir itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Todos podem ver itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar itens de pedidos" ON order_items;

-- 3. Criar políticas mais simples para orders
-- Todos podem ver pedidos (temporariamente para debug)
CREATE POLICY "Todos podem ver pedidos" ON orders
    FOR SELECT USING (true);

-- Apenas admins podem gerenciar pedidos
CREATE POLICY "Apenas admins podem gerenciar pedidos" ON orders
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- 4. Criar políticas para order_items
-- Todos podem ver itens de pedidos (temporariamente para debug)
CREATE POLICY "Todos podem ver itens de pedidos" ON order_items
    FOR SELECT USING (true);

-- Apenas admins podem gerenciar itens de pedidos
CREATE POLICY "Apenas admins podem gerenciar itens de pedidos" ON order_items
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- 5. Verificar se RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. Verificar as políticas criadas
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- 7. Testar se consegue ver pedidos
SELECT COUNT(*) as total_orders FROM orders;
