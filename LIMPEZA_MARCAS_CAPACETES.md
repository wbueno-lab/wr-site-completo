# Limpeza das Marcas - Mantendo Apenas Jaquetas

## 🧹 Operação Realizada

Foi criada uma migração para remover todas as marcas de capacetes e manter apenas as marcas específicas de jaquetas.

## ❌ Marcas Removidas (Capacetes)

As seguintes marcas de capacetes foram removidas do banco de dados:

1. **Shoei** 🇯🇵 - Fabricante japonês de capacetes premium
2. **Arai** 🇯🇵 - Marca japonesa de capacetes de alta qualidade  
3. **AGV** 🇮🇹 - Marca italiana de capacetes esportivos
4. **HJC** 🇰🇷 - Fabricante coreano de capacetes
5. **Bell** 🇺🇸 - Marca americana pioneira em capacetes
6. **Schuberth** 🇩🇪 - Fabricante alemão de capacetes premium
7. **Nolan** 🇮🇹 - Marca italiana de capacetes modulares
8. **Scorpion** 🇺🇸 - Fabricante americano de capacetes
9. **Caberg** 🇮🇹 - Fabricante italiano de capacetes modulares

## ✅ Marcas Mantidas (Jaquetas)

Apenas estas 5 marcas permanecem no sistema, todas especializadas em jaquetas:

1. **Alpinestars** 🇮🇹 - Líder mundial em jaquetas técnicas
2. **LS2** 🇪🇸 - Jaquetas e equipamentos de proteção (descrição atualizada)
3. **Norisk** 🇧🇷 - Equipamentos de proteção brasileiros
4. **Texx** 🇧🇷 - Jaquetas brasileiras de qualidade
5. **X11** 🇧🇷 - Produtos brasileiros de alta qualidade

## 📋 Migração Aplicada

**Arquivo**: `20250927000003_cleanup_brands_keep_only_jackets.sql`

### Operações realizadas:

1. **Desassociar produtos**: Remove a ligação entre produtos existentes e marcas de capacetes
2. **Deletar marcas antigas**: Remove todas as marcas de capacetes do banco
3. **Atualizar LS2**: Modifica a descrição para focar em jaquetas
4. **Garantir marcas de jaquetas**: Insere/atualiza as 5 marcas de jaquetas

## 🔧 Como Aplicar

### Opção 1 - Via CLI:
```bash
npx supabase migration up
```

### Opção 2 - Manualmente:
```sql
-- 1. Desassociar produtos de marcas de capacetes
UPDATE public.products 
SET brand_id = NULL 
WHERE brand_id IN (
  SELECT id FROM public.brands 
  WHERE name IN ('Shoei', 'Arai', 'AGV', 'HJC', 'Bell', 'Schuberth', 'Nolan', 'Scorpion', 'Caberg')
);

-- 2. Deletar marcas de capacetes
DELETE FROM public.brands 
WHERE name IN ('Shoei', 'Arai', 'AGV', 'HJC', 'Bell', 'Schuberth', 'Nolan', 'Scorpion', 'Caberg');

-- 3. Atualizar LS2 para jaquetas
UPDATE public.brands 
SET description = 'Marca espanhola especializada em jaquetas e equipamentos de proteção para motociclistas'
WHERE name = 'LS2';

-- 4. Garantir marcas de jaquetas
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active) VALUES
('Alpinestars', 'Marca italiana líder mundial em equipamentos de proteção para motociclismo', 'Itália', 1963, true),
('Texx', 'Marca brasileira especializada em equipamentos de proteção para motociclistas', 'Brasil', 1985, true),
('Norisk', 'Fabricante brasileiro de equipamentos de proteção individual', 'Brasil', 2010, true),
('X11', 'Marca brasileira reconhecida por seus produtos de alta qualidade para motociclistas', 'Brasil', 1995, true)
ON CONFLICT (name) DO NOTHING;
```

## 🔍 Verificação

Para confirmar que a limpeza foi bem-sucedida:

```sql
-- Ver todas as marcas restantes
SELECT name, description, country_of_origin 
FROM public.brands 
ORDER BY name;

-- Verificar produtos sem marca
SELECT COUNT(*) as produtos_sem_marca 
FROM public.products 
WHERE brand_id IS NULL;
```

## ⚠️ Impactos

### Positivos:
- ✅ Foco exclusivo em jaquetas
- ✅ Lista de marcas mais limpa e específica
- ✅ Evita confusão entre produtos de capacetes e jaquetas
- ✅ Interface mais organizada no admin

### Considerações:
- 🔄 Produtos existentes que tinham marcas de capacetes ficaram sem marca
- 🔄 Será necessário reassociar produtos de capacetes a marcas adequadas se necessário
- 🔄 Caso precise de marcas de capacetes no futuro, será necessário adicioná-las novamente

## 🎯 Resultado Final

Após a migração, o dropdown "Marca" nas abas de jaquetas e vestuário mostrará apenas:
- Alpinestars
- LS2  
- Norisk
- Texx
- X11

Isso torna a seleção mais focada e específica para o tipo de produto sendo criado! 🎯
