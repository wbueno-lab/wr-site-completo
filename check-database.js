// Script simples para verificar o estado do banco de dados
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Verificando estado do banco de dados...\n');

  try {
    // 1. Verificar se a coluna selected_size existe em order_items
    console.log('1. Verificando coluna selected_size em order_items...');
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select('id, selected_size, product_snapshot')
      .limit(3);

    if (orderError) {
      console.error('❌ Erro ao consultar order_items:', orderError.message);
      if (orderError.message.includes('column "selected_size" does not exist')) {
        console.log('🚨 PROBLEMA ENCONTRADO: Coluna selected_size não existe em order_items!');
        console.log('📋 SOLUÇÃO: Execute a migração no painel do Supabase');
      }
    } else {
      console.log('✅ Coluna selected_size existe em order_items');
      console.log('📊 Dados encontrados:', orderItems);
    }

    // 2. Verificar se a coluna selected_size existe em cart_items
    console.log('\n2. Verificando coluna selected_size em cart_items...');
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, selected_size')
      .limit(3);

    if (cartError) {
      console.error('❌ Erro ao consultar cart_items:', cartError.message);
      if (cartError.message.includes('column "selected_size" does not exist')) {
        console.log('🚨 PROBLEMA ENCONTRADO: Coluna selected_size não existe em cart_items!');
      }
    } else {
      console.log('✅ Coluna selected_size existe em cart_items');
      console.log('📊 Dados encontrados:', cartItems);
    }

    // 3. Verificar estrutura de um pedido completo
    console.log('\n3. Verificando estrutura de pedido...');
    const { data: orders, error: ordersError } = await supabase
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
      if (orders && orders.length > 0) {
        console.log('📊 Exemplo de pedido:', JSON.stringify(orders[0], null, 2));
      } else {
        console.log('📊 Nenhum pedido encontrado');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDatabase();
