// Script para testar a solução alternativa
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAlternativeSolution() {
  console.log('🔍 Testando solução alternativa (sem colunas selected_size)...\n');

  try {
    // 1. Testar consulta de pedidos sem selected_size
    console.log('1. Testando consulta de pedidos...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_items (
          id,
          product_id,
          product_snapshot
        )
      `)
      .limit(1);

    if (ordersError) {
      console.error('❌ Erro na consulta de pedidos:', ordersError.message);
    } else {
      console.log('✅ Consulta de pedidos funcionando');
      if (orders && orders.length > 0) {
        const order = orders[0];
        console.log('📊 Pedido encontrado:', {
          id: order.id,
          order_number: order.order_number,
          items_count: order.order_items?.length || 0
        });
        
        if (order.order_items && order.order_items.length > 0) {
          order.order_items.forEach((item, index) => {
            console.log(`📦 Item ${index + 1}:`, {
              product_id: item.product_id,
              has_snapshot: !!item.product_snapshot,
              snapshot_type: typeof item.product_snapshot
            });
            
            // Tentar extrair selected_size do product_snapshot
            if (item.product_snapshot) {
              let selectedSize = null;
              
              if (typeof item.product_snapshot === 'object') {
                selectedSize = item.product_snapshot.selected_size;
              } else if (typeof item.product_snapshot === 'string') {
                try {
                  const parsed = JSON.parse(item.product_snapshot);
                  selectedSize = parsed.selected_size;
                } catch (e) {
                  console.log('⚠️ Erro ao fazer parse do product_snapshot:', e.message);
                }
              }
              
              console.log(`   📏 Tamanho encontrado: ${selectedSize || 'Nenhum'}`);
            }
          });
        }
      } else {
        console.log('📊 Nenhum pedido encontrado');
      }
    }

    // 2. Testar se conseguimos criar um pedido de teste
    console.log('\n2. Testando criação de pedido de teste...');
    const testOrderData = {
      user_id: 'test-user',
      order_number: 'TEST-' + Date.now(),
      status: 'pending',
      total_amount: 100.00,
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '123456789',
      shipping_address: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345'
      }
    };

    const { data: testOrder, error: testOrderError } = await supabase
      .from('orders')
      .insert(testOrderData)
      .select()
      .single();

    if (testOrderError) {
      console.error('❌ Erro ao criar pedido de teste:', testOrderError.message);
    } else {
      console.log('✅ Pedido de teste criado:', testOrder.id);
      
      // Limpar pedido de teste
      await supabase.from('orders').delete().eq('id', testOrder.id);
      console.log('🧹 Pedido de teste removido');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAlternativeSolution();
