-- Function to make a user admin by email
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Check if user exists and update their admin status
  UPDATE public.profiles 
  SET is_admin = true 
  WHERE email = user_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Create some additional sample products to showcase the functionality
INSERT INTO public.products (name, description, price, original_price, category_id, image_url, stock_quantity, is_new, is_promo, sku)
SELECT 
  'Capacete Titan Pro',
  'Capacete premium com tecnologia anti-impacto avançada e sistema de ventilação superior.',
  599.90,
  699.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  15,
  true,
  true,
  'WR-RACING-002'
FROM public.categories c WHERE c.slug = 'racing';

INSERT INTO public.products (name, description, price, category_id, image_url, stock_quantity, is_new, sku)
SELECT 
  'Capacete Urban Street',
  'Design moderno e confortável para uso urbano diário.',
  219.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  35,
  true,
  'WR-URBAN-002'
FROM public.categories c WHERE c.slug = 'urban';

INSERT INTO public.products (name, description, price, original_price, category_id, image_url, stock_quantity, is_promo, sku)
SELECT 
  'Capacete Adventure X',
  'Resistente e durável, perfeito para trilhas e aventuras extremas.',
  449.90,
  499.90,
  c.id,
  '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png',
  12,
  true,
  'WR-ADV-002'
FROM public.categories c WHERE c.slug = 'adventure';

-- Update category counts after adding products
UPDATE public.categories 
SET product_count = (
  SELECT COUNT(*) FROM public.products 
  WHERE category_id = categories.id AND is_active = true
);