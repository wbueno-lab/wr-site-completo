-- =====================================================
-- CRIAÇÃO DA TABELA DE MENSAGENS DE CONTATO
-- =====================================================
-- Esta migração cria a tabela para armazenar mensagens
-- enviadas através do formulário de contato

-- Criar tabela de mensagens de contato
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    is_priority BOOLEAN DEFAULT false,
    admin_notes TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Habilitar RLS na tabela
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer pessoa insira mensagens (formulário público)
CREATE POLICY "contact_messages_insert_public" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Política para permitir que apenas admins vejam as mensagens
CREATE POLICY "contact_messages_select_admin" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
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

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_messages_updated_at();

-- Comentários na tabela e colunas
COMMENT ON TABLE contact_messages IS 'Tabela para armazenar mensagens enviadas através do formulário de contato';
COMMENT ON COLUMN contact_messages.id IS 'Identificador único da mensagem';
COMMENT ON COLUMN contact_messages.name IS 'Nome completo do remetente';
COMMENT ON COLUMN contact_messages.email IS 'Email do remetente';
COMMENT ON COLUMN contact_messages.phone IS 'Telefone do remetente (opcional)';
COMMENT ON COLUMN contact_messages.subject IS 'Assunto da mensagem';
COMMENT ON COLUMN contact_messages.message IS 'Conteúdo da mensagem';
COMMENT ON COLUMN contact_messages.status IS 'Status da mensagem: new, read, replied, archived';
COMMENT ON COLUMN contact_messages.is_priority IS 'Indica se a mensagem é prioritária';
COMMENT ON COLUMN contact_messages.admin_notes IS 'Notas internas do administrador';
COMMENT ON COLUMN contact_messages.replied_at IS 'Data e hora da resposta';
COMMENT ON COLUMN contact_messages.created_at IS 'Data e hora de criação da mensagem';
COMMENT ON COLUMN contact_messages.updated_at IS 'Data e hora da última atualização';

-- Verificar se a tabela foi criada corretamente
SELECT '=== TABELA CONTACT_MESSAGES CRIADA ===' as info;

-- Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contact_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contact_messages'
AND schemaname = 'public';

SELECT '=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===' as info;
