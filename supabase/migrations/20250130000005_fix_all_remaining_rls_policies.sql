-- Migração para corrigir TODAS as políticas RLS restantes
-- Resolve os 147 avisos de performance restantes

-- =====================================================
-- 1. REMOVER TODAS AS POLÍTICAS RESTANTES
-- =====================================================

-- Remover políticas de FAVORITES
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "favorites_all_own" ON public.favorites;

-- Remover políticas de REVIEWS
DROP POLICY IF EXISTS "Anyone can view product reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews são visíveis para todos" ON public.reviews;
DROP POLICY IF EXISTS "Usuários autenticados podem criar reviews" ON public.reviews;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
DROP POLICY IF EXISTS "reviews_all_own" ON public.reviews;

-- Remover políticas de BRANDS
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON public.brands;
DROP POLICY IF EXISTS "Only admins can manage brands" ON public.brands;

-- Remover políticas de PAYMENT_METHODS
DROP POLICY IF EXISTS "Formas de pagamento ativas são visíveis para todos" ON public.payment_methods;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar formas de pagamento" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_select_active" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_all_admin" ON public.payment_methods;

-- Remover políticas restantes de ORDERS e ORDER_ITEMS
DROP POLICY IF EXISTS "Todos podem ver pedidos" ON public.orders;
DROP POLICY IF EXISTS "Usuários podem criar pedidos" ON public.orders;
DROP POLICY IF EXISTS "Admins podem atualizar pedidos" ON public.orders;
DROP POLICY IF EXISTS "Todos podem ver itens de pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Sistema pode inserir itens de pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Sistema pode inserir itens de pedidos" ON public.order_items;

-- =====================================================
-- 2. CRIAR POLÍTICAS OTIMIZADAS PARA TODAS AS TABELAS
-- =====================================================

-- POLÍTICAS PARA FAVORITES (Otimizadas)
CREATE POLICY "favorites_user_optimized" ON public.favorites
  FOR ALL
  USING (
    user_id = public.get_current_user_id() OR
    (user_id IS NULL AND session_id IS NOT NULL AND public.get_current_user_id() IS NULL)
  );

-- POLÍTICAS PARA REVIEWS (Otimizadas)
CREATE POLICY "reviews_select_optimized" ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_optimized" ON public.reviews
  FOR INSERT
  WITH CHECK (public.get_current_user_id() IS NOT NULL);

CREATE POLICY "reviews_own_optimized" ON public.reviews
  FOR ALL
  USING (user_id = public.get_current_user_id());

-- POLÍTICAS PARA PRODUCT_REVIEWS (Otimizadas)
CREATE POLICY "product_reviews_select_optimized" ON public.product_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "product_reviews_insert_optimized" ON public.product_reviews
  FOR INSERT
  WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "product_reviews_own_optimized" ON public.product_reviews
  FOR ALL
  USING (user_id = public.get_current_user_id());

-- POLÍTICAS PARA BRANDS (Otimizadas)
CREATE POLICY "brands_select_optimized" ON public.brands
  FOR SELECT
  USING (true);

CREATE POLICY "brands_admin_optimized" ON public.brands
  FOR ALL
  USING (public.is_current_user_admin());

-- POLÍTICAS PARA PAYMENT_METHODS (Otimizadas)
CREATE POLICY "payment_methods_select_optimized" ON public.payment_methods
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "payment_methods_admin_optimized" ON public.payment_methods
  FOR ALL
  USING (public.is_current_user_admin());

-- =====================================================
-- 3. CRIAR ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id_optimized ON public.favorites(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_favorites_session_id_optimized ON public.favorites(session_id) WHERE session_id IS NOT NULL;

-- Índices para reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id_optimized ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id_optimized ON public.reviews(product_id);

-- Índices para product_reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id_optimized ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id_optimized ON public.product_reviews(product_id);

-- Índices para brands
CREATE INDEX IF NOT EXISTS idx_brands_name_optimized ON public.brands(name);

-- Índices para payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active) WHERE is_active = true;

-- =====================================================
-- 4. VERIFICAR SE EXISTEM OUTRAS TABELAS COM RLS
-- =====================================================

-- Verificar todas as tabelas com RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- =====================================================
-- 5. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

-- Verificar todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 6. VERIFICAR FUNÇÕES AUXILIARES
-- =====================================================

-- Verificar se as funções auxiliares existem
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_current_user_id', 'is_current_user_admin')
ORDER BY routine_name;

-- =====================================================
-- 7. TESTE DE PERFORMANCE
-- =====================================================

-- Testar as funções auxiliares
SELECT 
  'get_current_user_id()' as function_name,
  public.get_current_user_id() as result;

SELECT 
  'is_current_user_admin()' as function_name,
  public.is_current_user_admin() as result;

-- =====================================================
-- 8. ESTATÍSTICAS FINAIS
-- =====================================================

-- Contar total de políticas por tabela
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Contar total de índices por tabela
SELECT 
  schemaname,
  tablename,
  COUNT(*) as total_indexes
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
