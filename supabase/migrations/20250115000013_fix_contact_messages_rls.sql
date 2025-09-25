-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA MENSAGENS DE CONTATO
-- =====================================================
-- Esta migração corrige as políticas RLS para permitir
-- que usuários vejam suas próprias mensagens

-- Remover políticas existentes
DROP POLICY IF EXISTS "contact_messages_select_admin" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_update_admin" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_delete_admin" ON contact_messages;

-- Política para permitir que apenas admins vejam todas as mensagens
CREATE POLICY "contact_messages_select_admin_all" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Política para permitir que usuários vejam apenas suas próprias mensagens
CREATE POLICY "contact_messages_select_own" ON contact_messages
    FOR SELECT USING (
        email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Política para permitir que apenas admins atualizem as mensagens
CREATE POLICY "contact_messages_update_admin" ON contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Política para permitir que apenas admins deletem as mensagens
CREATE POLICY "contact_messages_delete_admin" ON contact_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Verificar políticas criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contact_messages'
AND schemaname = 'public'
ORDER BY policyname;

SELECT '=== POLÍTICAS RLS CORRIGIDAS ===' as info;
