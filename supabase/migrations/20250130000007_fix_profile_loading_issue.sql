-- Migração para corrigir problemas de carregamento de perfil
-- Esta migração limpa e recria as políticas RLS para a tabela profiles de forma simplificada

-- =====================================================
-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES DA TABELA PROFILES
-- =====================================================

SELECT '=== LIMPANDO POLÍTICAS EXISTENTES DA TABELA PROFILES ===' as info;

-- Remover todas as políticas da tabela profiles para começar do zero
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_optimized" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_optimized" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem gerenciar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

-- =====================================================
-- 2. CRIAR POLÍTICAS SIMPLES E EFICAZES
-- =====================================================

SELECT '=== CRIANDO POLÍTICAS SIMPLIFICADAS PARA PROFILES ===' as info;

-- Política principal: usuários podem ver e gerenciar apenas seu próprio perfil
CREATE POLICY "profiles_own_access" ON public.profiles
  FOR ALL 
  USING (id = auth.uid());

-- Política para inserção: usuários podem criar apenas seu próprio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- =====================================================
-- 3. VERIFICAR E CRIAR FUNÇÃO AUXILIAR PARA ADMIN
-- =====================================================

SELECT '=== CRIANDO FUNÇÃO AUXILIAR SEGURA ===' as info;

-- Criar função simples para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificação direta sem recursão
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false por segurança
    RETURN false;
END;
$$;

-- =====================================================
-- 4. GARANTIR QUE RLS ESTEJA HABILITADO
-- =====================================================

SELECT '=== HABILITANDO RLS NA TABELA PROFILES ===' as info;

-- Garantir que RLS esteja habilitado na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

SELECT '=== CRIANDO ÍNDICES PARA OTIMIZAÇÃO ===' as info;

-- Índice para consultas por ID (chave primária já indexada)
-- Índice para consultas de admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin_optimized 
ON public.profiles(is_admin) 
WHERE is_admin = true;

-- =====================================================
-- 6. VERIFICAR RESULTADO
-- =====================================================

SELECT '=== VERIFICANDO POLÍTICAS CRIADAS ===' as info;

-- Verificar políticas criadas para profiles
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
  AND tablename = 'profiles'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

SELECT '=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===' as info;
