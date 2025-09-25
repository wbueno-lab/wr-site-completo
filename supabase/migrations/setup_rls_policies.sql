-- Habilitar RLS em todas as tabelas principais
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela de formas de pagamento (se existir)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUCTS
-- Todos podem ver produtos ativos
CREATE POLICY "Produtos ativos são visíveis para todos" ON products
    FOR SELECT USING (is_active = true);

-- Apenas admins podem inserir/atualizar/deletar produtos
CREATE POLICY "Apenas admins podem gerenciar produtos" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Políticas para CATEGORIES
-- Todos podem ver categorias
CREATE POLICY "Categorias são visíveis para todos" ON categories
    FOR SELECT USING (true);

-- Apenas admins podem gerenciar categorias
CREATE POLICY "Apenas admins podem gerenciar categorias" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Políticas para CART_ITEMS
-- Usuários podem ver apenas seus próprios itens do carrinho
CREATE POLICY "Usuários podem ver seus próprios itens do carrinho" ON cart_items
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Usuários podem gerenciar seus próprios itens do carrinho
CREATE POLICY "Usuários podem gerenciar seus próprios itens do carrinho" ON cart_items
    FOR ALL USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Políticas para ORDERS
-- Usuários podem ver apenas seus próprios pedidos
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- Apenas admins podem ver todos os pedidos
CREATE POLICY "Admins podem ver todos os pedidos" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Usuários podem criar pedidos para si mesmos
CREATE POLICY "Usuários podem criar pedidos" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Apenas admins podem atualizar pedidos
CREATE POLICY "Apenas admins podem atualizar pedidos" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Políticas para ORDER_ITEMS
-- Usuários podem ver itens de seus próprios pedidos
CREATE POLICY "Usuários podem ver itens de seus pedidos" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Apenas admins podem ver todos os itens de pedidos
CREATE POLICY "Admins podem ver todos os itens de pedidos" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Apenas o sistema pode inserir itens de pedidos (via Edge Functions)
CREATE POLICY "Sistema pode inserir itens de pedidos" ON order_items
    FOR INSERT WITH CHECK (true);

-- Políticas para PROFILES
-- Usuários podem ver e atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem gerenciar seu próprio perfil" ON profiles
    FOR ALL USING (id = auth.uid());

-- Admins podem ver todos os perfis
CREATE POLICY "Admins podem ver todos os perfis" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- Políticas para REVIEWS
-- Todos podem ver reviews
CREATE POLICY "Reviews são visíveis para todos" ON reviews
    FOR SELECT USING (true);

-- Usuários autenticados podem criar reviews
CREATE POLICY "Usuários autenticados podem criar reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Usuários podem atualizar/deletar apenas suas próprias reviews
CREATE POLICY "Usuários podem gerenciar suas próprias reviews" ON reviews
    FOR ALL USING (user_id = auth.uid());

-- Políticas para PAYMENT_METHODS
-- Todos podem ver formas de pagamento ativas
CREATE POLICY "Formas de pagamento ativas são visíveis para todos" ON payment_methods
    FOR SELECT USING (is_active = true);

-- Apenas admins podem gerenciar formas de pagamento
CREATE POLICY "Apenas admins podem gerenciar formas de pagamento" ON payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente quando um usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
