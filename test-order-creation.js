// Script para testar criação de pedido e verificar dados
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderCreation() {
  console.log('🔍 Testando criação de pedido com tamanho...\n');

  try {
    // 1. Verificar se há produtos disponíveis
    console.log('1. Verificando produtos disponíveis...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, helmet_numbers')
      .limit(3);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
      return;
    }

    if (!products || products.length === 0) {
      console.log('❌ Nenhum produto encontrado');
      return;
    }

    console.log('✅ Produtos encontrados:', products.length);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - R$ ${product.price}`);
      console.log(`      Tamanhos disponíveis: ${product.helmet_numbers || 'Nenhum'}`);
    });

    // 2. Criar um pedido de teste com tamanho
    console.log('\n2. Criando pedido de teste...');
    const testProduct = products[0];
    const testSize = 55; // Tamanho de teste

    const orderData = {
      user_id: 'test-user-' + Date.now(),
      order_number: 'TEST-' + Date.now(),
      status: 'pending',
      total_amount: testProduct.price,
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erro ao criar pedido:', orderError.message);
      return;
    }

    console.log('✅ Pedido criado:', order.id);

    // 3. Criar item do pedido com tamanho
    console.log('\n3. Criando item do pedido com tamanho...');
    const productSnapshot = {
      id: testProduct.id,
      name: testProduct.name,
      price: testProduct.price,
      selected_size: testSize
    };

    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: testProduct.id,
        quantity: 1,
        unit_price: testProduct.price,
        total_price: testProduct.price,
        product_snapshot: productSnapshot
      })
      .select()
      .single();

    if (itemError) {
      console.error('❌ Erro ao criar item do pedido:', itemError.message);
      return;
    }

    console.log('✅ Item do pedido criado:', orderItem.id);
    console.log('📊 Product Snapshot:', JSON.stringify(orderItem.product_snapshot, null, 2));

    // 4. Verificar se conseguimos recuperar o pedido
    console.log('\n4. Verificando recuperação do pedido...');
    const { data: retrievedOrder, error: retrieveError } = await supabase
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
      .eq('id', order.id)
      .single();

    if (retrieveError) {
      console.error('❌ Erro ao recuperar pedido:', retrieveError.message);
    } else {
      console.log('✅ Pedido recuperado com sucesso');
      if (retrievedOrder.order_items && retrievedOrder.order_items.length > 0) {
        const item = retrievedOrder.order_items[0];
        console.log('📦 Item recuperado:', {
          product_id: item.product_id,
          has_snapshot: !!item.product_snapshot,
          snapshot_type: typeof item.product_snapshot,
          selected_size: item.product_snapshot?.selected_size
        });
      }
    }

    // 5. Limpar dados de teste
    console.log('\n5. Limpando dados de teste...');
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('🧹 Dados de teste removidos');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testOrderCreation();
