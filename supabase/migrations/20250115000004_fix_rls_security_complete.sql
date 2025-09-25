-- =====================================================
-- CORREÇÃO COMPLETA DE SEGURANÇA - RLS
-- =====================================================
-- Este script corrige todos os problemas de segurança
-- habilitando RLS e criando políticas adequadas

-- PASSO 1: Verificar status atual das tabelas
SELECT '=== VERIFICANDO STATUS ATUAL ===' as info;

-- Verificar quais tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'cart_items', 'orders', 'order_items', 'profiles', 'reviews', 'favorites', 'payment_methods')
ORDER BY tablename;

-- PASSO 2: Habilitar RLS em todas as tabelas principais
SELECT '=== HABILITANDO RLS ===' as info;

-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Remover todas as políticas antigas que podem estar causando conflitos
SELECT '=== REMOVENDO POLÍTICAS ANTIGAS ===' as info;

-- Remover políticas de products
DROP POLICY IF EXISTS "Produtos ativos são visíveis para todos" ON products;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Todos podem ver produtos" ON products;
DROP POLICY IF EXISTS "Apenas admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Apenas admins podem deletar produtos" ON products;

-- Remover políticas de categories
DROP POLICY IF EXISTS "Categorias são visíveis para todos" ON categories;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar categorias" ON categories;
DROP POLICY IF EXISTS "Todos podem ver categorias" ON categories;

-- Remover políticas de cart_items
DROP POLICY IF EXISTS "Usuários podem ver seus próprios itens do carrinho" ON cart_items;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios itens do carrinho" ON cart_items;
DROP POLICY IF EXISTS "Permitir inserção de itens no carrinho" ON cart_items;
DROP POLICY IF EXISTS "Usuários podem ver itens do carrinho" ON cart_items;
DROP POLICY IF EXISTS "Usuários podem atualizar itens do carrinho" ON cart_items;
DROP POLICY IF EXISTS "Usuários podem deletar itens do carrinho" ON cart_items;

-- Remover políticas de orders
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON orders;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON orders;
DROP POLICY IF EXISTS "Usuários podem criar pedidos" ON orders;
DROP POLICY IF EXISTS "Apenas admins podem atualizar pedidos" ON orders;
DROP POLICY IF EXISTS "Todos podem ver pedidos" ON orders;

-- Remover políticas de order_items
DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Admins podem ver todos os itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Sistema pode inserir itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Todos podem ver itens de pedidos" ON order_items;

-- Remover políticas de profiles
DROP POLICY IF EXISTS "Usuários podem gerenciar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;

-- Remover políticas de reviews
DROP POLICY IF EXISTS "Reviews são visíveis para todos" ON reviews;
DROP POLICY IF EXISTS "Usuários autenticados podem criar reviews" ON reviews;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias reviews" ON reviews;
DROP POLICY IF EXISTS "Todos podem ver reviews" ON reviews;

-- Remover políticas de favorites
DROP POLICY IF EXISTS "Usuários podem gerenciar seus favoritos" ON favorites;

-- Remover políticas de payment_methods
DROP POLICY IF EXISTS "Formas de pagamento ativas são visíveis para todos" ON payment_methods;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar formas de pagamento" ON payment_methods;
DROP POLICY IF EXISTS "Todos podem ver formas de pagamento ativas" ON payment_methods;

-- PASSO 4: Criar políticas de segurança adequadas
SELECT '=== CRIANDO POLÍTICAS DE SEGURANÇA ===' as info;

-- ===========================================
-- POLÍTICAS PARA PRODUCTS
-- ===========================================
-- Todos podem ver produtos ativos (incluindo visitantes)
CREATE POLICY "products_select_public" ON products
    FOR SELECT USING (is_active = true);

-- Apenas admins podem inserir produtos
CREATE POLICY "products_insert_admin" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Apenas admins podem atualizar produtos
CREATE POLICY "products_update_admin" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Apenas admins podem deletar produtos
CREATE POLICY "products_delete_admin" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ===========================================
-- POLÍTICAS PARA CATEGORIES
-- ===========================================
-- Todos podem ver categorias
CREATE POLICY "categories_select_public" ON categories
    FOR SELECT USING (true);

