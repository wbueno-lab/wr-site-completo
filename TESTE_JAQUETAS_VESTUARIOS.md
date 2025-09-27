# Teste das Funcionalidades de Jaquetas e Vestuário

## ✅ Problemas Corrigidos

### Erros de Console Resolvidos:
1. **Elementos de formulário sem ID**: Adicionados IDs únicos para todos os `Select` e `Input`
2. **Labels sem associação**: Todos os `Label` agora têm `htmlFor` correspondente
3. **Elementos sem atributo name**: Adicionado `name` para todos os campos de input
4. **Botões de tamanho sem acessibilidade**: Adicionados `aria-pressed` e `role="group"`

## 🧪 Como Testar

### 1. Aplicar as Migrações (Obrigatório)
Antes de testar, execute as migrações no banco de dados:

```bash
# No terminal do projeto
npx supabase db reset
# ou se já tiver dados importantes:
npx supabase migration up
```

**Ou aplique manualmente no banco:**

**1.1 Inserir categorias:**
```sql
INSERT INTO public.categories (name, description, slug, icon, color, product_count) 
VALUES 
('Jaquetas', 'Jaquetas de motociclista para proteção e estilo', 'jaquetas', 'Shield', 'from-yellow-500 to-orange-500', 0),
('Vestuário', 'Equipamentos de proteção e vestuário para motociclistas', 'vestuario', 'Shirt', 'from-indigo-500 to-purple-500', 0)
ON CONFLICT (slug) DO NOTHING;
```

**1.2 Adicionar campos na tabela products:**
```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS jacket_type TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS clothing_type TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS protection_level TEXT;
```

**1.3 Limpar marcas antigas e manter apenas jaquetas:**
```sql
-- Remover associação de produtos com marcas de capacetes
UPDATE public.products SET brand_id = NULL 
WHERE brand_id IN (
  SELECT id FROM public.brands 
  WHERE name IN ('Shoei', 'Arai', 'AGV', 'HJC', 'Bell', 'Schuberth', 'Nolan', 'Scorpion', 'Caberg')
);

-- Deletar marcas de capacetes
DELETE FROM public.brands 
WHERE name IN ('Shoei', 'Arai', 'AGV', 'HJC', 'Bell', 'Schuberth', 'Nolan', 'Scorpion', 'Caberg');

-- Adicionar/atualizar marcas de jaquetas
INSERT INTO public.brands (name, description, country_of_origin, founded_year, is_active) VALUES
('Alpinestars', 'Marca italiana líder mundial em equipamentos de proteção para motociclismo', 'Itália', 1963, true),
('Texx', 'Marca brasileira especializada em equipamentos de proteção para motociclistas', 'Brasil', 1985, true),
('Norisk', 'Fabricante brasileiro de equipamentos de proteção individual', 'Brasil', 2010, true),
('X11', 'Marca brasileira reconhecida por seus produtos de alta qualidade para motociclistas', 'Brasil', 1995, true)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
```

### 2. Acessar o Admin
1. Faça login como administrador
2. Acesse `/admin`
3. Verifique se as abas "Jaquetas" e "Vestuário" aparecem

### 3. Testar Criação de Jaqueta
1. Clique na aba "Jaquetas"
2. Clique em "Nova Jaqueta"
3. Preencha os campos:
   - **Nome**: "Jaqueta Teste Couro"
   - **Preço**: "299.99"
   - **Marca**: Selecione uma marca
   - **Descrição**: "Jaqueta de couro para teste"
   - **Tipo de Jaqueta**: "Couro"
   - **Material**: "Couro bovino"
   - **Nível de Proteção**: "CE Nível 1"
4. Configure status (Novo: ✓, Ativo: ✓)
5. Clique em "Criar Jaqueta"

### 4. Testar Criação de Vestuário
1. Clique na aba "Vestuário"
2. Clique em "Novo Item"
3. Preencha os campos:
   - **Nome**: "Calça Teste Kevlar"
   - **Preço**: "199.99"
   - **Marca**: Selecione uma marca
   - **Descrição**: "Calça de kevlar para teste"
   - **Tipo de Vestuário**: "Calça"
   - **Material**: "Kevlar"
   - **Nível de Proteção**: "CE Nível 2"
4. Selecione tamanhos: P, M, G
5. Configure status (Novo: ✓, Ativo: ✓)
6. Clique em "Criar Item"

### 5. Testar Filtros e Busca
1. Use a barra de busca para encontrar produtos
2. Teste os filtros de status (Ativo/Inativo)
3. Verifique se a listagem funciona corretamente

### 6. Verificar Console
Abra o DevTools (F12) e verifique se não há mais erros relacionados a:
- `A form field element should have an id or name attribute`
- `An element doesn't have an autocomplete attribute`
- `No label associated with a form field`

## 🔍 O que Verificar

### Interface
- [ ] Abas "Jaquetas" e "Vestuário" aparecem no admin
- [ ] Ícones corretos (Shield e Shirt)
- [ ] Cores temáticas funcionando
- [ ] Modal de criação abre corretamente
- [ ] Todos os campos são editáveis

### Funcionalidade
- [ ] Criação de jaquetas funciona
- [ ] Criação de vestuário funciona
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Listagem mostra produtos corretos
- [ ] Badges de status aparecem

### Banco de Dados
- [ ] Categorias "jaquetas" e "vestuario" existem
- [ ] Produtos são salvos na categoria correta
- [ ] Campos específicos são salvos (jacket_type, clothing_type, protection_level)

### Console
- [ ] Sem erros de elementos sem ID
- [ ] Sem erros de labels não associados
- [ ] Sem warnings de acessibilidade

## 🐛 Problemas Conhecidos

### Se as categorias não aparecem:
1. Verifique se a migração foi aplicada
2. Execute no SQL do Supabase:
   ```sql
   SELECT * FROM categories WHERE slug IN ('jaquetas', 'vestuario');
   ```

### Se não consegue criar produtos:
1. Verifique permissões de admin
2. Verifique se os campos foram adicionados à tabela products
3. Veja o console do navegador para erros específicos

### Se os filtros não funcionam:
1. Verifique se há produtos nas categorias
2. Teste com dados diferentes

## 📊 Resultados Esperados

Após os testes, você deve ter:
- ✅ 2 novas abas funcionais no admin
- ✅ Capacidade de criar jaquetas e vestuário
- ✅ Console limpo sem erros
- ✅ Interface responsiva e acessível
- ✅ Produtos salvos corretamente no banco

## 🚀 Próximos Passos

Se tudo funcionar:
1. Criar produtos reais de jaquetas e vestuário
2. Adicionar imagens aos produtos
3. Testar em produção
4. Implementar páginas públicas para essas categorias
