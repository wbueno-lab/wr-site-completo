-- Adicionar campo specifications à tabela products
ALTER TABLE products ADD COLUMN specifications TEXT;

-- Comentário para documentar o campo
COMMENT ON COLUMN products.specifications IS 'Especificações técnicas detalhadas do produto';