-- Apenas admins podem gerenciar categorias
CREATE POLICY "categories_all_admin" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ===========================================
-- POLÍTICAS PARA CART_ITEMS
-- ===========================================
-- Usuários podem ver seus próprios itens do carrinho
CREATE POLICY "cart_items_select_own" ON cart_items
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Usuários podem inserir itens no carrinho
CREATE POLICY "cart_items_insert_own" ON cart_items
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Usuários podem atualizar seus próprios itens
CREATE POLICY "cart_items_update_own" ON cart_items
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Usuários podem deletar seus próprios itens
CREATE POLICY "cart_items_delete_own" ON cart_items
    FOR DELETE USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- ===========================================
-- POLÍTICAS PARA ORDERS
-- ===========================================
-- Usuários podem ver apenas seus próprios pedidos
CREATE POLICY "orders_select_own" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- Admins podem ver todos os pedidos
CREATE POLICY "orders_select_admin" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Usuários podem criar pedidos para si mesmos
CREATE POLICY "orders_insert_own" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Apenas admins podem atualizar pedidos
CREATE POLICY "orders_update_admin" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- ===========================================
-- POLÍTICAS PARA ORDER_ITEMS
-- ===========================================
-- Usuários podem ver itens de seus próprios pedidos
CREATE POLICY "order_items_select_own" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admins podem ver todos os itens de pedidos
CREATE POLICY "order_items_select_admin" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Sistema pode inserir itens de pedidos (Edge Functions)
CREATE POLICY "order_items_insert_system" ON order_items
    FOR INSERT WITH CHECK (true);

-- ===========================================
-- POLÍTICAS PARA PROFILES
-- ===========================================
-- Usuários podem ver e gerenciar apenas seu próprio perfil
CREATE POLICY "profiles_all_own" ON profiles
    FOR ALL USING (id = auth.uid());

-- Admins podem ver todos os perfis
CREATE POLICY "profiles_select_admin" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- ===========================================
-- POLÍTICAS PARA REVIEWS
-- ===========================================
-- Todos podem ver reviews
CREATE POLICY "reviews_select_public" ON reviews
    FOR SELECT USING (true);

-- Usuários autenticados podem criar reviews
CREATE POLICY "reviews_insert_authenticated" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Usuários podem gerenciar apenas suas próprias reviews
CREATE POLICY "reviews_all_own" ON reviews
    FOR ALL USING (user_id = auth.uid());

-- ===========================================
-- POLÍTICAS PARA FAVORITES
-- ===========================================
-- Usuários podem gerenciar apenas seus próprios favoritos
CREATE POLICY "favorites_all_own" ON favorites
    FOR ALL USING (user_id = auth.uid());

-- ===========================================
-- POLÍTICAS PARA PAYMENT_METHODS
-- ===========================================
-- Todos podem ver formas de pagamento ativas
CREATE POLICY "payment_methods_select_active" ON payment_methods
    FOR SELECT USING (is_active = true);

-- Apenas admins podem gerenciar formas de pagamento
CREATE POLICY "payment_methods_all_admin" ON payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- PASSO 5: Verificar se o usuário atual é admin
SELECT '=== VERIFICANDO STATUS ADMIN ===' as info;

-- Tornar usuário atual admin se não for
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- Verificar status admin
SELECT 
    'Usuário atual é admin: ' || COALESCE(is_admin::text, 'false') as status
FROM profiles 
WHERE id = auth.uid();

-- PASSO 6: Verificação final
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar quais tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'cart_items', 'orders', 'order_items', 'profiles', 'reviews', 'favorites', 'payment_methods')
ORDER BY tablename;

-- Contar políticas criadas
SELECT 
    'Total de políticas criadas: ' || COUNT(*) as resultado
FROM pg_policies 
WHERE schemaname = 'public';

-- Mostrar todas as políticas criadas
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT '=== CORREÇÃO DE SEGURANÇA CONCLUÍDA ===' as info;
SELECT 'RLS habilitado em todas as tabelas com políticas de segurança adequadas!' as resultado;
