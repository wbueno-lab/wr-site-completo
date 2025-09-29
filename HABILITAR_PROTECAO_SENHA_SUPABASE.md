# Como Habilitar Proteção contra Vazamento de Senha no Supabase

## Problema
O Consultor de Segurança mostra 1 aviso: **"Leaked Password Protection Disabled"**

## Solução Passo a Passo

### Método 1: Via Painel do Supabase (Recomendado)

1. **Acesse o painel do Supabase**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Navegue para Authentication**
   - No menu lateral esquerdo, clique em **"Authentication"**
   - Clique em **"Settings"** (Configurações)

3. **Encontre a opção de Proteção contra Vazamento**
   - Procure por **"Password leak protection"** ou **"Proteção contra vazamento de senha"**
   - Pode estar em uma seção chamada **"Security"** ou **"Segurança"**

4. **Habilite a proteção**
   - Ative o toggle/switch para **"Enable password leak protection"**
   - Salve as configurações

### Método 2: Via SQL (Alternativo)

Se não conseguir encontrar a opção no painel, tente executar este SQL:

```sql
-- Tentar habilitar proteção contra vazamento de senha via SQL
-- Nota: Pode não funcionar dependendo das permissões do projeto

-- Opção 1: Configuração global
ALTER SYSTEM SET supabase.auth.password_leak_protection = 'true';

-- Opção 2: Configuração de sessão
SET supabase.auth.password_leak_protection = 'true';

-- Opção 3: Configuração via função
SELECT set_config('supabase.auth.password_leak_protection', 'true', false);
```

### Método 3: Via Dashboard API (Avançado)

Se você tem acesso à API do Supabase, pode tentar:

```bash
# Substitua YOUR_PROJECT_REF e YOUR_ACCESS_TOKEN
curl -X PATCH \
  'https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/config' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "auth": {
      "password_leak_protection": true
    }
  }'
```

## Verificação

Após habilitar a proteção:

1. **Volte para o Consultor de Segurança**
2. **Clique em "Refresh"** ou **"Reexecutar linter"**
3. **Verifique se o aviso desapareceu**

## O que é a Proteção contra Vazamento de Senha?

Esta proteção:

- **Verifica senhas** contra bancos de dados de senhas vazadas conhecidas
- **Bloqueia senhas comprometidas** durante o registro/alteração
- **Protege usuários** contra ataques de força bruta
- **Melhora a segurança** geral da aplicação

## Benefícios

✅ **Segurança aprimorada** para todos os usuários
✅ **Conformidade** com melhores práticas de segurança
✅ **Proteção proativa** contra senhas comprometidas
✅ **Eliminação** do último aviso de segurança

## Troubleshooting

### Se não conseguir encontrar a opção:

1. **Verifique a versão** do Supabase (pode estar em versão mais antiga)
2. **Procure em diferentes seções**: Auth, Security, Settings
3. **Contate o suporte** do Supabase se necessário
4. **Use o método SQL** como alternativa

### Se o SQL não funcionar:

- Isso é normal em projetos hospedados
- A configuração deve ser feita via painel
- Algumas configurações são apenas para administradores

## Resultado Esperado

Após habilitar a proteção:
- ✅ **0 erros**
- ✅ **0 avisos** 
- ✅ **0 sugestões**

Sua aplicação estará **100% segura** segundo o Consultor de Segurança do Supabase! 🛡️
