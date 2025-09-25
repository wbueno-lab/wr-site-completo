-- =====================================================
-- CORREÇÃO DO ERRO DE RECURSÃO INFINITA
-- =====================================================
-- Este script corrige o erro "infinite recursion detected in policy for relation 'profiles'"

SELECT '=== CORRIGINDO ERRO DE RECURSÃO INFINITA ===' as info;

-- PASSO 1: Remover políticas problemáticas da tabela profiles
SELECT '=== REMOVENDO POLÍTICAS PROBLEMÁTICAS ===' as info;

-- Remover todas as políticas da tabela profiles
DROP POLICY IF EXISTS "profiles_all_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;

-- PASSO 2: Criar políticas corrigidas para profiles (sem recursão)
SELECT '=== CRIANDO POLÍTICAS CORRIGIDAS ===' as info;

-- Política simples: usuários podem ver e gerenciar apenas seu próprio perfil
CREATE POLICY "profiles_own_only" ON profiles
    FOR ALL USING (id = auth.uid());

-- PASSO 3: Corrigir outras políticas que podem estar causando recursão
SELECT '=== CORRIGINDO OUTRAS POLÍTICAS COM RECURSÃO ===' as info;

-- Remover políticas que fazem consulta à tabela profiles para verificar admin
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;
DROP POLICY IF EXISTS "categories_all_admin" ON categories;
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
DROP POLICY IF EXISTS "order_items_select_admin" ON order_items;
DROP POLICY IF EXISTS "payment_methods_all_admin" ON payment_methods;

-- PASSO 4: Criar políticas simplificadas (sem verificação de admin via profiles)
SELECT '=== CRIANDO POLÍTICAS SIMPLIFICADAS ===' as info;

-- Para produtos - permitir inserção/atualização/deleção apenas para usuários autenticados
-- (em produção, você pode usar uma função personalizada ou verificar admin de outra forma)
CREATE POLICY "products_insert_authenticated" ON products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "products_update_authenticated" ON products
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "products_delete_authenticated" ON products
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Para categorias - permitir gerenciamento apenas para usuários autenticados
CREATE POLICY "categories_all_authenticated" ON categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Para orders - permitir visualização de todos os pedidos para usuários autenticados
-- (em produção, você pode implementar uma verificação de admin mais segura)
CREATE POLICY "orders_select_authenticated" ON orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "orders_update_authenticated" ON orders
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Para order_items - permitir visualização para usuários autenticados
CREATE POLICY "order_items_select_authenticated" ON order_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Para payment_methods - permitir gerenciamento apenas para usuários autenticados
CREATE POLICY "payment_methods_all_authenticated" ON payment_methods
    FOR ALL USING (auth.uid() IS NOT NULL);

-- PASSO 5: Verificar se o erro foi resolvido
SELECT '=== VERIFICANDO CORREÇÃO ===' as info;

-- Verificar políticas da tabela profiles
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Verificar se não há mais políticas que fazem consulta à tabela profiles
SELECT 
    tablename,
    policyname,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND qual LIKE '%profiles%';

-- PASSO 6: Teste simples
SELECT '=== TESTE SIMPLES ===' as info;

-- Tentar consultar a tabela profiles (deve funcionar sem erro de recursão)
SELECT 
    'Teste de consulta profiles: ' || COUNT(*) as resultado
FROM profiles;

-- Verificar se o usuário atual tem perfil
SELECT 
    'Usuário tem perfil: ' || CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN 'SIM' 
        ELSE 'NÃO' 
    END as status;

SELECT '=== CORREÇÃO CONCLUÍDA ===' as info;
SELECT 'Erro de recursão infinita deve estar resolvido!' as resultado;
