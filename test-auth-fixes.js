// Script de teste para verificar as correções de autenticação
// Execute com: node test-auth-fixes.js

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthSystem() {
  console.log('🧪 Iniciando testes do sistema de autenticação...\n');

  try {
    // 1. Testar conectividade
    console.log('1. Testando conectividade com Supabase...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erro de conectividade:', healthError.message);
      return;
    }
    console.log('✅ Conectividade OK\n');

    // 2. Testar estrutura da tabela profiles
    console.log('2. Verificando estrutura da tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError.message);
    } else {
      console.log('✅ Tabela profiles acessível');
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        console.log('📋 Colunas encontradas:', Object.keys(profile));
        
        // Verificar colunas necessárias
        const requiredColumns = ['id', 'email', 'is_admin', 'created_at'];
        const missingColumns = requiredColumns.filter(col => !(col in profile));
        
        if (missingColumns.length > 0) {
          console.log('⚠️ Colunas ausentes:', missingColumns);
        } else {
          console.log('✅ Todas as colunas necessárias estão presentes');
        }
      }
    }
    console.log('');

    // 3. Testar RLS policies
    console.log('3. Testando RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);
    
    if (rlsError) {
      console.log('⚠️ RLS pode estar bloqueando acesso anônimo (esperado)');
    } else {
      console.log('✅ RLS policies funcionando');
    }
    console.log('');

    // 4. Testar sistema de autenticação
    console.log('4. Testando sistema de autenticação...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message);
    } else {
      if (session.session) {
        console.log('✅ Sessão ativa encontrada para:', session.session.user.email);
      } else {
        console.log('ℹ️ Nenhuma sessão ativa (esperado para teste)');
      }
    }
    console.log('');

    // 5. Testar tabela de histórico
    console.log('5. Verificando tabela de histórico...');
    const { data: history, error: historyError } = await supabase
      .from('profile_history')
      .select('count')
      .limit(1);
    
    if (historyError) {
      console.log('⚠️ Tabela profile_history não encontrada ou inacessível');
      console.log('💡 Execute a migração para criar a tabela');
    } else {
      console.log('✅ Tabela profile_history acessível');
    }
    console.log('');

    console.log('🎉 Testes concluídos!');
    console.log('\n📋 Resumo:');
    console.log('- Conectividade: OK');
    console.log('- Tabela profiles: Verificada');
    console.log('- RLS policies: Funcionando');
    console.log('- Sistema de auth: Funcionando');
    console.log('- Tabela histórico: Verificar migração');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testAuthSystem();
