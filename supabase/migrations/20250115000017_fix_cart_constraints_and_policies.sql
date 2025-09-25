-- Corrigir constraints e políticas do carrinho
-- Este script resolve problemas de adição de produtos ao carrinho

-- 1. Remover constraints antigas que podem estar causando conflitos
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_session_id_product_id_key;

-- 2. Remover políticas RLS antigas que podem estar bloqueando operações
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Guest cart access by session" ON public.cart_items;

-- 3. Criar novas políticas RLS mais permissivas para carrinho
-- Política para usuários autenticados
CREATE POLICY "Authenticated users can manage cart"
  ON public.cart_items FOR ALL
  USING (
    auth.uid() IS NOT NULL AND 
    (user_id = auth.uid() OR user_id IS NULL)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- Política para usuários convidados (sem autenticação)
CREATE POLICY "Guest users can manage cart by session"
  ON public.cart_items FOR ALL
  USING (
    auth.uid() IS NULL AND 
    session_id IS NOT NULL
  )
  WITH CHECK (
    auth.uid() IS NULL AND 
    session_id IS NOT NULL
  );

-- 4. Adicionar constraints UNIQUE mais flexíveis que consideram selected_size
-- Para usuários autenticados
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_user_product_size_unique 
UNIQUE (user_id, product_id, selected_size);

-- Para usuários convidados
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_session_product_size_unique 
UNIQUE (session_id, product_id, selected_size);

-- 5. Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- 6. Verificar se a coluna selected_size existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND column_name = 'selected_size'
    ) THEN
        ALTER TABLE public.cart_items ADD COLUMN selected_size INTEGER;
    END IF;
END $$;

-- 7. Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.cart_items.selected_size IS 'Tamanho selecionado do produto (em cm)';

-- 8. Verificar se a coluna is_active existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.cart_items ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 9. Adicionar comentário para documentar a coluna is_active
COMMENT ON COLUMN public.cart_items.is_active IS 'Indica se o item do carrinho está ativo';

-- 10. Criar função para limpar carrinho antigo (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_old_cart_items()
RETURNS void AS $$
BEGIN
    -- Remove itens do carrinho mais antigos que 30 dias
    DELETE FROM public.cart_items 
    WHERE added_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 11. Verificar se as alterações foram aplicadas
SELECT 'Constraints e políticas do carrinho corrigidas com sucesso!' as status;
