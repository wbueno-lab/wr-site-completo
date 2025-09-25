-- =====================================================
-- TESTE DE SEGURANÇA - VERIFICAÇÃO DAS POLÍTICAS RLS
-- =====================================================
-- Este script testa se as políticas de segurança estão funcionando

-- PASSO 1: Verificar RLS habilitado
SELECT '=== TESTE 1: VERIFICANDO RLS HABILITADO ===' as teste;

SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO' 
        ELSE '❌ RLS DESABILITADO' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'cart_items', 'orders', 'order_items', 'profiles', 'reviews', 'favorites', 'payment_methods')
ORDER BY tablename;

-- PASSO 2: Verificar políticas criadas
SELECT '=== TESTE 2: VERIFICANDO POLÍTICAS CRIADAS ===' as teste;

SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- PASSO 3: Verificar usuário atual
SELECT '=== TESTE 3: VERIFICANDO USUÁRIO ATUAL ===' as teste;

SELECT 
    'Usuário ID: ' || COALESCE(auth.uid()::text, 'NULL (não autenticado)') as info,
    'É Admin: ' || COALESCE(
        (SELECT is_admin::text FROM profiles WHERE id = auth.uid()), 
        'false'
    ) as admin_status;

-- PASSO 4: Teste de acesso aos dados
SELECT '=== TESTE 4: TESTANDO ACESSO AOS DADOS ===' as teste;

-- Teste de produtos (deve funcionar para todos)
SELECT 
    'Produtos visíveis: ' || COUNT(*) as resultado
FROM products;

-- Teste de categorias (deve funcionar para todos)
SELECT 
    'Categorias visíveis: ' || COUNT(*) as resultado
FROM categories;

-- Teste de formas de pagamento (deve funcionar para todos)
SELECT 
    'Formas de pagamento ativas: ' || COUNT(*) as resultado
FROM payment_methods;

-- Teste de reviews (deve funcionar para todos)
SELECT 
    'Reviews visíveis: ' || COUNT(*) as resultado
FROM reviews;

-- Teste de pedidos (deve funcionar apenas para usuários autenticados)
SELECT 
    'Pedidos visíveis para usuário atual: ' || COUNT(*) as resultado
FROM orders;

-- Teste de itens do carrinho (deve funcionar apenas para usuário atual)
SELECT 
    'Itens do carrinho do usuário atual: ' || COUNT(*) as resultado
FROM cart_items;

-- Teste de favoritos (deve funcionar apenas para usuário atual)
SELECT 
    'Favoritos do usuário atual: ' || COUNT(*) as resultado
FROM favorites;

-- PASSO 5: Verificar políticas específicas
SELECT '=== TESTE 5: VERIFICANDO POLÍTICAS ESPECÍFICAS ===' as teste;

-- Verificar se existem políticas de SELECT públicas
SELECT 
    tablename,
    policyname,
    'SELECT público' as tipo
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'SELECT'
AND qual LIKE '%true%'
ORDER BY tablename;

-- Verificar se existem políticas de INSERT com restrições
SELECT 
    tablename,
    policyname,
    'INSERT restrito' as tipo
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'INSERT'
ORDER BY tablename;

-- Verificar se existem políticas de UPDATE com restrições
SELECT 
    tablename,
    policyname,
    'UPDATE restrito' as tipo
FROM pg_policies 
WHERE schemaname = 'public' 
AND cmd = 'UPDATE'
ORDER BY tablename;

-- PASSO 6: Resumo de segurança
SELECT '=== RESUMO DE SEGURANÇA ===' as teste;

-- Contar tabelas com RLS
SELECT 
    'Tabelas com RLS habilitado: ' || COUNT(*) as resultado
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'cart_items', 'orders', 'order_items', 'profiles', 'reviews', 'favorites', 'payment_methods')
AND rowsecurity = true;

-- Contar total de políticas
SELECT 
    'Total de políticas de segurança: ' || COUNT(*) as resultado
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar se não há tabelas sem RLS
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todas as tabelas principais têm RLS habilitado'
        ELSE '❌ ' || COUNT(*) || ' tabelas ainda sem RLS: ' || string_agg(tablename, ', ')
    END as status_rls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'cart_items', 'orders', 'order_items', 'profiles', 'reviews', 'favorites', 'payment_methods')
AND rowsecurity = false;

SELECT '=== TESTE DE SEGURANÇA CONCLUÍDO ===' as teste;
SELECT 'Verifique os resultados acima para confirmar que a segurança está configurada corretamente!' as resultado;
