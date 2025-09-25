-- Adicionar campos de tamanho dos capacetes à tabela order_items
-- Para armazenar os tamanhos selecionados pelo cliente

-- Adicionar coluna para tamanho único (para compatibilidade com pedidos antigos)
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS helmet_size INTEGER;

-- Adicionar coluna para múltiplos tamanhos (para pedidos com múltiplos capacetes)
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS helmet_sizes INTEGER[];

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.order_items.helmet_size IS 'Tamanho único do capacete selecionado pelo cliente (53-64)';
COMMENT ON COLUMN public.order_items.helmet_sizes IS 'Array de tamanhos de capacetes selecionados pelo cliente';

-- Adicionar constraint para validar o range dos tamanhos únicos
ALTER TABLE public.order_items 
ADD CONSTRAINT IF NOT EXISTS check_helmet_size_range 
CHECK (helmet_size IS NULL OR (helmet_size >= 53 AND helmet_size <= 64));

-- Adicionar constraint para validar o range dos tamanhos múltiplos
ALTER TABLE public.order_items 
ADD CONSTRAINT IF NOT EXISTS check_helmet_sizes_range 
CHECK (helmet_sizes IS NULL OR (
  array_length(helmet_sizes, 1) IS NULL OR 
  (array_length(helmet_sizes, 1) > 0 AND 
   NOT EXISTS (
     SELECT 1 FROM unnest(helmet_sizes) AS size 
     WHERE size < 53 OR size > 64
   ))
));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_order_items_helmet_size ON public.order_items(helmet_size);
CREATE INDEX IF NOT EXISTS idx_order_items_helmet_sizes ON public.order_items USING GIN(helmet_sizes);

-- Função auxiliar para obter o tamanho principal do item
CREATE OR REPLACE FUNCTION public.get_item_helmet_size(item_helmet_size INTEGER, item_helmet_sizes INTEGER[])
RETURNS TEXT AS $$
BEGIN
  -- Se há tamanho único, retorna ele
  IF item_helmet_size IS NOT NULL THEN
    RETURN item_helmet_size::TEXT;
  END IF;
  
  -- Se há múltiplos tamanhos, retorna como string separada por vírgula
  IF item_helmet_sizes IS NOT NULL AND array_length(item_helmet_sizes, 1) > 0 THEN
    RETURN array_to_string(item_helmet_sizes, ', ');
  END IF;
  
  -- Se não há tamanhos, retorna null
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para obter a quantidade de tamanhos diferentes
CREATE OR REPLACE FUNCTION public.get_item_helmet_size_count(item_helmet_size INTEGER, item_helmet_sizes INTEGER[])
RETURNS INTEGER AS $$
BEGIN
  -- Se há tamanho único, retorna 1
  IF item_helmet_size IS NOT NULL THEN
    RETURN 1;
  END IF;
  
  -- Se há múltiplos tamanhos, retorna o comprimento do array
  IF item_helmet_sizes IS NOT NULL AND array_length(item_helmet_sizes, 1) > 0 THEN
    RETURN array_length(item_helmet_sizes, 1);
  END IF;
  
  -- Se não há tamanhos, retorna 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql;
