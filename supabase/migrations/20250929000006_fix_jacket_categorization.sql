-- Corrigir categorização de jaquetas que estão na categoria errada
-- Esta migração move jaquetas para a categoria correta

DO $$ 
DECLARE
    jaquetas_category_id UUID;
    capacetes_category_id UUID;
BEGIN
    -- Buscar IDs das categorias
    SELECT id INTO jaquetas_category_id FROM public.categories WHERE slug = 'jaquetas';
    SELECT id INTO capacetes_category_id FROM public.categories WHERE slug = 'capacetes';
    
    -- Verificar se as categorias existem
    IF jaquetas_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoria "jaquetas" não encontrada';
    END IF;
    
    IF capacetes_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoria "capacetes" não encontrada';
    END IF;
    
    -- Mover produtos que são claramente jaquetas para a categoria correta
    UPDATE public.products 
    SET category_id = jaquetas_category_id
    WHERE (
        LOWER(name) LIKE '%jaqueta%' OR
        LOWER(name) LIKE '%jacket%' OR
        LOWER(name) LIKE '%alpinestars%' OR
        LOWER(description) LIKE '%jaqueta%' OR
        LOWER(description) LIKE '%jacket%'
    )
    AND category_id != jaquetas_category_id; -- Apenas se não estiver já na categoria correta
    
    -- Log dos produtos movidos
    RAISE NOTICE 'Produtos de jaquetas movidos para categoria correta';
    
    -- Mostrar produtos por categoria após a correção
    RAISE NOTICE 'Produtos na categoria Capacetes: %', 
        (SELECT COUNT(*) FROM public.products WHERE category_id = capacetes_category_id);
    RAISE NOTICE 'Produtos na categoria Jaquetas: %', 
        (SELECT COUNT(*) FROM public.products WHERE category_id = jaquetas_category_id);
END $$;

-- Atualizar contadores das categorias
UPDATE public.categories 
SET product_count = (
    SELECT COUNT(*) FROM public.products 
    WHERE category_id = categories.id AND is_active = true
)
WHERE slug IN ('capacetes', 'jaquetas');

-- Verificar produtos que podem estar na categoria errada
SELECT 
    p.name,
    p.description,
    c.name as categoria_atual,
    c.slug as categoria_slug
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE (
    (LOWER(p.name) LIKE '%jaqueta%' OR LOWER(p.name) LIKE '%jacket%' OR LOWER(p.name) LIKE '%alpinestars%')
    AND c.slug != 'jaquetas'
) OR (
    (LOWER(p.name) LIKE '%capacete%' OR LOWER(p.name) LIKE '%helmet%')
    AND c.slug != 'capacetes'
)
ORDER BY p.name;
