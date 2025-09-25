-- Migração para alterar helmet_number para helmet_numbers (array)
-- Primeiro, vamos remover a constraint e o índice existentes
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_helmet_number_range;
DROP INDEX IF EXISTS idx_products_helmet_number;

-- Renomear a coluna existente para backup
ALTER TABLE products RENAME COLUMN helmet_number TO helmet_number_backup;

-- Adicionar nova coluna como array de inteiros
ALTER TABLE products 
ADD COLUMN helmet_numbers INTEGER[];

-- Migrar dados existentes (converter valor único para array)
UPDATE products 
SET helmet_numbers = CASE 
  WHEN helmet_number_backup IS NOT NULL THEN ARRAY[helmet_number_backup]
  ELSE NULL
END;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN products.helmet_numbers IS 'Numerações disponíveis do capacete (53-64)';

-- Criar índice para melhor performance nas consultas por numeração
CREATE INDEX IF NOT EXISTS idx_products_helmet_numbers ON products USING GIN(helmet_numbers);

-- Adicionar constraint para garantir que as numerações estejam no range válido (53-64)
ALTER TABLE products 
ADD CONSTRAINT check_helmet_numbers_range 
CHECK (helmet_numbers IS NULL OR (
  array_length(helmet_numbers, 1) IS NULL OR 
  (array_length(helmet_numbers, 1) > 0 AND 
   NOT EXISTS (
     SELECT 1 FROM unnest(helmet_numbers) AS num 
     WHERE num < 53 OR num > 64
   ))
));

-- Remover a coluna de backup após a migração
ALTER TABLE products DROP COLUMN helmet_number_backup;
