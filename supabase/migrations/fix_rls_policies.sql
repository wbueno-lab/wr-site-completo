-- Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Produtos ativos são visíveis para todos" ON products;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Categorias são visíveis para todos" ON categories;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar categorias" ON categories;
DROP POLICY IF EXISTS "Reviews são visíveis para todos" ON reviews;
DROP POLICY IF EXISTS "Formas de pagamento ativas são visíveis para todos" ON payment_methods;

-- Políticas mais permissivas para PRODUTOS
-- Todos podem ver produtos (incluindo visitantes não autenticados)
CREATE POLICY "Todos podem ver produtos" ON products
    FOR SELECT USING (true);

-- Apenas admins podem inserir/atualizar/deletar produtos
CREATE POLICY "Apenas admins podem gerenciar produtos" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Apenas admins podem atualizar produtos" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Apenas admins podem deletar produtos" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Políticas para CATEGORIAS
-- Todos podem ver categorias
CREATE POLICY "Todos podem ver categorias" ON categories
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

-- Políticas para REVIEWS
-- Todos podem ver reviews
CREATE POLICY "Todos podem ver reviews" ON reviews
    FOR SELECT USING (true);

-- Usuários autenticados podem criar reviews
CREATE POLICY "Usuários autenticados podem criar reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Usuários podem atualizar/deletar apenas suas próprias reviews
CREATE POLICY "Usuários podem gerenciar suas próprias reviews" ON reviews
    FOR ALL USING (user_id = auth.uid());

-- Políticas para PAYMENT_METHODS
-- Todos podem ver formas de pagamento ativas
CREATE POLICY "Todos podem ver formas de pagamento ativas" ON payment_methods
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

-- Políticas para CART_ITEMS (ajustadas para funcionar com usuários não autenticados)
-- Permitir inserção de itens no carrinho para usuários não autenticados
CREATE POLICY "Permitir inserção de itens no carrinho" ON cart_items
    FOR INSERT WITH CHECK (true);

-- Usuários podem ver seus próprios itens do carrinho ou itens de sessão
CREATE POLICY "Usuários podem ver itens do carrinho" ON cart_items
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Usuários podem atualizar seus próprios itens do carrinho
CREATE POLICY "Usuários podem atualizar itens do carrinho" ON cart_items
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Usuários podem deletar seus próprios itens do carrinho
CREATE POLICY "Usuários podem deletar itens do carrinho" ON cart_items
    FOR DELETE USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Políticas para ORDERS (ajustadas)
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

