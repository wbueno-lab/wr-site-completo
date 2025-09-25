# Sistema de Permissões de Administrador

## Visão Geral

O sistema de permissões de administrador foi implementado para controlar o acesso ao painel administrativo da aplicação. Apenas usuários com permissões de administrador no banco de dados podem acessar a área administrativa.

## Como Funciona

### 1. Estrutura do Banco de Dados

- **Tabela `profiles`**: Contém o campo `is_admin` (boolean) que determina se o usuário é administrador
- **Políticas RLS**: Garantem que apenas administradores possam acessar dados sensíveis
- **Funções SQL**: Facilitam a gestão de permissões de administrador

### 2. Verificação de Permissões

O sistema verifica permissões em múltiplas camadas:

1. **Frontend**: Hook `useAdminPermissions` verifica permissões em tempo real
2. **Roteamento**: `ProtectedRoute` bloqueia acesso a rotas administrativas
3. **Componentes**: Páginas administrativas verificam permissões antes de renderizar
4. **Backend**: Políticas RLS no Supabase garantem segurança no banco

### 3. Componentes Implementados

#### `useAdminPermissions` Hook
- Verifica permissões de administrador
- Cache de permissões para performance
- Revalidação automática quando necessário
- Tratamento de erros robusto

#### `ProtectedRoute` Component
- Protege rotas que requerem autenticação
- Suporte para rotas que requerem permissões de admin
- Estados de loading e erro bem definidos
- Redirecionamento automático para login

#### `AdminUserManager` Component
- Interface para gerenciar usuários administradores
- Promover/remover privilégios de admin
- Lista de todos os usuários do sistema
- Busca por email

## Como Usar

### 1. Promover um Usuário a Administrador

#### Via Interface Web (Recomendado)
1. Faça login como administrador
2. Acesse o painel administrativo (`/admin`)
3. Vá para a aba "Usuários"
4. Encontre o usuário pelo email
5. Clique em "Promover Admin"

#### Via SQL (Para Desenvolvedores)
```sql
-- Promover usuário a admin
SELECT make_user_admin('usuario@exemplo.com');

-- Verificar se foi promovido
SELECT email, is_admin FROM profiles WHERE email = 'usuario@exemplo.com';
```

### 2. Remover Privilégios de Administrador

#### Via Interface Web
1. Acesse a aba "Usuários" no painel admin
2. Encontre o usuário administrador
3. Clique em "Remover Admin"

#### Via SQL
```sql
-- Remover privilégios de admin
SELECT remove_admin_privileges('usuario@exemplo.com');
```

### 3. Listar Administradores

```sql
-- Listar todos os administradores
SELECT * FROM list_admins();
```

## Segurança

### Políticas RLS Implementadas

1. **Profiles**: Apenas admins podem ver todos os perfis
2. **Products**: Apenas admins podem gerenciar produtos
3. **Categories**: Apenas admins podem gerenciar categorias
4. **Orders**: Admins podem ver todos os pedidos
5. **Contact Messages**: Apenas admins podem gerenciar mensagens

### Verificações de Segurança

- **Autenticação obrigatória**: Usuário deve estar logado
- **Verificação de permissões**: Campo `is_admin` deve ser `true`
- **Cache seguro**: Permissões são verificadas no banco periodicamente
- **Logs de auditoria**: Todas as ações são logadas

## Troubleshooting

### Problema: Usuário não consegue acessar o admin

**Soluções:**
1. Verificar se o usuário está logado
2. Verificar se `is_admin = true` no banco de dados
3. Fazer logout e login novamente
4. Limpar cache do navegador

### Problema: Erro "Não foi possível verificar permissões"

**Soluções:**
1. Verificar conexão com o banco de dados
2. Verificar se as políticas RLS estão ativas
3. Verificar logs do Supabase
4. Tentar novamente em alguns minutos

### Problema: Interface não carrega

**Soluções:**
1. Verificar se o usuário tem permissões de admin
2. Verificar logs do console do navegador
3. Verificar se o RealtimeContext está funcionando
4. Usar o botão "Forçar Carregamento" se disponível

## Desenvolvimento

### Adicionando Novas Verificações de Permissão

```typescript
// Em qualquer componente
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

const MyComponent = () => {
  const { canAccessAdmin, isAdmin } = useAdminPermissions();
  
  if (!canAccessAdmin) {
    return <div>Acesso negado</div>;
  }
  
  return <div>Conteúdo administrativo</div>;
};
```

### Protegendo Novas Rotas

```typescript
// Em App.tsx
<Route 
  path="/nova-rota-admin" 
  element={
    <ProtectedRoute requireAdmin={true}>
      <NovaPaginaAdmin />
    </ProtectedRoute>
  } 
/>
```

## Monitoramento

### Logs Importantes

- `ProtectedRoute - User has admin access`: Usuário acessou área admin
- `ProtectedRoute - User does not have admin access`: Acesso negado
- `useAdminPermissions - Verificando permissões`: Verificação em andamento
- `AdminUserManager - Usuário promovido`: Nova promoção a admin

### Métricas a Acompanhar

- Número de tentativas de acesso negado
- Tempo de verificação de permissões
- Erros de conexão com banco
- Usuários promovidos/removidos

## Conclusão

O sistema de permissões de administrador está implementado de forma robusta e segura, com múltiplas camadas de verificação e uma interface amigável para gerenciamento. Apenas usuários com `is_admin = true` no banco de dados podem acessar o painel administrativo.

