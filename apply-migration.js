// Script para aplicar a migração diretamente
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔧 Aplicando migração para adicionar selected_size...\n');

  try {
    // 1. Verificar se as colunas já existem
    console.log('1. Verificando colunas existentes...');
    
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select('selected_size')
      .limit(1);

    if (orderError && orderError.message.includes('column "selected_size" does not exist')) {
      console.log('❌ Coluna selected_size não existe em order_items');
      console.log('📋 Execute a migração no painel do Supabase:');
      console.log('');
      console.log('-- Adicionar coluna selected_size em order_items');
      console.log('ALTER TABLE public.order_items ADD COLUMN selected_size INTEGER;');
      console.log('');
      console.log('-- Adicionar coluna selected_size em cart_items');
      console.log('ALTER TABLE public.cart_items ADD COLUMN selected_size INTEGER;');
      console.log('');
      console.log('-- Adicionar comentários');
      console.log('COMMENT ON COLUMN public.order_items.selected_size IS \'The selected size/number for the helmet when ordered\';');
      console.log('COMMENT ON COLUMN public.cart_items.selected_size IS \'The selected size/number for the helmet in the cart\';');
      console.log('');
      console.log('-- Criar índices');
      console.log('CREATE INDEX IF NOT EXISTS idx_order_items_selected_size ON public.order_items(selected_size);');
      console.log('CREATE INDEX IF NOT EXISTS idx_cart_items_selected_size ON public.cart_items(selected_size);');
      console.log('');
      console.log('-- Atualizar dados existentes');
      console.log('UPDATE public.order_items SET selected_size = (product_snapshot->>\'selected_size\')::INTEGER WHERE product_snapshot->>\'selected_size\' IS NOT NULL;');
      
    } else if (orderError) {
      console.error('❌ Erro ao verificar order_items:', orderError.message);
    } else {
      console.log('✅ Coluna selected_size já existe em order_items');
    }

    // 2. Verificar cart_items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('selected_size')
      .limit(1);

    if (cartError && cartError.message.includes('column "selected_size" does not exist')) {
      console.log('❌ Coluna selected_size não existe em cart_items');
    } else if (cartError) {
      console.error('❌ Erro ao verificar cart_items:', cartError.message);
    } else {
      console.log('✅ Coluna selected_size já existe em cart_items');
    }

    // 3. Testar consulta completa
    console.log('\n2. Testando consulta completa...');
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
              selected_size: item.selected_size,
              has_snapshot: !!item.product_snapshot,
              snapshot_selected_size: item.product_snapshot?.selected_size
            });
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyMigration();
