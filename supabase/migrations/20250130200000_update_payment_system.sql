-- Atualizar sistema de pagamento
-- Remover dependências do Mercado Pago e criar nova estrutura

-- Atualizar tabela orders para novo sistema de pagamento
ALTER TABLE orders 
DROP COLUMN IF EXISTS payment_method_id,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'credit_card',
ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS shipping_service VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_tracking_code VARCHAR(100);

-- Criar tabela para métodos de entrega
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL UNIQUE,
    base_price DECIMAL(10,2) DEFAULT 0.00,
    price_per_kg DECIMAL(10,2) DEFAULT 0.00,
    estimated_days_min INTEGER DEFAULT 1,
    estimated_days_max INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir métodos de entrega padrão
INSERT INTO shipping_methods (name, description, code, base_price, price_per_kg, estimated_days_min, estimated_days_max)
VALUES 
    ('PAC', 'Entrega econômica pelos Correios', 'pac', 15.00, 2.50, 5, 10),
    ('SEDEX', 'Entrega expressa pelos Correios', 'sedex', 25.00, 3.50, 2, 5),
    ('Retirada', 'Retirar na loja física', 'pickup', 0.00, 0.00, 0, 0)
ON CONFLICT (code) DO NOTHING;

-- Criar tabela para calcular frete por região
CREATE TABLE IF NOT EXISTS shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    cep_start VARCHAR(8) NOT NULL,
    cep_end VARCHAR(8) NOT NULL,
    multiplier DECIMAL(3,2) DEFAULT 1.00,
    additional_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir zonas de entrega (regiões do Brasil)
INSERT INTO shipping_zones (name, cep_start, cep_end, multiplier, additional_days)
VALUES 
    ('São Paulo Capital', '01000000', '05999999', 1.00, 0),
    ('São Paulo Interior', '06000000', '19999999', 1.20, 1),
    ('Rio de Janeiro', '20000000', '28999999', 1.30, 1),
    ('Minas Gerais', '30000000', '39999999', 1.40, 2),
    ('Sul', '80000000', '99999999', 1.50, 3),
    ('Nordeste', '40000000', '56999999', 1.80, 4),
    ('Norte', '68000000', '69999999', 2.00, 5),
    ('Centro-Oeste', '70000000', '78999999', 1.70, 3)
ON CONFLICT DO NOTHING;

-- Habilitar RLS nas novas tabelas
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para shipping_methods
DROP POLICY IF EXISTS "shipping_methods_select_policy" ON shipping_methods;
CREATE POLICY "shipping_methods_select_policy" ON shipping_methods
    FOR SELECT USING (true);

-- Políticas de acesso para shipping_zones  
DROP POLICY IF EXISTS "shipping_zones_select_policy" ON shipping_zones;
CREATE POLICY "shipping_zones_select_policy" ON shipping_zones
    FOR SELECT USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_service ON orders(shipping_service);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_cep ON shipping_zones(cep_start, cep_end);

-- Função para calcular frete
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
    p_cep VARCHAR(8),
    p_weight DECIMAL(10,2),
    p_method_code VARCHAR(20)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_price DECIMAL(10,2);
    price_per_kg DECIMAL(10,2);
    zone_multiplier DECIMAL(3,2) DEFAULT 1.00;
    final_cost DECIMAL(10,2);
BEGIN
    -- Buscar dados do método de entrega
    SELECT sm.base_price, sm.price_per_kg 
    INTO base_price, price_per_kg
    FROM shipping_methods sm 
    WHERE sm.code = p_method_code AND sm.is_active = true;
    
    -- Se método não encontrado, retornar 0
    IF base_price IS NULL THEN
        RETURN 0.00;
    END IF;
    
    -- Buscar multiplicador da zona
    SELECT sz.multiplier 
    INTO zone_multiplier
    FROM shipping_zones sz 
    WHERE p_cep >= sz.cep_start AND p_cep <= sz.cep_end
    LIMIT 1;
    
    -- Se zona não encontrada, usar multiplicador padrão
    IF zone_multiplier IS NULL THEN
        zone_multiplier := 1.50; -- Multiplicador padrão para regiões não mapeadas
    END IF;
    
    -- Calcular custo final
    final_cost := (base_price + (price_per_kg * p_weight)) * zone_multiplier;
    
    RETURN ROUND(final_cost, 2);
END;
$$ LANGUAGE plpgsql;

-- Atualizar função updated_at para novas tabelas
CREATE TRIGGER update_shipping_methods_updated_at 
    BEFORE UPDATE ON shipping_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE shipping_methods IS 'Métodos de entrega disponíveis';
COMMENT ON TABLE shipping_zones IS 'Zonas de entrega com multiplicadores de preço';
COMMENT ON FUNCTION calculate_shipping_cost IS 'Calcula o custo de frete baseado no CEP, peso e método';
