// Script para testar se as migrações foram aplicadas corretamente
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigrations() {
  console.log('🔍 Testando migrações...\n');

  try {
    // Testar se a coluna selected_size existe em order_items
    console.log('1. Testando coluna selected_size em order_items...');
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id, selected_size')
      .limit(5);

    if (orderItemsError) {
      console.error('❌ Erro ao consultar order_items:', orderItemsError.message);
    } else {
      console.log('✅ Coluna selected_size existe em order_items');
      console.log('📊 Dados encontrados:', orderItemsData);
    }

    // Testar se a coluna selected_size existe em cart_items
    console.log('\n2. Testando coluna selected_size em cart_items...');
    const { data: cartItemsData, error: cartItemsError } = await supabase
      .from('cart_items')
      .select('id, selected_size')
      .limit(5);

    if (cartItemsError) {
      console.error('❌ Erro ao consultar cart_items:', cartItemsError.message);
    } else {
      console.log('✅ Coluna selected_size existe em cart_items');
      console.log('📊 Dados encontrados:', cartItemsData);
    }

    // Testar consulta completa de um pedido
    console.log('\n3. Testando consulta completa de pedido...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_items (
          id,
          product_id,
          selected_size,
          product_snapshot
        )
      `)
      .limit(1);

    if (ordersError) {
      console.error('❌ Erro ao consultar pedidos:', ordersError.message);
    } else {
      console.log('✅ Consulta de pedidos funcionando');
      console.log('📊 Dados do pedido:', JSON.stringify(ordersData, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testMigrations();
