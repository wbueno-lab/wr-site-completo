-- ========================================
-- TESTE DIRETO NO SQL DO SUPABASE
-- ========================================
-- Execute este código no SQL Editor do Supabase
-- para diagnosticar problemas com produtos

-- 1. VERIFICAR SE A TABELA PRODUCTS EXISTE
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. CONTAR TOTAL DE PRODUTOS NA TABELA
SELECT 
    'Total de produtos' as descricao,
    COUNT(*) as quantidade
FROM products;

-- 3. VERIFICAR PRODUTOS ATIVOS
SELECT 
    'Produtos ativos' as descricao,
    COUNT(*) as quantidade
FROM products 
WHERE is_active = true;

-- 4. VERIFICAR PRODUTOS INATIVOS
SELECT 
    'Produtos inativos' as descricao,
    COUNT(*) as quantidade
FROM products 
WHERE is_active = false;

-- 5. LISTAR TODOS OS PRODUTOS (LIMITADO)
SELECT 
    id,
    name,
    price,
    is_active,
    is_new,
    is_promo,
    created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. VERIFICAR SE HÁ PRODUTOS DE EXEMPLO
SELECT 
    'Produtos de exemplo encontrados' as descricao,
    COUNT(*) as quantidade
FROM products 
WHERE name LIKE '%Capacete%';

-- 7. VERIFICAR CATEGORIAS
SELECT 
    'Total de categorias' as descricao,
    COUNT(*) as quantidade
FROM categories;

-- 8. LISTAR CATEGORIAS
SELECT 
    id,
    name,
    slug,
    created_at
FROM categories 
ORDER BY name;

-- 9. VERIFICAR RELACIONAMENTO PRODUCTS-CATEGORIES
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.is_active,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 10. VERIFICAR POLÍTICAS RLS
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
WHERE tablename = 'products';

-- 11. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 12. TESTAR INSERÇÃO DE PRODUTO TESTE
-- (Descomente as linhas abaixo para testar inserção)
/*
INSERT INTO products (
    name,
    description,
    price,
    is_active,
    sku
) VALUES (
    'Produto Teste SQL ' || extract(epoch from now()),
    'Produto criado via SQL para teste',
    99.90,
    true,
    'SQL-TEST-' || extract(epoch from now())
) RETURNING id, name, price;
*/

-- 13. VERIFICAR USUÁRIO ATUAL E PERMISSÕES
SELECT 
    current_user as usuario_atual,
    session_user as usuario_sessao,
    current_database() as banco_atual;

-- 14. VERIFICAR SE HÁ DADOS NAS TABELAS RELACIONADAS
SELECT 
    'Produtos com categoria' as descricao,
    COUNT(*) as quantidade
FROM products 
WHERE category_id IS NOT NULL;

SELECT 
    'Produtos sem categoria' as descricao,
    COUNT(*) as quantidade
FROM products 
WHERE category_id IS NULL;

-- 15. VERIFICAR ESTRUTURA COMPLETA DA TABELA
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. Abra o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este código
-- 4. Execute seção por seção ou tudo de uma vez
-- 5. Analise os resultados para identificar o problema
-- ========================================
