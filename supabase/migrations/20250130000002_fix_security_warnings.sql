-- Migração para corrigir avisos de segurança do Supabase
-- Corrige problemas de search_path em funções e habilita proteção contra vazamento de senha

-- 1. Corrigir função update_contact_messages_updated_at (mensagens_de_contato_de_atualização_pública)
DROP FUNCTION IF EXISTS public.update_contact_messages_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Corrigir função update_order_item_product_snapshot
DROP FUNCTION IF EXISTS public.update_order_item_product_snapshot() CASCADE;
CREATE OR REPLACE FUNCTION public.update_order_item_product_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.selected_size IS NOT NULL THEN
        NEW.product_snapshot = jsonb_set(
            COALESCE(NEW.product_snapshot, '{}'::jsonb),
            '{selected_size}',
            to_jsonb(NEW.selected_size)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS update_order_item_product_snapshot_trigger ON public.order_items;
CREATE TRIGGER update_order_item_product_snapshot_trigger
    BEFORE INSERT OR UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_item_product_snapshot();

-- 3. Corrigir função validate_available_sizes (validar_tamanhos_disponíveis)
DROP FUNCTION IF EXISTS public.validate_available_sizes() CASCADE;
CREATE OR REPLACE FUNCTION public.validate_available_sizes()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar se available_sizes é um array válido de strings
  IF NEW.available_sizes IS NOT NULL THEN
    -- Verificar se é um array JSON válido
    IF jsonb_typeof(NEW.available_sizes) != 'array' THEN
      RAISE EXCEPTION 'available_sizes deve ser um array JSON válido';
    END IF;
    
    -- Verificar se todos os elementos são strings
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(NEW.available_sizes) AS elem
      WHERE jsonb_typeof(elem) != 'string'
    ) THEN
      RAISE EXCEPTION 'Todos os elementos de available_sizes devem ser strings';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS validate_available_sizes_trigger ON public.products;
CREATE TRIGGER validate_available_sizes_trigger
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_available_sizes();

-- 4. Corrigir função get_brands_by_product_type (obter_marcas_por_tipo_de_produto)
DROP FUNCTION IF EXISTS public.get_brands_by_product_type(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.get_brands_by_product_type(product_type TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  logo_url TEXT,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.logo_url,
    COUNT(p.id) as product_count
  FROM public.brands b
  LEFT JOIN public.products p ON b.id = p.brand_id 
    AND p.is_active = true 
    AND p.product_type = product_type
  GROUP BY b.id, b.name, b.logo_url
  ORDER BY b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Corrigir função handle_new_user (identificador_novo_usuário)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Corrigir função update_updated_at_column (update_atualizado_na_coluna)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Habilitar proteção contra vazamento de senha
-- Esta configuração deve ser feita no painel do Supabase ou via SQL
-- Vamos tentar habilitar via SQL (pode não funcionar dependendo das permissões)
DO $$
BEGIN
  -- Tentar habilitar a proteção contra vazamento de senha
  -- Nota: Esta configuração pode precisar ser feita manualmente no painel do Supabase
  PERFORM set_config('supabase.auth.password_leak_protection', 'true', false);
EXCEPTION
  WHEN OTHERS THEN
    -- Se não conseguir definir via SQL, apenas logar que precisa ser feito manualmente
    RAISE NOTICE 'Proteção contra vazamento de senha deve ser habilitada manualmente no painel do Supabase';
END $$;

-- 8. Verificar se todas as funções foram criadas corretamente
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_contact_messages_updated_at',
    'update_order_item_product_snapshot', 
    'validate_available_sizes',
    'get_brands_by_product_type',
    'handle_new_user',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- Verificar se as funções têm search_path definido corretamente
SELECT 
  proname as function_name,
  proconfig
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname IN (
    'update_contact_messages_updated_at',
    'update_order_item_product_snapshot', 
    'validate_available_sizes',
    'get_brands_by_product_type',
    'handle_new_user',
    'update_updated_at_column'
  )
ORDER BY proname;
