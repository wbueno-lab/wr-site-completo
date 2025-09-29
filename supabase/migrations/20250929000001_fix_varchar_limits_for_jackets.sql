-- Corrigir limites de VARCHAR(100) para VARCHAR(500) para evitar erro ao criar jaquetas
-- Problema: campos com VARCHAR(100) são muito pequenos para descrições detalhadas
-- Solução: Aumentar para VARCHAR(500) que é suficiente para a maioria dos casos

-- Alterar campos que podem ter conteúdo longo de VARCHAR(100) para VARCHAR(500)
ALTER TABLE public.products 
ALTER COLUMN material TYPE VARCHAR(500),
ALTER COLUMN protection_level TYPE VARCHAR(500),
ALTER COLUMN shell_material TYPE VARCHAR(500),
ALTER COLUMN liner_material TYPE VARCHAR(500),
ALTER COLUMN ventilation_system TYPE VARCHAR(500),
ALTER COLUMN visor_type TYPE VARCHAR(500),
ALTER COLUMN chin_strap_type TYPE VARCHAR(500),
ALTER COLUMN country_of_origin TYPE VARCHAR(500),
ALTER COLUMN brand_model TYPE VARCHAR(500),
ALTER COLUMN impact_absorption TYPE VARCHAR(500),
ALTER COLUMN penetration_resistance TYPE VARCHAR(500),
ALTER COLUMN retention_system TYPE VARCHAR(500);

-- Atualizar comentários para refletir que agora são campos VARCHAR(500)
COMMENT ON COLUMN products.material IS 'Material principal do produto (máximo 500 caracteres)';
COMMENT ON COLUMN products.protection_level IS 'Nível de proteção com descrição detalhada (máximo 500 caracteres)';
COMMENT ON COLUMN products.shell_material IS 'Material da casca externa (máximo 500 caracteres)';
COMMENT ON COLUMN products.liner_material IS 'Material do forro interno (máximo 500 caracteres)';
COMMENT ON COLUMN products.ventilation_system IS 'Sistema de ventilação detalhado (máximo 500 caracteres)';
COMMENT ON COLUMN products.visor_type IS 'Tipo de viseira com descrição completa (máximo 500 caracteres)';
COMMENT ON COLUMN products.chin_strap_type IS 'Tipo de jugular com descrição detalhada (máximo 500 caracteres)';
COMMENT ON COLUMN products.country_of_origin IS 'País de origem (máximo 500 caracteres)';
COMMENT ON COLUMN products.brand_model IS 'Modelo específico da marca com descrição completa (máximo 500 caracteres)';
COMMENT ON COLUMN products.impact_absorption IS 'Descrição detalhada da absorção de impacto (máximo 500 caracteres)';
COMMENT ON COLUMN products.penetration_resistance IS 'Descrição detalhada da resistência à penetração (máximo 500 caracteres)';
COMMENT ON COLUMN products.retention_system IS 'Descrição completa do sistema de retenção (máximo 500 caracteres)';
