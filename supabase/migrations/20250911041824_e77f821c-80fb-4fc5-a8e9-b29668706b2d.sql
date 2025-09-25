-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  stock_quantity INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_promo BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sku TEXT UNIQUE,
  weight DECIMAL(8,2),
  dimensions JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address JSONB,
  is_admin BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT DEFAULT 'standard',
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tracking_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB, -- Store product details at time of order
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON public.categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage products"
  ON public.products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cart policies
CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Guest cart access by session"
  ON public.cart_items FOR ALL
  USING (session_id IS NOT NULL AND auth.uid() IS NULL);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_id AND orders.user_id = auth.uid()
  ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reviews"
  ON public.reviews FOR ALL
  USING (auth.uid() = user_id);

-- Create functions and triggers

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update category product count
CREATE OR REPLACE FUNCTION public.update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the count for the affected category
  IF TG_OP = 'DELETE' THEN
    UPDATE public.categories 
    SET product_count = (
      SELECT COUNT(*) FROM public.products 
      WHERE category_id = OLD.category_id AND is_active = true
    )
    WHERE id = OLD.category_id;
    RETURN OLD;
  ELSE
    UPDATE public.categories 
    SET product_count = (
      SELECT COUNT(*) FROM public.products 
      WHERE category_id = NEW.category_id AND is_active = true
    )
    WHERE id = NEW.category_id;
    
    -- If updating and category changed, update old category too
    IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
      UPDATE public.categories 
      SET product_count = (
        SELECT COUNT(*) FROM public.products 
        WHERE category_id = OLD.category_id AND is_active = true
      )
      WHERE id = OLD.category_id;
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating category product count
CREATE TRIGGER update_category_count_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_category_product_count();

-- Generate order number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'WR' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(nextval('order_sequence')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Trigger for generating order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Insert initial categories
INSERT INTO public.categories (name, description, slug, icon, color, product_count) VALUES
('Racing', 'Capacetes para alta performance', 'racing', 'Bike', 'from-red-500 to-orange-500', 0),
('Sport', 'Estilo e proteção urbana', 'sport', 'Shield', 'from-blue-500 to-cyan-500', 0),
('Adventure', 'Para todas as aventuras', 'adventure', 'Mountain', 'from-green-500 to-emerald-500', 0),
('Urban', 'Clássico e confortável', 'urban', 'Car', 'from-purple-500 to-pink-500', 0);

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, category_id, image_url, stock_quantity, is_new, is_promo, sku) 
SELECT 
  'Capacete Racing Pro X1',
  'Capacete de alta performance para corridas profissionais com tecnologia avançada de ventilação e proteção.',
  459.90,
  529.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  25,
  true,
  true,
  'WR-RACING-001'
FROM public.categories c WHERE c.slug = 'racing';

INSERT INTO public.products (name, description, price, category_id, image_url, stock_quantity, is_new, sku)
SELECT 
  'Capacete Sport Evolution',
  'Capacete esportivo com design moderno e tecnologia de última geração.',
  329.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  30,
  true,
  'WR-SPORT-001'
FROM public.categories c WHERE c.slug = 'sport';

INSERT INTO public.products (name, description, price, original_price, category_id, image_url, stock_quantity, is_promo, sku)
SELECT 
  'Capacete Urban Classic',
  'Capacete urbano clássico com excelente custo-benefício.',
  259.90,
  299.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  40,
  true,
  'WR-URBAN-001'
FROM public.categories c WHERE c.slug = 'urban';

INSERT INTO public.products (name, description, price, category_id, image_url, stock_quantity, sku)
SELECT 
  'Capacete Adventure Trail',
  'Perfeito para aventuras off-road com proteção superior.',
  389.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  20,
  'WR-ADV-001'
FROM public.categories c WHERE c.slug = 'adventure';