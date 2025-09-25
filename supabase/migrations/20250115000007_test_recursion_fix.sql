-- =====================================================
-- TESTE DE CORREÇÃO DO ERRO DE RECURSÃO
-- =====================================================
-- Este script testa se o erro de recursão infinita foi resolvido

SELECT '=== TESTE DE CORREÇÃO DE RECURSÃO ===' as teste;

-- PASSO 1: Testar consulta à tabela profiles
SELECT '=== TESTE 1: CONSULTA À TABELA PROFILES ===' as teste;

-- Esta consulta deve funcionar sem erro de recursão
SELECT 
    id,
    email,
    full_name,
    is_admin,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- PASSO 2: Testar consulta aos pedidos
SELECT '=== TESTE 2: CONSULTA À TABELA ORDERS ===' as teste;

-- Esta consulta deve funcionar sem erro de recursão
SELECT 
    id,
    order_number,
    status,
    payment_status,
    total_amount,
    customer_name,
    created_at
FROM orders 
ORDER BY created_at DESC
LIMIT 5;

-- PASSO 3: Testar consulta aos produtos
SELECT '=== TESTE 3: CONSULTA À TABELA PRODUCTS ===' as teste;

-- Esta consulta deve funcionar sem erro de recursão
SELECT 
    id,
    name,
    price,
    is_active,
    created_at
FROM products 
WHERE is_active = true
LIMIT 5;

-- PASSO 4: Verificar políticas ativas
SELECT '=== TESTE 4: VERIFICAR POLÍTICAS ATIVAS ===' as teste;

-- Verificar políticas da tabela profiles
SELECT 
    'Políticas da tabela profiles: ' || COUNT(*) as resultado
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Listar políticas da tabela profiles
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- PASSO 5: Verificar se não há mais consultas recursivas
SELECT '=== TESTE 5: VERIFICAR CONSULTAS RECURSIVAS ===' as teste;

-- Verificar se ainda há políticas que fazem consulta à tabela profiles
SELECT 
    tablename,
    policyname,
    'Possível recursão' as aviso
FROM pg_policies 
WHERE schemaname = 'public' 
AND qual LIKE '%profiles%'
AND tablename != 'profiles';

-- PASSO 6: Teste de inserção/atualização
SELECT '=== TESTE 6: TESTE DE OPERAÇÕES ===' as teste;

-- Testar se consegue atualizar o próprio perfil
UPDATE profiles 
SET updated_at = now()
WHERE id = auth.uid();

SELECT 'Atualização de perfil: OK' as resultado;

-- PASSO 7: Resumo do teste
SELECT '=== RESUMO DO TESTE ===' as teste;

-- Verificar status do usuário
SELECT 
    'Usuário autenticado: ' || CASE 
        WHEN auth.uid() IS NOT NULL THEN 'SIM' 
        ELSE 'NÃO' 
    END as status;

-- Verificar se tem perfil
SELECT 
    'Tem perfil: ' || CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
        THEN 'SIM' 
        ELSE 'NÃO' 
    END as status;

-- Verificar se é admin
SELECT 
    'É admin: ' || COALESCE(
        (SELECT is_admin::text FROM profiles WHERE id = auth.uid()), 
        'false'
    ) as status;

SELECT '=== TESTE CONCLUÍDO ===' as teste;
SELECT 'Se não houve erros acima, a recursão foi corrigida!' as resultado;
