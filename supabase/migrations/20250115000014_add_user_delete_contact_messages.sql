-- =====================================================
-- ADICIONAR POLÍTICA RLS PARA USUÁRIOS EXCLUÍREM SUAS MENSAGENS
-- =====================================================
-- Esta migração adiciona uma política RLS para permitir
-- que usuários excluam suas próprias mensagens de contato

-- Política para permitir que usuários excluam apenas suas próprias mensagens
CREATE POLICY "contact_messages_delete_own" ON contact_messages
    FOR DELETE USING (
        email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
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

SELECT '=== POLÍTICA DE EXCLUSÃO DE USUÁRIO ADICIONADA ===' as info;

