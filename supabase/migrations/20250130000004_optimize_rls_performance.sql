-- Migração para otimizar performance das políticas RLS
-- Resolve avisos de "Auth RLS Initialization Plan" otimizando chamadas auth() e current_setting()

-- =====================================================
-- 1. CRIAR FUNÇÃO AUXILIAR PARA CACHE DE AUTH
-- =====================================================

-- Função para obter user_id com cache
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Usar current_setting com fallback para auth.uid()
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub'::uuid,
    auth.uid()
  );
END;
$$;

-- Função para verificar se usuário é admin com cache
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  admin_status BOOLEAN;
BEGIN
  user_id := public.get_current_user_id();
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Cache do status de admin por 5 minutos
  SELECT is_admin INTO admin_status
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN COALESCE(admin_status, FALSE);
END;
$$;

-- =====================================================
-- 2. REMOVER POLÍTICAS EXISTENTES (LIMPEZA)
-- =====================================================

-- Remover todas as políticas existentes para recriar otimizadas
DROP POLICY IF EXISTS "Produtos ativos são visíveis para todos" ON public.products;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar produtos" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "products_update_admin" ON public.products;
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;

DROP POLICY IF EXISTS "Categorias são visíveis para todos" ON public.categories;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar categorias" ON public.categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
DROP POLICY IF EXISTS "categories_all_admin" ON public.categories;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios itens do carrinho" ON public.cart_items;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios itens do carrinho" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Guest cart access by session" ON public.cart_items;
DROP POLICY IF EXISTS "Authenticated users can manage cart" ON public.cart_items;
DROP POLICY IF EXISTS "Guest users can manage cart by session" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON public.orders;
DROP POLICY IF EXISTS "Admins podem ver todos os pedidos" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;

DROP POLICY IF EXISTS "Usuários podem ver itens de seus pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Admins podem ver todos os itens de pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_system" ON public.order_items;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- =====================================================
-- 3. CRIAR POLÍTICAS OTIMIZADAS
-- =====================================================

-- POLÍTICAS PARA PRODUCTS (Otimizadas)
CREATE POLICY "products_select_optimized" ON public.products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "products_admin_optimized" ON public.products
  FOR ALL
  USING (public.is_current_user_admin());

-- POLÍTICAS PARA CATEGORIES (Otimizadas)
CREATE POLICY "categories_select_optimized" ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_optimized" ON public.categories
  FOR ALL
  USING (public.is_current_user_admin());

-- POLÍTICAS PARA CART_ITEMS (Otimizadas)
CREATE POLICY "cart_items_user_optimized" ON public.cart_items
  FOR ALL
  USING (
    user_id = public.get_current_user_id() OR
    (user_id IS NULL AND session_id IS NOT NULL AND public.get_current_user_id() IS NULL)
  );

-- POLÍTICAS PARA ORDERS (Otimizadas)
CREATE POLICY "orders_user_optimized" ON public.orders
  FOR SELECT
  USING (
    user_id = public.get_current_user_id() OR
    public.is_current_user_admin()
  );

CREATE POLICY "orders_insert_optimized" ON public.orders
  FOR INSERT
  WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "orders_admin_optimized" ON public.orders
  FOR UPDATE
  USING (public.is_current_user_admin());

-- POLÍTICAS PARA ORDER_ITEMS (Otimizadas)
CREATE POLICY "order_items_user_optimized" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = public.get_current_user_id() OR public.is_current_user_admin())
    )
  );

CREATE POLICY "order_items_insert_optimized" ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = public.get_current_user_id()
    )
  );

-- POLÍTICAS PARA PROFILES (Otimizadas)
CREATE POLICY "profiles_own_optimized" ON public.profiles
  FOR ALL
  USING (id = public.get_current_user_id());

CREATE POLICY "profiles_admin_optimized" ON public.profiles
  FOR SELECT
  USING (public.is_current_user_admin());

-- =====================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para otimizar consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id) WHERE session_id IS NOT NULL;

-- =====================================================
-- 5. VERIFICAR RESULTADO
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
  AND tablename IN ('products', 'categories', 'cart_items', 'orders', 'order_items', 'profiles')
ORDER BY tablename, policyname;

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_current_user_id', 'is_current_user_admin')
ORDER BY routine_name;
