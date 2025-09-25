-- Migração para garantir que a coluna helmet_numbers existe e está funcionando
-- Verificar se a coluna existe e criar se necessário

DO $$ 
BEGIN
    -- Verificar se a coluna helmet_numbers existe na tabela products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'helmet_numbers'
        AND table_schema = 'public'
    ) THEN
        -- Criar a coluna se não existir
        ALTER TABLE public.products ADD COLUMN helmet_numbers INTEGER[];
        COMMENT ON COLUMN public.products.helmet_numbers IS 'Numerações disponíveis do capacete (53-64)';
        
        -- Criar índice GIN para arrays
        CREATE INDEX IF NOT EXISTS idx_products_helmet_numbers ON public.products USING GIN(helmet_numbers);
        
        -- Adicionar constraint para validar range
        ALTER TABLE public.products 
        ADD CONSTRAINT check_helmet_numbers_range 
        CHECK (helmet_numbers IS NULL OR (
          array_length(helmet_numbers, 1) IS NULL OR 
          (array_length(helmet_numbers, 1) > 0 AND 
           NOT EXISTS (
             SELECT 1 FROM unnest(helmet_numbers) AS num
             WHERE num < 53 OR num > 64
           )
          )
        ));
        
        RAISE NOTICE 'Coluna helmet_numbers criada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna helmet_numbers já existe';
    END IF;
END $$;

-- Verificar se há dados de exemplo para testar
SELECT 
    'Verificação da coluna helmet_numbers' as status,
    COUNT(*) as total_products,
    COUNT(helmet_numbers) as products_with_numbers,
    COUNT(*) - COUNT(helmet_numbers) as products_without_numbers
FROM public.products;
