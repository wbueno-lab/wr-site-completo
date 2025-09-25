-- Verificar se existem produtos no banco
SELECT 
    id, 
    name, 
    price, 
    is_active, 
    created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar se RLS está ativo na tabela products
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'products';

-- Verificar políticas ativas na tabela products
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
AND tablename = 'products';

-- Verificar se há categorias
SELECT id, name, is_active FROM categories LIMIT 5;

-- Verificar se o usuário atual tem permissão
SELECT auth.uid() as current_user_id;

-- Testar consulta simples (deve funcionar mesmo com RLS)
SELECT COUNT(*) as total_products FROM products;

