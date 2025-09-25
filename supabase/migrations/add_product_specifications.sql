-- Adicionar campos de especificações técnicas na tabela products
ALTER TABLE products 
ADD COLUMN material VARCHAR(100),
ADD COLUMN certifications TEXT[],
ADD COLUMN weight_grams INTEGER,
ADD COLUMN shell_material VARCHAR(100),
ADD COLUMN liner_material VARCHAR(100),
ADD COLUMN ventilation_system VARCHAR(100),
ADD COLUMN visor_type VARCHAR(100),
ADD COLUMN chin_strap_type VARCHAR(100),
ADD COLUMN safety_standards TEXT[],
ADD COLUMN color_options TEXT[],
ADD COLUMN warranty_period INTEGER,
ADD COLUMN country_of_origin VARCHAR(100),
ADD COLUMN brand_model VARCHAR(100),
ADD COLUMN helmet_type VARCHAR(50),
ADD COLUMN shell_sizes TEXT[],
ADD COLUMN impact_absorption VARCHAR(100),
ADD COLUMN penetration_resistance VARCHAR(100),
ADD COLUMN retention_system VARCHAR(100),
ADD COLUMN additional_features TEXT[];

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN products.material IS 'Material principal do capacete (ex: fibra de carbono, policarbonato)';
COMMENT ON COLUMN products.certifications IS 'Certificações de segurança (ex: DOT, ECE, SNELL)';
COMMENT ON COLUMN products.weight_grams IS 'Peso do capacete em gramas';
COMMENT ON COLUMN products.shell_material IS 'Material da casca externa';
COMMENT ON COLUMN products.liner_material IS 'Material do forro interno';
COMMENT ON COLUMN products.ventilation_system IS 'Sistema de ventilação (ex: 13 entradas de ar)';
COMMENT ON COLUMN products.visor_type IS 'Tipo de viseira (ex: clara, fumê, fotocromática)';
COMMENT ON COLUMN products.chin_strap_type IS 'Tipo de jugular (ex: dupla D, micrométrico)';
COMMENT ON COLUMN products.safety_standards IS 'Padrões de segurança atendidos';
COMMENT ON COLUMN products.color_options IS 'Opções de cores disponíveis';
COMMENT ON COLUMN products.warranty_period IS 'Período de garantia em meses';
COMMENT ON COLUMN products.country_of_origin IS 'País de origem';
COMMENT ON COLUMN products.brand_model IS 'Modelo específico da marca';
COMMENT ON COLUMN products.helmet_type IS 'Tipo de capacete (ex: integral, modular, aberto)';
COMMENT ON COLUMN products.shell_sizes IS 'Tamanhos da casca disponíveis';
COMMENT ON COLUMN products.impact_absorption IS 'Sistema de absorção de impacto';
COMMENT ON COLUMN products.penetration_resistance IS 'Resistência à penetração';
COMMENT ON COLUMN products.retention_system IS 'Sistema de retenção';
COMMENT ON COLUMN products.additional_features IS 'Recursos adicionais (ex: Bluetooth, GPS, LED)';
