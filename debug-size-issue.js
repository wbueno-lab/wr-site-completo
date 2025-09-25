// Script para debug direto do problema de tamanhos
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSizeIssue() {
  console.log('🔍 Debug do problema de tamanhos...\n');

  try {
    // 1. Verificar pedidos existentes
    console.log('1. Verificando pedidos existentes...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        order_items (
          id,
          product_id,
          product_snapshot
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (ordersError) {
      console.error('❌ Erro ao buscar pedidos:', ordersError.message);
      return;
    }

    console.log(`✅ Encontrados ${orders.length} pedidos`);

    orders.forEach((order, orderIndex) => {
      console.log(`\n📦 Pedido ${orderIndex + 1}: ${order.order_number} (${order.id})`);
      console.log(`   Data: ${order.created_at}`);
      console.log(`   Itens: ${order.order_items?.length || 0}`);

      if (order.order_items && order.order_items.length > 0) {
        order.order_items.forEach((item, itemIndex) => {
          console.log(`\n   🛍️ Item ${itemIndex + 1}:`);
          console.log(`      ID: ${item.id}`);
          console.log(`      Product ID: ${item.product_id}`);
          console.log(`      Tem snapshot: ${!!item.product_snapshot}`);
          
          if (item.product_snapshot) {
            console.log(`      Tipo do snapshot: ${typeof item.product_snapshot}`);
            
            if (typeof item.product_snapshot === 'object') {
              console.log(`      Chaves do snapshot: ${Object.keys(item.product_snapshot).join(', ')}`);
              console.log(`      selected_size no snapshot: ${item.product_snapshot.selected_size}`);
              console.log(`      Tipo do selected_size: ${typeof item.product_snapshot.selected_size}`);
            } else if (typeof item.product_snapshot === 'string') {
              try {
                const parsed = JSON.parse(item.product_snapshot);
                console.log(`      Snapshot parseado - selected_size: ${parsed.selected_size}`);
                console.log(`      Tipo do selected_size parseado: ${typeof parsed.selected_size}`);
              } catch (e) {
                console.log(`      Erro ao fazer parse: ${e.message}`);
              }
            }
          }
        });
      }
    });

    // 2. Verificar carrinho atual
    console.log('\n2. Verificando carrinho atual...');
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (
          id,
          name,
          price
        )
      `)
      .limit(5);

    if (cartError) {
      console.error('❌ Erro ao buscar carrinho:', cartError.message);
    } else {
      console.log(`✅ Encontrados ${cartItems.length} itens no carrinho`);
      cartItems.forEach((item, index) => {
        console.log(`\n   🛒 Item ${index + 1}:`);
        console.log(`      ID: ${item.id}`);
        console.log(`      Product ID: ${item.product_id}`);
        console.log(`      Quantidade: ${item.quantity}`);
        console.log(`      Produto: ${item.products?.name || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugSizeIssue();
