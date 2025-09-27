# Marcas de Capacetes Atualizadas

## ✅ Marcas de Capacetes (10 marcas)

Conforme solicitado, as marcas de capacetes foram atualizadas para incluir apenas:

### 🇧🇷 Marcas Brasileiras (7 marcas)
1. **ASX** - Marca brasileira de capacetes com design moderno
2. **Bieffe** - Marca brasileira com boa relação custo-benefício  
3. **FW3** - Fabricante brasileiro de capacetes urbanos e esportivos
4. **Norisk** - Fabricante brasileiro (também faz jaquetas)
5. **Peels** - Marca brasileira de capacetes urbanos e clássicos
6. **Race Tech** - Fabricante brasileiro de capacetes esportivos
7. **Texx** - Marca brasileira (também faz jaquetas)

### 🌍 Marcas Internacionais (3 marcas)
8. **AGV** 🇮🇹 - Marca italiana especializada em capacetes esportivos
9. **KYT** 🇮🇹 - Marca italiana de capacetes de alta performance
10. **LS2** 🇪🇸 - Marca espanhola com boa relação custo-benefício

## ❌ Marcas Removidas

As seguintes marcas de capacetes foram **removidas** da lista:
- Arai (Japão)
- Bell (Estados Unidos) 
- HJC (Coreia do Sul)
- Nolan (Itália)
- Shoei (Japão)
- AXXIS (Brasil)

## 🧥 Marcas de Jaquetas (4 marcas)

Permanecem as mesmas:
1. **Alpinestars** 🇮🇹 - Especializada em jaquetas
2. **X11** 🇧🇷 - Especializada em jaquetas
3. **Norisk** 🇧🇷 - Mista (capacetes + jaquetas)
4. **Texx** 🇧🇷 - Mista (capacetes + jaquetas)

## 📊 Distribuição Final

### Por Categoria:
- **Capacetes**: 10 marcas
- **Jaquetas**: 4 marcas
- **Vestuário**: 4 marcas (mesmas de jaquetas)

### Por Origem:
- **Brasil**: 7 marcas de capacetes + 3 de jaquetas = 10 marcas totais
- **Itália**: 3 marcas (2 capacetes + 1 jaqueta)  
- **Espanha**: 1 marca (capacetes)

## 🔧 Migração Atualizada

O arquivo `20250927000004_organize_brands_by_product_type.sql` foi atualizado com:

```sql
-- Marcas de capacetes (10 marcas)
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active, product_types) VALUES
('AGV', 'Marca italiana especializada em capacetes esportivos e de corrida', 'Itália', 1947, true, '{"capacetes"}'),
('Norisk', 'Fabricante brasileiro de capacetes e equipamentos de proteção', 'Brasil', 2010, true, '{"capacetes"}'),
('LS2', 'Marca espanhola de capacetes com boa relação custo-benefício', 'Espanha', 1990, true, '{"capacetes"}'),
('KYT', 'Marca italiana de capacetes esportivos de alta performance', 'Itália', 1990, true, '{"capacetes"}'),
('Race Tech', 'Fabricante brasileiro de capacetes esportivos', 'Brasil', 2008, true, '{"capacetes"}'),
('ASX', 'Marca brasileira de capacetes com design moderno', 'Brasil', 2012, true, '{"capacetes"}'),
('FW3', 'Fabricante brasileiro de capacetes urbanos e esportivos', 'Brasil', 2010, true, '{"capacetes"}'),
('Bieffe', 'Marca brasileira de capacetes com boa relação custo-benefício', 'Brasil', 2005, true, '{"capacetes"}'),
('Peels', 'Marca brasileira de capacetes urbanos e clássicos', 'Brasil', 1998, true, '{"capacetes"}'),
('Texx', 'Marca brasileira de capacetes, jaquetas e equipamentos de proteção', 'Brasil', 1985, true, '{"capacetes", "jaquetas"}');
```

## 🎯 Resultado no Admin

### Aba Capacetes
Dropdown "Marca" mostrará **apenas 10 opções**:
AGV, ASX, Bieffe, FW3, KYT, LS2, Norisk, Peels, Race Tech, Texx

### Aba Jaquetas  
Dropdown "Marca" mostrará **apenas 4 opções**:
Alpinestars, Norisk, Texx, X11

### Aba Vestuário
Dropdown "Marca" mostrará **apenas 4 opções**:
Alpinestars, Norisk, Texx, X11

## ✅ Próximos Passos

1. **Aplicar a migração**:
   ```bash
   npx supabase migration up
   ```

2. **Testar no admin**:
   - Verificar se capacetes mostra 10 marcas
   - Verificar se jaquetas mostra 4 marcas
   - Criar produtos de teste

3. **Confirmar funcionamento**:
   - Dropdown limpo e organizado
   - Apenas marcas relevantes por categoria
   - Performance otimizada

A lista está agora exatamente como solicitado! 🎯
