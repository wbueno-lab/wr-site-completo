-- Categorizar produtos existentes baseado em palavras-chave no nome
-- Esta migração atribui category_id aos produtos baseado no tipo de produto

-- Obter IDs das categorias
DO $$ 
DECLARE
    capacetes_category_id UUID;
    jaquetas_category_id UUID;
    vestuario_category_id UUID;
BEGIN
    -- Buscar IDs das categorias
    SELECT id INTO capacetes_category_id FROM public.categories WHERE slug = 'capacetes';
    SELECT id INTO jaquetas_category_id FROM public.categories WHERE slug = 'jaquetas';
    SELECT id INTO vestuario_category_id FROM public.categories WHERE slug = 'vestuario';
    
    -- Categorizar produtos como CAPACETES
    UPDATE public.products 
    SET category_id = capacetes_category_id
    WHERE category_id IS NULL 
    AND (
        LOWER(name) LIKE '%capacete%' OR
        LOWER(name) LIKE '%helmet%' OR
        LOWER(name) LIKE '%integral%' OR
        LOWER(name) LIKE '%modular%' OR
        LOWER(name) LIKE '%aberto%' OR
        LOWER(name) LIKE '%fechado%' OR
        LOWER(name) LIKE '%articulado%' OR
        LOWER(name) LIKE '%off-road%' OR
        LOWER(name) LIKE '%motocross%' OR
        LOWER(name) LIKE '%trilha%' OR
        LOWER(name) LIKE '%viseira%' OR
        LOWER(name) LIKE '%solar%' OR
        LOWER(name) LIKE '%flip-up%' OR
        LOWER(name) LIKE '%jet%' OR
        LOWER(name) LIKE '%full-face%'
    );
    
    -- Categorizar produtos como JAQUETAS
    UPDATE public.products 
    SET category_id = jaquetas_category_id
    WHERE category_id IS NULL 
    AND (
        LOWER(name) LIKE '%jaqueta%' OR
        LOWER(name) LIKE '%casaco%' OR
        LOWER(name) LIKE '%jacket%' OR
        LOWER(name) LIKE '%couro%' OR
        LOWER(name) LIKE '%leather%' OR
        LOWER(name) LIKE '%textil%' OR
        LOWER(name) LIKE '%textile%' OR
        LOWER(name) LIKE '%impermeável%' OR
        LOWER(name) LIKE '%impermeavel%' OR
        LOWER(name) LIKE '%ventilada%' OR
        LOWER(name) LIKE '%ventilado%' OR
        LOWER(name) LIKE '%touring%' OR
        LOWER(name) LIKE '%sport%' OR
        LOWER(name) LIKE '%racing%' OR
        LOWER(name) LIKE '%urbana%' OR
        LOWER(name) LIKE '%urbano%' OR
        LOWER(name) LIKE '%motociclismo%'
    );
    
    -- Categorizar produtos como VESTUÁRIO
    UPDATE public.products 
    SET category_id = vestuario_category_id
    WHERE category_id IS NULL 
    AND (
        LOWER(name) LIKE '%blusa%' OR
        LOWER(name) LIKE '%camisa%' OR
        LOWER(name) LIKE '%camiseta%' OR
        LOWER(name) LIKE '%moletom%' OR
        LOWER(name) LIKE '%colete%' OR
        LOWER(name) LIKE '%luva%' OR
        LOWER(name) LIKE '%calça%' OR
        LOWER(name) LIKE '%bermuda%' OR
        LOWER(name) LIKE '%shorts%' OR
        LOWER(name) LIKE '%proteção%' OR
        LOWER(name) LIKE '%vestuário%' OR
        LOWER(name) LIKE '%roupa%' OR
        LOWER(name) LIKE '%bota%' OR
        LOWER(name) LIKE '%balaclava%' OR
        LOWER(name) LIKE '%segunda%' OR
        LOWER(name) LIKE '%pele%' OR
        LOWER(name) LIKE '%capa%' OR
        LOWER(name) LIKE '%chuva%' OR
        LOWER(name) LIKE '%macacão%'
    );
    
    -- Log dos resultados
    RAISE NOTICE 'Produtos categorizados:';
    RAISE NOTICE 'Capacetes: %', (SELECT COUNT(*) FROM public.products WHERE category_id = capacetes_category_id);
    RAISE NOTICE 'Jaquetas: %', (SELECT COUNT(*) FROM public.products WHERE category_id = jaquetas_category_id);
    RAISE NOTICE 'Vestuário: %', (SELECT COUNT(*) FROM public.products WHERE category_id = vestuario_category_id);
    RAISE NOTICE 'Sem categoria: %', (SELECT COUNT(*) FROM public.products WHERE category_id IS NULL);
END $$;

-- Verificar resultados
SELECT 
    c.name as categoria,
    COUNT(p.id) as total_produtos
FROM public.categories c
LEFT JOIN public.products p ON p.category_id = c.id
WHERE c.slug IN ('capacetes', 'jaquetas', 'vestuario')
GROUP BY c.id, c.name
ORDER BY c.name;
