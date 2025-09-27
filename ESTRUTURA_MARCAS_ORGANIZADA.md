# Estrutura de Marcas Organizada por Tipo de Produto

## 🎯 Nova Estrutura Implementada

A estrutura de marcas foi reorganizada para separar claramente marcas de capacetes e marcas de jaquetas/vestuário.

## 📊 Campo `product_types`

Foi adicionado o campo `product_types` na tabela `brands`:
- **Tipo**: `TEXT[]` (array de texto)
- **Valores possíveis**: `"capacetes"`, `"jaquetas"`, `"vestuario"`
- **Permite múltiplos tipos**: Uma marca pode fazer tanto capacetes quanto jaquetas

## 🏷️ Marcas de Capacetes

### Marcas Nacionais 🇧🇷
- **ASX** - Design moderno
- **Bieffe** - Boa relação custo-benefício
- **FW3** - Capacetes urbanos e esportivos
- **Norisk** - Capacetes e equipamentos de proteção
- **Peels** - Capacetes urbanos e clássicos
- **Race Tech** - Capacetes esportivos
- **Texx** - Capacetes e equipamentos de proteção

### Marcas Internacionais 🌍
- **AGV** 🇮🇹 - Capacetes esportivos e de corrida
- **KYT** 🇮🇹 - Alta performance esportiva
- **LS2** 🇪🇸 - Boa relação custo-benefício

## 🧥 Marcas de Jaquetas

### Marcas Especializadas
- **Alpinestars** 🇮🇹 - Líder mundial em jaquetas técnicas
- **X11** 🇧🇷 - Produtos brasileiros de alta qualidade

### Marcas Mistas
- **Norisk** 🇧🇷 - Faz tanto capacetes quanto jaquetas
- **Texx** 🇧🇷 - Faz tanto capacetes quanto jaquetas

## 🔧 Implementação Técnica

### Migração Aplicada
```sql
-- Adicionar campo product_types
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS product_types TEXT[] DEFAULT '{}';

-- Inserir marcas organizadas por tipo
INSERT INTO public.brands (name, description, country_of_origin, founded_year, product_types) VALUES
-- Marcas de capacetes
('AGV', '...', 'Itália', 1947, '{"capacetes"}'),
-- Marcas de jaquetas  
('Alpinestars', '...', 'Itália', 1963, '{"jaquetas"}'),
-- Marcas mistas
('Norisk', '...', 'Brasil', 2010, '{"capacetes", "jaquetas"}');
```

### Filtros nos Componentes

**ProductManager (Capacetes):**
```typescript
const helmetBrands = brands?.filter(brand => 
  brand.product_types?.includes('capacetes') || 
  !['Alpinestars', 'Texx', 'X11'].includes(brand.name)
) || [];
```

**JaquetasManager:**
```typescript
const jacketBrands = brands?.filter(brand => 
  brand.product_types?.includes('jaquetas') || 
  ['Alpinestars', 'Texx', 'X11', 'Norisk'].includes(brand.name)
) || [];
```

**VestuarioManager:**
```typescript
const vestuarioBrands = brands?.filter(brand => 
  brand.product_types?.includes('jaquetas') || 
  ['Alpinestars', 'Texx', 'X11', 'Norisk'].includes(brand.name)
) || [];
```

## 🎯 Resultado Final

### Admin - Aba Capacetes
Mostra apenas marcas de capacetes:
- AGV, Norisk, LS2, KYT, Race Tech, ASX, FW3, Bieffe, Peels, Texx

### Admin - Aba Jaquetas
Mostra apenas marcas de jaquetas:
- Alpinestars, X11, Norisk, Texx

### Admin - Aba Vestuário
Mostra as mesmas marcas de jaquetas:
- Alpinestars, X11, Norisk, Texx

## 🔍 Função de Busca

Foi criada uma função SQL para facilitar consultas:

```sql
-- Buscar marcas de capacetes
SELECT * FROM get_brands_by_product_type('capacetes');

-- Buscar marcas de jaquetas
SELECT * FROM get_brands_by_product_type('jaquetas');
```

## ✅ Vantagens da Nova Estrutura

1. **Organização Clara**: Cada tipo de produto tem suas marcas específicas
2. **Flexibilidade**: Marcas podem fazer múltiplos tipos de produtos
3. **Interface Limpa**: Dropdowns mostram apenas marcas relevantes
4. **Escalabilidade**: Fácil adicionar novos tipos de produtos
5. **Manutenibilidade**: Estrutura clara e bem documentada

## 🚀 Como Aplicar

1. **Execute a migração**:
   ```bash
   npx supabase migration up
   ```

2. **Ou aplique manualmente**:
   ```sql
   -- Ver o arquivo: 20250927000004_organize_brands_by_product_type.sql
   ```

3. **Teste no admin**:
   - Capacetes: Deve mostrar 10 marcas
   - Jaquetas: Deve mostrar 4 marcas
   - Vestuário: Deve mostrar 4 marcas

## 📈 Expansão Futura

Para adicionar novos tipos de produtos:

```sql
-- Exemplo: Adicionar categoria "luvas"
UPDATE brands SET product_types = array_append(product_types, 'luvas') 
WHERE name IN ('Alpinestars', 'Texx');
```

A estrutura está preparada para crescer conforme necessário! 🎯
