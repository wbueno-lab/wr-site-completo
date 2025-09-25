-- Fix security warnings for functions by setting proper search_path

-- Update the existing functions to have secure search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS public.update_category_product_count() CASCADE;
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
$$ LANGUAGE plpgsql SET search_path = public;

DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'WR' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(nextval('order_sequence')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the triggers
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_category_count_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_category_product_count();

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();