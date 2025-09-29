# Solução para Avisos de Segurança do Supabase

## Problemas Identificados

Baseado na imagem do Consultor de Segurança do Supabase, existem 7 avisos que precisam ser corrigidos:

### 1. Avisos de "Caminho de pesquisa de função mutável" (6 avisos)
- `mensagens_de_contato_de_atualização_pública`
- `público.update_order_item_product_snapshot`
- `público.validar_tamanhos_disponíveis`
- `público.obter_marcas_por_tipo_de_produto`
- `público.identificador_novo_usuário`
- `public.update_atualizado_na_coluna`

### 2. Aviso de "Proteção de senha vazada desabilitada"
- A proteção contra vazamento de senha está desabilitada

## Soluções

### Passo 1: Corrigir Funções com search_path

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- 1. Corrigir função update_contact_messages_updated_at
DROP FUNCTION IF EXISTS public.update_contact_messages_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Corrigir função update_order_item_product_snapshot
DROP FUNCTION IF EXISTS public.update_order_item_product_snapshot() CASCADE;
CREATE OR REPLACE FUNCTION public.update_order_item_product_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.selected_size IS NOT NULL THEN
        NEW.product_snapshot = jsonb_set(
            COALESCE(NEW.product_snapshot, '{}'::jsonb),
            '{selected_size}',
            to_jsonb(NEW.selected_size)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger
DROP TRIGGER IF EXISTS update_order_item_product_snapshot_trigger ON public.order_items;
CREATE TRIGGER update_order_item_product_snapshot_trigger
    BEFORE INSERT OR UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_item_product_snapshot();

-- 3. Corrigir função validate_available_sizes
DROP FUNCTION IF EXISTS public.validate_available_sizes() CASCADE;
CREATE OR REPLACE FUNCTION public.validate_available_sizes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.available_sizes IS NOT NULL THEN
    IF jsonb_typeof(NEW.available_sizes) != 'array' THEN
      RAISE EXCEPTION 'available_sizes deve ser um array JSON válido';
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(NEW.available_sizes) AS elem
      WHERE jsonb_typeof(elem) != 'string'
    ) THEN
      RAISE EXCEPTION 'Todos os elementos de available_sizes devem ser strings';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger
DROP TRIGGER IF EXISTS validate_available_sizes_trigger ON public.products;
CREATE TRIGGER validate_available_sizes_trigger
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_available_sizes();

-- 4. Corrigir função get_brands_by_product_type
DROP FUNCTION IF EXISTS public.get_brands_by_product_type(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.get_brands_by_product_type(product_type TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  logo_url TEXT,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.logo_url,
    COUNT(p.id) as product_count
  FROM public.brands b
  LEFT JOIN public.products p ON b.id = p.brand_id 
    AND p.is_active = true 
    AND p.product_type = product_type
  GROUP BY b.id, b.name, b.logo_url
  ORDER BY b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Corrigir função handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Corrigir função update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### Passo 2: Habilitar Proteção contra Vazamento de Senha

1. Acesse o painel do Supabase
2. Vá para **Authentication** > **Settings**
3. Procure pela opção **"Password leak protection"** ou **"Proteção contra vazamento de senha"**
4. Habilite essa opção

### Passo 3: Verificar se as Correções Funcionaram

Execute este SQL para verificar se as funções foram corrigidas:

```sql
-- Verificar se as funções existem
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_contact_messages_updated_at',
    'update_order_item_product_snapshot', 
    'validate_available_sizes',
    'get_brands_by_product_type',
    'handle_new_user',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- Verificar se as funções têm search_path definido corretamente
SELECT 
  proname as function_name,
  proconfig
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname IN (
    'update_contact_messages_updated_at',
    'update_order_item_product_snapshot', 
    'validate_available_sizes',
    'get_brands_by_product_type',
    'handle_new_user',
    'update_updated_at_column'
  )
ORDER BY proname;
```

### Passo 4: Reexecutar o Linter

1. Volte para o **Consultor de Segurança**
2. Clique em **"Reexecutar linter"** no final da página
3. Verifique se os avisos foram resolvidos

## Explicação dos Problemas

### search_path Mutável
O problema do `search_path` mutável ocorre quando funções PostgreSQL não têm um `search_path` fixo definido. Isso pode ser uma vulnerabilidade de segurança porque:

1. **Injeção de Schema**: Um atacante pode criar schemas maliciosos com nomes que correspondem a funções do sistema
2. **Execução Inesperada**: Funções podem executar código de schemas não intencionais
3. **Privilégios Elevados**: Funções com `SECURITY DEFINER` podem executar com privilégios elevados

### Proteção contra Vazamento de Senha
Esta proteção verifica se as senhas dos usuários foram comprometidas em vazamentos conhecidos de dados.

## Benefícios da Correção

1. **Segurança Aprimorada**: Funções com `search_path` fixo são mais seguras
2. **Conformidade**: Atende às melhores práticas de segurança do PostgreSQL
3. **Proteção de Usuários**: Detecta senhas comprometidas
4. **Auditoria**: Remove avisos do consultor de segurança

## Próximos Passos

Após aplicar essas correções:

1. Monitore o consultor de segurança regularmente
2. Implemente essas práticas em novas funções
3. Considere revisar outras funções do sistema
4. Mantenha a proteção contra vazamento de senha sempre habilitada
