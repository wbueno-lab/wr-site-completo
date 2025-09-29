-- Migração CORRIGIDA para otimizar políticas RLS restantes
-- Trabalha apenas com tabelas que realmente existem

-- =====================================================
-- 1. VERIFICAR QUAIS TABELAS EXISTEM
-- =====================================================

-- Verificar tabelas existentes com RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- =====================================================
-- 2. REMOVER APENAS POLÍTICAS DE TABELAS EXISTENTES
-- =====================================================

-- Remover políticas de FAVORITES (se existir)
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "favorites_all_own" ON public.favorites;

-- Remover políticas de REVIEWS (se existir)
DROP POLICY IF EXISTS "Reviews são visíveis para todos" ON public.reviews;
DROP POLICY IF EXISTS "Usuários autenticados podem criar reviews" ON public.reviews;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
DROP POLICY IF EXISTS "reviews_all_own" ON public.reviews;

-- Remover políticas de BRANDS (se existir)
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON public.brands;
DROP POLICY IF EXISTS "Only admins can manage brands" ON public.brands;

-- Remover políticas de PAYMENT_METHODS (se existir)
DROP POLICY IF EXISTS "Formas de pagamento ativas são visíveis para todos" ON public.payment_methods;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar formas de pagamento" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_select_active" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_all_admin" ON public.payment_methods;

-- =====================================================
-- 3. CRIAR POLÍTICAS OTIMIZADAS APENAS PARA TABELAS EXISTENTES
-- =====================================================

-- POLÍTICAS PARA FAVORITES (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    EXECUTE 'CREATE POLICY "favorites_user_optimized" ON public.favorites
      FOR ALL
      USING (
        user_id = public.get_current_user_id() OR
        (user_id IS NULL AND session_id IS NOT NULL AND public.get_current_user_id() IS NULL)
      )';
    RAISE NOTICE 'Política criada para tabela favorites';
  ELSE
    RAISE NOTICE 'Tabela favorites não existe, pulando...';
  END IF;
END $$;

-- POLÍTICAS PARA REVIEWS (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    EXECUTE 'CREATE POLICY "reviews_select_optimized" ON public.reviews
      FOR SELECT
      USING (true)';
    
    EXECUTE 'CREATE POLICY "reviews_insert_optimized" ON public.reviews
      FOR INSERT
      WITH CHECK (public.get_current_user_id() IS NOT NULL)';
    
    EXECUTE 'CREATE POLICY "reviews_own_optimized" ON public.reviews
      FOR ALL
      USING (user_id = public.get_current_user_id())';
    
    RAISE NOTICE 'Políticas criadas para tabela reviews';
  ELSE
    RAISE NOTICE 'Tabela reviews não existe, pulando...';
  END IF;
END $$;

-- POLÍTICAS PARA BRANDS (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brands') THEN
    EXECUTE 'CREATE POLICY "brands_select_optimized" ON public.brands
      FOR SELECT
      USING (true)';
    
    EXECUTE 'CREATE POLICY "brands_admin_optimized" ON public.brands
      FOR ALL
      USING (public.is_current_user_admin())';
    
    RAISE NOTICE 'Políticas criadas para tabela brands';
  ELSE
    RAISE NOTICE 'Tabela brands não existe, pulando...';
  END IF;
END $$;

-- POLÍTICAS PARA PAYMENT_METHODS (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
    EXECUTE 'CREATE POLICY "payment_methods_select_optimized" ON public.payment_methods
      FOR SELECT
      USING (is_active = true)';
    
    EXECUTE 'CREATE POLICY "payment_methods_admin_optimized" ON public.payment_methods
      FOR ALL
      USING (public.is_current_user_admin())';
    
    RAISE NOTICE 'Políticas criadas para tabela payment_methods';
  ELSE
    RAISE NOTICE 'Tabela payment_methods não existe, pulando...';
  END IF;
END $$;

-- =====================================================
-- 4. CRIAR ÍNDICES APENAS PARA TABELAS EXISTENTES
-- =====================================================

-- Índices para favorites (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_favorites_user_id_optimized ON public.favorites(user_id) WHERE user_id IS NOT NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_favorites_session_id_optimized ON public.favorites(session_id) WHERE session_id IS NOT NULL';
    RAISE NOTICE 'Índices criados para tabela favorites';
  END IF;
END $$;

-- Índices para reviews (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_user_id_optimized ON public.reviews(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_product_id_optimized ON public.reviews(product_id)';
    RAISE NOTICE 'Índices criados para tabela reviews';
  END IF;
END $$;

-- Índices para brands (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brands') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_brands_name_optimized ON public.brands(name)';
    RAISE NOTICE 'Índices criados para tabela brands';
  END IF;
END $$;

-- Índices para payment_methods (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active) WHERE is_active = true';
    RAISE NOTICE 'Índices criados para tabela payment_methods';
  END IF;
END $$;

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('favorites', 'reviews', 'brands', 'payment_methods')
ORDER BY tablename, policyname;

-- Verificar funções auxiliares
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_current_user_id', 'is_current_user_admin')
ORDER BY routine_name;

-- Contar total de políticas por tabela
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('favorites', 'reviews', 'brands', 'payment_methods')
GROUP BY tablename
ORDER BY tablename;
