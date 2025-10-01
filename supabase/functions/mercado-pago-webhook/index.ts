// Edge Function para receber webhooks do Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

serve(async (req) => {
  try {
    console.log('📨 Webhook recebido do Mercado Pago');

    const body = await req.json();
    
    console.log('🔍 Dados do webhook:', JSON.stringify(body, null, 2));

    // Mercado Pago envia notificações de diferentes tipos
    const { type, data } = body;

    // Processar apenas notificações de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      console.log('💳 Processando notificação de pagamento:', paymentId);

      // Buscar dados completos do pagamento
      const paymentResponse = await fetch(`${MERCADO_PAGO_API_URL}/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });

      const paymentData = await paymentResponse.json();

      console.log('📦 Dados do pagamento:', {
        id: paymentData.id,
        status: paymentData.status,
        external_reference: paymentData.external_reference
      });

      // Atualizar pedido no Supabase
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Buscar pedido pela referência externa (Mercado Pago ID)
      const { data: orders, error: searchError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('payment_details->>mercado_pago_id', paymentData.id.toString())
        .limit(1);

      if (searchError) {
        console.error('❌ Erro ao buscar pedido:', searchError);
        throw searchError;
      }

      if (!orders || orders.length === 0) {
        console.warn('⚠️ Pedido não encontrado para o pagamento:', paymentData.id);
        
        // Retornar 200 para o Mercado Pago não reenviar
        return new Response(
          JSON.stringify({ received: true, warning: 'Order not found' }),
          { status: 200 }
        );
      }

      const order = orders[0];

      // Mapear status do Mercado Pago para status interno
      let orderStatus = order.status;
      let paymentStatus = order.payment_status;

      switch (paymentData.status) {
        case 'approved':
          orderStatus = 'processing';
          paymentStatus = 'paid';
          break;
        case 'rejected':
        case 'cancelled':
          orderStatus = 'cancelled';
          paymentStatus = 'failed';
          break;
        case 'refunded':
        case 'charged_back':
          orderStatus = 'cancelled';
          paymentStatus = 'refunded';
          break;
        case 'pending':
        case 'in_process':
        case 'in_mediation':
        default:
          orderStatus = 'pending';
          paymentStatus = 'pending';
      }

      // Atualizar pedido
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          payment_details: {
            ...order.payment_details,
            mercado_pago_id: paymentData.id,
            status: paymentData.status,
            status_detail: paymentData.status_detail,
            last_update: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar pedido:', updateError);
        throw updateError;
      }

      console.log('✅ Pedido atualizado:', {
        order_id: order.id,
        status: orderStatus,
        payment_status: paymentStatus
      });

      // TODO: Enviar email de notificação ao cliente
      // TODO: Atualizar estoque se o pagamento foi aprovado

      return new Response(
        JSON.stringify({ 
          received: true, 
          order_id: order.id,
          status: orderStatus 
        }),
        { status: 200 }
      );
    }

    // Outros tipos de notificação
    console.log('ℹ️ Tipo de notificação não processado:', type);
    
    return new Response(
      JSON.stringify({ received: true, type }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Retornar 200 mesmo em caso de erro para o Mercado Pago não reenviar indefinidamente
    return new Response(
      JSON.stringify({ 
        received: true, 
        error: error.message 
      }),
      { status: 200 }
    );
  }
});


