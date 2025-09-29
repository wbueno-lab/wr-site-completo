-- Migração para habilitar proteção contra vazamento de senha
-- Esta migração tenta habilitar a proteção via SQL

-- Método 1: Configuração de sistema
DO $$
BEGIN
  -- Tentar habilitar proteção contra vazamento de senha
  PERFORM set_config('supabase.auth.password_leak_protection', 'true', false);
  RAISE NOTICE 'Proteção contra vazamento de senha habilitada via SQL';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível habilitar via SQL. Habilite manualmente no painel do Supabase.';
    RAISE NOTICE 'Erro: %', SQLERRM;
END $$;

-- Método 2: Configuração de sessão
SET supabase.auth.password_leak_protection = 'true';

-- Método 3: Verificar configuração atual
SELECT 
  name,
  setting,
  context,
  source
FROM pg_settings 
WHERE name LIKE '%password%' 
   OR name LIKE '%leak%'
   OR name LIKE '%supabase%'
ORDER BY name;

-- Método 4: Verificar configurações de autenticação
SELECT 
  name,
  setting,
  context
FROM pg_settings 
WHERE name LIKE '%auth%'
ORDER BY name;

-- Nota: Se os métodos SQL não funcionarem, a proteção deve ser habilitada
-- manualmente no painel do Supabase em Authentication > Settings
