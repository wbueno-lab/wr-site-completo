-- Adicionar campos de cliente à tabela orders
-- Esta migração adiciona as colunas necessárias para armazenar informações do cliente

-- Adicionar colunas de cliente à tabela orders
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
