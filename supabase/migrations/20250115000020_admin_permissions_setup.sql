-- =====================================================
-- Configuração de Permissões de Administrador
-- =====================================================
-- Este arquivo contém funções e políticas para gerenciar
-- permissões de administrador no sistema

-- Função para promover usuário a administrador
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Se o usuário não existir, retornar false
    IF user_id IS NULL THEN
        RAISE NOTICE 'Usuário com email % não encontrado', user_email;
        RETURN FALSE;
    END IF;
    
    -- Atualizar o perfil para admin
    UPDATE profiles 
    SET is_admin = TRUE, updated_at = NOW()
    WHERE id = user_id;
    
    -- Se nenhuma linha foi afetada, criar o perfil
    IF NOT FOUND THEN
        INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
        VALUES (user_id, user_email, TRUE, NOW(), NOW());
    END IF;
    
    RAISE NOTICE 'Usuário % promovido a administrador', user_email;
    RETURN TRUE;
END;
$$;

-- Função para remover privilégios de administrador
CREATE OR REPLACE FUNCTION remove_admin_privileges(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Se o usuário não existir, retornar false
    IF user_id IS NULL THEN
        RAISE NOTICE 'Usuário com email % não encontrado', user_email;
        RETURN FALSE;
    END IF;
    
    -- Remover privilégios de admin
    UPDATE profiles 
    SET is_admin = FALSE, updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE 'Privilégios de administrador removidos de %', user_email;
    RETURN TRUE;
END;
$$;

-- Função para listar todos os administradores
CREATE OR REPLACE FUNCTION list_admins()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.created_at,
        p.last_login_at
    FROM profiles p
    WHERE p.is_admin = TRUE
    ORDER BY p.created_at DESC;
END;
$$;

-- Política para permitir que admins vejam todos os perfis (apenas para gerenciamento)
CREATE POLICY "Admins can view all profiles for management"
    ON public.profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    ));

-- Política para permitir que admins atualizem is_admin de outros usuários
CREATE POLICY "Admins can update admin status"
    ON public.profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    ));

-- Comentários para documentação
COMMENT ON FUNCTION make_user_admin(TEXT) IS 'Promove um usuário a administrador pelo email';
COMMENT ON FUNCTION remove_admin_privileges(TEXT) IS 'Remove privilégios de administrador de um usuário pelo email';
COMMENT ON FUNCTION list_admins() IS 'Lista todos os usuários com privilégios de administrador';

-- =====================================================
-- EXEMPLOS DE USO:
-- =====================================================
-- 
-- Para promover um usuário a admin:
-- SELECT make_user_admin('admin@exemplo.com');
--
-- Para remover privilégios de admin:
-- SELECT remove_admin_privileges('usuario@exemplo.com');
--
-- Para listar todos os admins:
-- SELECT * FROM list_admins();
--
-- =====================================================
