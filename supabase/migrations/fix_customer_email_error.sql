-- Script para corrigir o erro "Could not find the 'customer_email' column"
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se a tabela orders existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'orders'
) as orders_table_exists;

-- Verificar estrutura atual da tabela orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar colunas de cliente se não existirem
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.orders.customer_email IS 'Email do cliente que fez o pedido';
COMMENT ON COLUMN public.orders.customer_name IS 'Nome completo do cliente';
COMMENT ON COLUMN public.orders.customer_phone IS 'Telefone do cliente';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
AND column_name IN ('customer_email', 'customer_name', 'customer_phone')
ORDER BY ordinal_position;

-- Verificar se a tabela orders tem todas as colunas necessárias
SELECT 'Tabela orders atualizada com sucesso!' as status;

-- Verificar estrutura da tabela order_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela order_items tem as colunas corretas
SELECT 'Tabela order_items verificada!' as status;
