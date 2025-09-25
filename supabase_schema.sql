-- ========================================
-- SCHEMA COMPLETO PARA O SISTEMA DE CAPACETES
-- ========================================

-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Marcas
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    country_of_origin VARCHAR(100),
    founded_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_promo BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Usuários (perfis)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB,
    helmet_size VARCHAR(20),
    helmet_sizes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Mensagens de Contato
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ========================================

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Índices para itens do pedido
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Índices para mensagens de contato
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);

-- ========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (todos podem ler, apenas admins podem modificar)
CREATE POLICY "Categorias são visíveis para todos" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar categorias" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para marcas (todos podem ler, apenas admins podem modificar)
CREATE POLICY "Marcas são visíveis para todos" ON public.brands
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar marcas" ON public.brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para produtos (todos podem ler, apenas admins podem modificar)
CREATE POLICY "Produtos são visíveis para todos" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar produtos" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para perfis (usuários podem ver e modificar apenas seu próprio perfil)
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem modificar seu próprio perfil" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Políticas para pedidos (usuários podem ver apenas seus próprios pedidos, admins podem ver todos)
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os pedidos" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Usuários podem criar pedidos" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Apenas admins podem modificar pedidos" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para itens do pedido (usuários podem ver apenas itens de seus pedidos, admins podem ver todos)
CREATE POLICY "Usuários podem ver itens de seus pedidos" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem ver todos os itens de pedidos" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Usuários podem criar itens de pedidos" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Políticas para mensagens de contato (todos podem criar, apenas admins podem ler)
CREATE POLICY "Todos podem criar mensagens de contato" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Apenas admins podem ver mensagens de contato" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir categorias iniciais
INSERT INTO public.categories (name, description) VALUES
('Capacetes Integrais', 'Capacetes que cobrem toda a cabeça, oferecendo máxima proteção'),
('Capacetes Modulares', 'Capacetes com queixo removível, versatilidade e conforto'),
('Capacetes Abertos', 'Capacetes abertos para uso urbano e passeios'),
('Capacetes de Corrida', 'Capacetes específicos para pista e alta performance')
ON CONFLICT (name) DO NOTHING;

-- Inserir marcas iniciais
INSERT INTO public.brands (name, description, country_of_origin, founded_year) VALUES
('AGV', 'Fabricante italiano de capacetes de alta qualidade', 'Itália', 1947),
('BIEFFE', 'Marca italiana especializada em capacetes esportivos', 'Itália', 1980),
('FW3', 'Fabricante italiano de capacetes modernos', 'Itália', 1995),
('KYT', 'Marca italiana de capacetes inovadores', 'Itália', 2000),
('PEELS', 'Fabricante italiano de capacetes premium', 'Itália', 2010),
('ASX', 'Marca italiana de capacetes esportivos', 'Itália', 2005),
('AXXIS', 'Fabricante italiano de capacetes de qualidade', 'Itália', 2008),
('LS2', 'Marca espanhola de capacetes versáteis', 'Espanha', 1990),
('NORISK', 'Fabricante italiano de capacetes modernos', 'Itália', 2012),
('RACE TECH', 'Marca italiana de capacetes de corrida', 'Itália', 2003),
('TEXX', 'Fabricante italiano de capacetes inovadores', 'Itália', 2015)
ON CONFLICT (name) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO public.products (name, description, price, category_id, brand_id, is_active, is_new, is_promo) VALUES
('AGV K1', 'Capacete integral com excelente aerodinâmica e conforto', 899.90, 
 (SELECT id FROM public.categories WHERE name = 'Capacetes Integrais' LIMIT 1),
 (SELECT id FROM public.brands WHERE name = 'AGV' LIMIT 1), true, true, false),
 
('BIEFFE GP-1', 'Capacete modular versátil para uso urbano e viagem', 1299.90,
 (SELECT id FROM public.categories WHERE name = 'Capacetes Modulares' LIMIT 1),
 (SELECT id FROM public.brands WHERE name = 'BIEFFE' LIMIT 1), true, false, true),
 
('FW3 Carbon', 'Capacete de corrida em fibra de carbono', 2499.90,
 (SELECT id FROM public.categories WHERE name = 'Capacetes de Corrida' LIMIT 1),
 (SELECT id FROM public.brands WHERE name = 'FW3' LIMIT 1), true, true, false)
ON CONFLICT DO NOTHING;

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

