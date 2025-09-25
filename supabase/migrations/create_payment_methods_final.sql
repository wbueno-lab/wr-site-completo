-- Script final para criar métodos de pagamento
-- Versão simplificada sem conflitos de UUID

-- Criar tabela payment_methods se não existir
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'credit-card',
    is_active BOOLEAN DEFAULT true,
    requires_online BOOLEAN DEFAULT false,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    min_amount DECIMAL(10,2) DEFAULT 0.00,
    max_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso
DROP POLICY IF EXISTS "payment_methods_select_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_select_policy" ON public.payment_methods
    FOR SELECT USING (true);

-- Limpar dados existentes e inserir novos
DELETE FROM public.payment_methods;

-- Inserir métodos de pagamento
INSERT INTO public.payment_methods (name, description, icon, is_active, requires_online, processing_fee_percentage, min_amount, max_amount)
VALUES 
    ('Cartão de Crédito', 'Pague com cartão de crédito Visa, Mastercard, Elo', 'credit-card', true, true, 3.50, 10.00, 5000.00),
    ('Cartão de Débito', 'Pague com cartão de débito Visa, Mastercard, Elo', 'debit-card', true, true, 2.50, 10.00, 3000.00),
    ('PIX', 'Pague instantaneamente com PIX', 'smartphone', true, true, 0.00, 1.00, 10000.00),
    ('Boleto Bancário', 'Pague com boleto bancário', 'file-text', true, false, 0.00, 10.00, 5000.00),
    ('Transferência Bancária', 'Pague via transferência bancária', 'bank', true, false, 0.00, 50.00, 10000.00),
    ('Dinheiro', 'Pague em dinheiro na entrega', 'dollar-sign', true, false, 0.00, 1.00, 2000.00),
    ('Cartão na Entrega', 'Pague com cartão na entrega', 'credit-card', true, false, 0.00, 10.00, 2000.00);

-- Verificar se foi criado corretamente
SELECT 'Métodos de pagamento criados com sucesso!' as status;
SELECT id, name, processing_fee_percentage FROM public.payment_methods ORDER BY name;
