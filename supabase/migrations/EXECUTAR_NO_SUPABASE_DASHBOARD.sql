-- =====================================================
-- SCRIPT PARA EXECUTAR NO SUPABASE DASHBOARD
-- =====================================================
-- 
-- Este script corrige o erro "Could not find the 'customer_email' column of 'orders' in the schema cache"
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole e execute este script
-- 4. Após executar, o checkout deve funcionar normalmente

-- Adicionar campos de cliente à tabela orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.orders.customer_email IS 'Email do cliente que fez o pedido';
COMMENT ON COLUMN public.orders.customer_name IS 'Nome completo do cliente';
COMMENT ON COLUMN public.orders.customer_phone IS 'Telefone do cliente';
COMMENT ON COLUMN public.orders.payment_details IS 'Detalhes adicionais do pagamento em formato JSON';

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_email', 'customer_name', 'customer_phone', 'payment_details')
ORDER BY ordinal_position;

-- Mostrar mensagem de sucesso
SELECT 'Colunas adicionadas com sucesso! O checkout agora deve funcionar.' as status;


