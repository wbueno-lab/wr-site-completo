-- Migração para corrigir problemas de autenticação
-- Data: 2024-12-20

-- 1. Garantir que a tabela profiles tenha todas as colunas necessárias
DO $$ 
BEGIN
    -- Adicionar coluna last_login_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;

    -- Adicionar coluna last_logout_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_logout_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_logout_at TIMESTAMPTZ;
    END IF;

    -- Adicionar coluna last_ip_address se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_ip_address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_ip_address TEXT;
    END IF;

    -- Adicionar coluna last_modified_by se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_modified_by'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_modified_by UUID REFERENCES auth.users(id);
    END IF;

    -- Adicionar coluna updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- 3. Atualizar RLS policies para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Garantir que todos os usuários tenham um perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, is_admin, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Recriar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Criar tabela de histórico de perfis se não existir
CREATE TABLE IF NOT EXISTS profile_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    previous_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RLS para profile_history
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile history" ON profile_history;
DROP POLICY IF EXISTS "Admins can view all profile history" ON profile_history;

CREATE POLICY "Users can view own profile history" ON profile_history
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all profile history" ON profile_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 10. Índices para profile_history
CREATE INDEX IF NOT EXISTS idx_profile_history_profile_id ON profile_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_history_created_at ON profile_history(created_at);
CREATE INDEX IF NOT EXISTS idx_profile_history_change_type ON profile_history(change_type);

-- 11. Comentários para documentação
COMMENT ON TABLE profiles IS 'Perfis de usuários com informações adicionais';
COMMENT ON COLUMN profiles.is_admin IS 'Indica se o usuário é administrador';
COMMENT ON COLUMN profiles.last_login_at IS 'Último login do usuário';
COMMENT ON COLUMN profiles.last_logout_at IS 'Último logout do usuário';
COMMENT ON COLUMN profiles.last_ip_address IS 'Último endereço IP do usuário';
COMMENT ON COLUMN profiles.last_modified_by IS 'ID do usuário que fez a última modificação';
COMMENT ON COLUMN profiles.updated_at IS 'Data da última atualização do perfil';

COMMENT ON TABLE profile_history IS 'Histórico de alterações nos perfis de usuários';
COMMENT ON COLUMN profile_history.previous_data IS 'Dados anteriores do perfil antes da alteração';
COMMENT ON COLUMN profile_history.change_type IS 'Tipo de alteração: create, update, delete';
