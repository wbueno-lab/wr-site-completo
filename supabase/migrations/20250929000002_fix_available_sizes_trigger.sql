-- Corrigir trigger que está causando erro de cast text[] to jsonb
-- O trigger estava tentando fazer cast de TEXT[] para JSONB, causando erro

-- Remover o trigger problemático
DROP TRIGGER IF EXISTS validate_available_sizes_trigger ON public.products;

-- Remover a função problemática
DROP FUNCTION IF EXISTS public.validate_available_sizes();

-- Criar uma nova função que trabalha corretamente com TEXT[]
CREATE OR REPLACE FUNCTION public.validate_available_sizes()
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que available_sizes seja um array de texto válido
  IF NEW.available_sizes IS NOT NULL THEN
    -- Remover valores nulos ou vazios do array TEXT[]
    NEW.available_sizes := (
      SELECT ARRAY_AGG(value) 
      FROM unnest(NEW.available_sizes) AS value
      WHERE value IS NOT NULL AND value != ''
    );
    
    -- Se o array ficou vazio após limpeza, definir como NULL
    IF array_length(NEW.available_sizes, 1) = 0 THEN
      NEW.available_sizes := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger corrigido
CREATE TRIGGER validate_available_sizes_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.validate_available_sizes();

-- Comentário explicativo
COMMENT ON FUNCTION public.validate_available_sizes() IS 'Valida e limpa o array available_sizes (TEXT[]) removendo valores nulos ou vazios';
