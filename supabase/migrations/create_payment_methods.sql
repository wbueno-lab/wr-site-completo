-- Criar tabela de formas de pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  requires_online BOOLEAN DEFAULT false,
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
  min_amount DECIMAL(10,2) DEFAULT 0.00,
  max_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir formas de pagamento padrão
INSERT INTO payment_methods (name, description, icon, is_active, requires_online, processing_fee_percentage, min_amount, max_amount) VALUES
('Cartão de Crédito', 'Pague com cartão de crédito Visa, Mastercard, Elo', 'credit-card', true, true, 3.50, 10.00, 5000.00),
('Cartão de Débito', 'Pague com cartão de débito Visa, Mastercard, Elo', 'debit-card', true, true, 2.50, 10.00, 3000.00),
('PIX', 'Pague instantaneamente com PIX', 'smartphone', true, true, 0.00, 1.00, 10000.00),
('Boleto Bancário', 'Pague com boleto bancário', 'file-text', true, false, 0.00, 10.00, 5000.00),
('Transferência Bancária', 'Pague via transferência bancária', 'bank', true, false, 0.00, 50.00, 10000.00),
('Dinheiro', 'Pague em dinheiro na entrega', 'dollar-sign', true, false, 0.00, 1.00, 2000.00),
('Cartão na Entrega', 'Pague com cartão na entrega', 'credit-card', true, false, 0.00, 10.00, 2000.00);

-- Adicionar coluna de forma de pagamento na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method_id);

-- Atualizar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
