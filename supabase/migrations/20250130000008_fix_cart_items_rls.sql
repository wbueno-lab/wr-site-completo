-- Migração para corrigir políticas RLS da tabela cart_items
-- Resolve erro 400 no console para usuários não autenticados

-- =====================================================
-- 1. REMOVER POLÍTICAS EXISTENTES DO CARRINHO
-- =====================================================

SELECT '=== LIMPANDO POLÍTICAS EXISTENTES DA TABELA CART_ITEMS ===' as info;

-- Remover políticas existentes do carrinho
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Guest cart access by session" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_user_optimized" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_session_optimized" ON public.cart_items;
DROP POLICY IF EXISTS "Usuários podem gerenciar seu próprio carrinho" ON public.cart_items;
DROP POLICY IF EXISTS "Carrinho de convidados por sessão" ON public.cart_items;

-- =====================================================
-- 2. CRIAR POLÍTICAS OTIMIZADAS PARA CART_ITEMS
-- =====================================================

SELECT '=== CRIANDO POLÍTICAS OTIMIZADAS PARA CART_ITEMS ===' as info;

-- Política para usuários autenticados (acesso aos próprios itens)
CREATE POLICY "cart_items_authenticated_users" ON public.cart_items
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários não autenticados (acesso por session_id)
CREATE POLICY "cart_items_guest_sessions" ON public.cart_items
  FOR ALL 
  USING (
    auth.uid() IS NULL 
    AND session_id IS NOT NULL 
    AND session_id != ''
  )
  WITH CHECK (
    auth.uid() IS NULL 
    AND session_id IS NOT NULL 
    AND session_id != ''
  );

-- =====================================================
-- 3. GARANTIR QUE RLS ESTEJA HABILITADO
-- =====================================================

SELECT '=== HABILITANDO RLS NA TABELA CART_ITEMS ===' as info;

-- Garantir que RLS esteja habilitado
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

SELECT '=== CRIANDO ÍNDICES PARA OTIMIZAÇÃO ===' as info;

-- Índices para otimizar consultas do carrinho
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id_optimized 
ON public.cart_items(user_id) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cart_items_session_id_optimized 
ON public.cart_items(session_id) 
WHERE session_id IS NOT NULL AND session_id != '';

-- =====================================================
-- 5. VERIFICAR RESULTADO
-- =====================================================

SELECT '=== VERIFICANDO POLÍTICAS CRIADAS ===' as info;

-- Verificar políticas criadas para cart_items
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'cart_items'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'cart_items';

SELECT '=== MIGRAÇÃO DE CART_ITEMS CONCLUÍDA COM SUCESSO ===' as info;
