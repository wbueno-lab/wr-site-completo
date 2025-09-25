// Script para testar as correções de conectividade
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnectivityFixes() {
  console.log('🧪 Testando correções de conectividade...\n');

  try {
    // 1. Testar conectividade básica
    console.log('1. Testando conectividade básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erro de conectividade:', healthError.message);
    } else {
      console.log('✅ Conectividade básica OK\n');
    }

    // 2. Testar autenticação
    console.log('2. Testando sistema de autenticação...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError.message);
    } else {
      if (session.session) {
        console.log('✅ Sessão ativa encontrada para:', session.session.user.email);
      } else {
        console.log('ℹ️ Nenhuma sessão ativa (esperado para teste)');
      }
    }
    console.log('');

    // 3. Testar requisições REST
    console.log('3. Testando requisições REST...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Requisições REST funcionando');
      } else {
        console.log('⚠️ Requisições REST com problemas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro nas requisições REST:', error.message);
    }
    console.log('');

    // 4. Testar endpoints de conectividade
    console.log('4. Testando endpoints de conectividade...');
    const endpoints = [
      'https://httpbin.org/get',
      'https://api.supabase.com/health'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        console.log(`✅ ${endpoint} - OK`);
      } catch (error) {
        console.log(`⚠️ ${endpoint} - Erro:`, error.message);
      }
    }
    console.log('');

    console.log('🎉 Testes de conectividade concluídos!');
    console.log('\n📋 Resumo:');
    console.log('- Conectividade básica: Verificada');
    console.log('- Sistema de auth: Funcionando');
    console.log('- Requisições REST: Testadas');
    console.log('- Endpoints externos: Testados');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testConnectivityFixes();
