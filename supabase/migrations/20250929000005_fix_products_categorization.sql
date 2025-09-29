-- Corrigir categorização dos produtos existentes
-- Esta migração move produtos das categorias antigas (racing, sport, etc.) para as novas categorias principais

DO $$ 
DECLARE
    capacetes_category_id UUID;
    jaquetas_category_id UUID;
    vestuario_category_id UUID;
BEGIN
    -- Buscar IDs das categorias principais
    SELECT id INTO capacetes_category_id FROM public.categories WHERE slug = 'capacetes';
    SELECT id INTO jaquetas_category_id FROM public.categories WHERE slug = 'jaquetas';
    SELECT id INTO vestuario_category_id FROM public.categories WHERE slug = 'vestuario';
    
    -- Verificar se as categorias existem
    IF capacetes_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoria "capacetes" não encontrada';
    END IF;
    
    IF jaquetas_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoria "jaquetas" não encontrada';
    END IF;
    
    IF vestuario_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoria "vestuario" não encontrada';
    END IF;
    
    -- Mover todos os produtos de categorias de capacetes antigas para a categoria principal "Capacetes"
    UPDATE public.products 
    SET category_id = capacetes_category_id
    WHERE category_id IN (
        SELECT id FROM public.categories 
        WHERE slug IN ('racing', 'sport', 'adventure', 'urban', 'capacetes-integrais', 'capacetes-modulares')
    );
    
    -- Mover produtos que têm nomes relacionados a capacetes mas estão sem categoria
    UPDATE public.products 
    SET category_id = capacetes_category_id
    WHERE category_id IS NULL 
    AND (
        LOWER(name) LIKE '%capacete%' OR
        LOWER(name) LIKE '%helmet%' OR
        LOWER(description) LIKE '%capacete%' OR
        LOWER(description) LIKE '%helmet%'
    );
    
    -- Log dos resultados
    RAISE NOTICE 'Produtos movidos para categoria Capacetes: %', 
        (SELECT COUNT(*) FROM public.products WHERE category_id = capacetes_category_id);
    RAISE NOTICE 'Produtos na categoria Jaquetas: %', 
        (SELECT COUNT(*) FROM public.products WHERE category_id = jaquetas_category_id);
    RAISE NOTICE 'Produtos na categoria Vestuário: %', 
        (SELECT COUNT(*) FROM public.products WHERE category_id = vestuario_category_id);
    RAISE NOTICE 'Produtos sem categoria: %', 
        (SELECT COUNT(*) FROM public.products WHERE category_id IS NULL);
END $$;

-- Atualizar contadores das categorias
UPDATE public.categories 
SET product_count = (
    SELECT COUNT(*) FROM public.products 
    WHERE category_id = categories.id AND is_active = true
)
WHERE slug IN ('capacetes', 'jaquetas', 'vestuario');

-- Verificar resultados finais
SELECT 
    c.name as categoria,
    c.slug,
    COUNT(p.id) as total_produtos,
    COUNT(CASE WHEN p.is_active = true THEN 1 END) as produtos_ativos
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id
WHERE c.slug IN ('capacetes', 'jaquetas', 'vestuario')
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;
