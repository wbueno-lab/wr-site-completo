// ========================================
// TESTE DIRETO NO CONSOLE DO NAVEGADOR
// ========================================
// Cole este código no console do navegador (F12)
// para testar a conexão com Supabase

console.log('🧪 Iniciando teste direto no console...');

// Configurações do Supabase
const SUPABASE_URL = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4';

// Função para fazer requisição direta
async function testDirectRequest(endpoint, description) {
    console.log(`🔄 ${description}...`);
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${description} - Sucesso:`, data.length || 'N/A', 'itens');
            
            if (data.length > 0 && data[0]) {
                console.log(`📊 Primeiro item:`, data[0]);
            }
            return data;
        } else {
            console.error(`❌ ${description} - Erro:`, response.status, response.statusText);
            const errorText = await response.text();
            console.error(`❌ Detalhes:`, errorText);
            return null;
        }
    } catch (error) {
        console.error(`❌ ${description} - Erro inesperado:`, error);
        return null;
    }
}

// Função principal de teste
async function runAllTests() {
    console.log('🚀 Executando todos os testes...');
    
    // Teste 1: Verificar conectividade básica
    console.log('\n=== TESTE 1: CONECTIVIDADE ===');
    await testDirectRequest('', 'Teste de conectividade');
    
    // Teste 2: Contar produtos
    console.log('\n=== TESTE 2: CONTAGEM DE PRODUTOS ===');
    await testDirectRequest('products?select=count', 'Contagem de produtos');
    
    // Teste 3: Buscar produtos simples
    console.log('\n=== TESTE 3: PRODUTOS SIMPLES ===');
    await testDirectRequest('products?select=*&limit=5', 'Busca simples de produtos');
    
    // Teste 4: Buscar produtos ativos
    console.log('\n=== TESTE 4: PRODUTOS ATIVOS ===');
    await testDirectRequest('products?select=*&is_active=eq.true&limit=5', 'Produtos ativos');
    
    // Teste 5: Buscar categorias
    console.log('\n=== TESTE 5: CATEGORIAS ===');
    await testDirectRequest('categories?select=*&limit=5', 'Busca de categorias');
    
    // Teste 6: Testar com filtros
    console.log('\n=== TESTE 6: FILTROS ===');
    await testDirectRequest('products?select=id,name,price&limit=3', 'Produtos com filtros');
    
    // Teste 7: Verificar estrutura
    console.log('\n=== TESTE 7: ESTRUTURA ===');
    const products = await testDirectRequest('products?select=*&limit=1', 'Estrutura de produto');
    
    if (products && products.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(products[0]));
    }
    
    console.log('\n🏁 Testes concluídos!');
}

// Função para testar inserção (cuidado!)
async function testInsert() {
    console.log('⚠️ TESTE DE INSERÇÃO (CUIDADO!)');
    
    const testProduct = {
        name: `Produto Teste Console ${Date.now()}`,
        price: 99.90,
        description: 'Produto criado via console para teste',
        is_active: true,
        sku: `CONSOLE-TEST-${Date.now()}`
    };
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testProduct)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Produto inserido com sucesso:', data[0]);
            return data[0];
        } else {
            console.error('❌ Erro na inserção:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Detalhes:', errorText);
        }
    } catch (error) {
        console.error('❌ Erro inesperado na inserção:', error);
    }
}

// Executar testes automaticamente
console.log('📋 Comandos disponíveis:');
console.log('- runAllTests() - Executa todos os testes');
console.log('- testInsert() - Testa inserção (cuidado!)');
console.log('- testDirectRequest(endpoint, description) - Teste personalizado');

// Executar automaticamente
runAllTests();

// ========================================
// INSTRUÇÕES DE USO:
// ========================================
// 1. Abra o console do navegador (F12)
// 2. Cole este código completo
// 3. Pressione Enter
// 4. Analise os resultados
// 5. Use os comandos individuais se necessário
// ========================================

