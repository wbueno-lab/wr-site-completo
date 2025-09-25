-- Adicionar campo de numeração dos capacetes na tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS helmet_number INTEGER;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN products.helmet_number IS 'Numeração do capacete (53-64)';

-- Criar índice para melhor performance nas consultas por numeração
CREATE INDEX IF NOT EXISTS idx_products_helmet_number ON products(helmet_number);

-- Adicionar constraint para garantir que a numeração esteja no range válido (53-64)
ALTER TABLE products 
ADD CONSTRAINT check_helmet_number_range 
CHECK (helmet_number IS NULL OR (helmet_number >= 53 AND helmet_number <= 64));
