# Módulos de Jaquetas e Vestuário - Painel Admin

## Visão Geral

Este documento descreve a implementação dos novos módulos de **Jaquetas** e **Vestuário** no painel administrativo da WR Capacetes.

## Funcionalidades Implementadas

### 1. Aba Jaquetas
- **Localização**: `/admin` → Aba "Jaquetas"
- **Componente**: `JaquetasManager.tsx`
- **Funcionalidades**:
  - Listagem de jaquetas cadastradas
  - Criação de novas jaquetas
  - Edição de jaquetas existentes
  - Exclusão de jaquetas
  - Filtros por status (ativo/inativo)
  - Busca por nome

#### Campos Específicos para Jaquetas:
- **Tipo de Jaqueta**: Têxtil, Couro, Mesh, Impermeável
- **Material**: Descrição do material (ex: Couro bovino, Cordura)
- **Nível de Proteção**: CE Nível 1, CE Nível 2, etc.
- **Tamanhos Disponíveis**: PP, P, M, G, GG, XG, XXG
- **Cores Disponíveis**: Múltiplas opções de cores

### 2. Aba Vestuário
- **Localização**: `/admin` → Aba "Vestuário"
- **Componente**: `VestuarioManager.tsx`
- **Funcionalidades**:
  - Listagem de itens de vestuário
  - Criação de novos itens
  - Edição de itens existentes
  - Exclusão de itens
  - Filtros por status (ativo/inativo)
  - Busca por nome

#### Campos Específicos para Vestuário:
- **Tipo de Vestuário**: Calça, Camiseta, Luvas, Botas, Colete, Protetor, Acessório
- **Material**: Couro, Kevlar, Cordura, etc.
- **Nível de Proteção**: Básica, CE Nível 1, CE Nível 2
- **Tamanhos Disponíveis**: PP, P, M, G, GG, XG, XXG, 36, 38, 40, 42, 44, 46
- **Cores Disponíveis**: Múltiplas opções de cores

## Estrutura do Banco de Dados

### Categorias Adicionadas
```sql
-- Categoria Jaquetas
INSERT INTO categories (name, description, slug, icon, color) VALUES
('Jaquetas', 'Jaquetas de motociclista para proteção e estilo', 'jaquetas', 'Shield', 'from-yellow-500 to-orange-500');

-- Categoria Vestuário
INSERT INTO categories (name, description, slug, icon, color) VALUES
('Vestuário', 'Equipamentos de proteção e vestuário para motociclistas', 'vestuario', 'Shirt', 'from-indigo-500 to-purple-500');
```

### Campos Adicionados à Tabela Products
```sql
ALTER TABLE products ADD COLUMN jacket_type TEXT;        -- Tipo de jaqueta
ALTER TABLE products ADD COLUMN clothing_type TEXT;      -- Tipo de vestuário
ALTER TABLE products ADD COLUMN protection_level TEXT;   -- Nível de proteção
```

## Como Usar

### Acessando os Módulos
1. Faça login como administrador
2. Acesse `/admin`
3. Clique nas abas "Jaquetas" ou "Vestuário"

### Criando uma Nova Jaqueta
1. Na aba "Jaquetas", clique em "Nova Jaqueta"
2. Preencha os campos obrigatórios:
   - Nome
   - Preço
3. Configure os campos específicos:
   - Tipo de jaqueta
   - Material
   - Nível de proteção
4. Selecione tamanhos disponíveis
5. Configure status (Novo, Promoção, Ativo)
6. Clique em "Criar Jaqueta"

### Criando um Novo Item de Vestuário
1. Na aba "Vestuário", clique em "Novo Item"
2. Preencha os campos obrigatórios:
   - Nome
   - Preço
3. Configure os campos específicos:
   - Tipo de vestuário
   - Material
   - Nível de proteção
4. Selecione tamanhos disponíveis
5. Configure status (Novo, Promoção, Ativo)
6. Clique em "Criar Item"

## Filtros e Busca

### Filtros Disponíveis
- **Status**: Todos, Ativo, Inativo
- **Busca por texto**: Nome do produto

### Funcionalidades de Listagem
- Visualização em cards com imagem
- Informações principais: nome, descrição, preço
- Badges de status: Ativo/Inativo, Novo, Promoção
- Ações: Editar, Excluir

## Interface do Usuário

### Design
- Interface dark theme consistente com o resto do admin
- Cards responsivos para listagem
- Modal para criação/edição
- Ícones específicos: Shield (Jaquetas), Shirt (Vestuário)
- Cores de destaque: amarelo-laranja (Jaquetas), índigo-roxo (Vestuário)

### Responsividade
- Abas se adaptam em telas menores
- Layout flexível para diferentes tamanhos de tela
- Botões com texto oculto em telas pequenas

## Arquivos Modificados/Criados

### Novos Componentes
- `src/components/admin/JaquetasManager.tsx`
- `src/components/admin/VestuarioManager.tsx`

### Arquivos Modificados
- `src/pages/AdminPage.tsx` - Adicionadas novas abas
- `src/components/admin/index.ts` - Exportação dos novos componentes

### Migração de Banco
- `supabase/migrations/20250927000001_add_jaquetas_vestuarios_categories.sql`

## Próximos Passos

1. **Aplicar a migração** no banco de dados de produção
2. **Testar** a criação de produtos em cada categoria
3. **Adicionar imagens** específicas para jaquetas e vestuário
4. **Implementar validações** adicionais se necessário
5. **Criar** páginas públicas para exibir esses produtos

## Observações Técnicas

- Os componentes seguem o mesmo padrão do `ProductManager` existente
- Integração completa com o sistema de realtime
- Validações de campos obrigatórios
- Tratamento de erros com toasts
- Estados de loading e feedback visual
- Código TypeScript tipado

## Suporte

Para dúvidas ou problemas com os novos módulos, verifique:
1. Se as categorias foram criadas no banco de dados
2. Se as permissões de admin estão corretas
3. Se os campos adicionais foram criados na tabela products
4. Se há erros no console do navegador




