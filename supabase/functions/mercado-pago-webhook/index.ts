// Edge Function para receber webhooks do Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

// Função auxiliar para processar pagamento em background
async function processPayment(paymentId: string) {
  try {
    console.log('💳 Processando pagamento:', paymentId);

    // Buscar dados completos do pagamento com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const paymentResponse = await fetch(`${MERCADO_PAGO_API_URL}/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!paymentResponse.ok) {
      console.error('❌ Erro ao buscar pagamento:', paymentResponse.status);
      return;
    }

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
      return;
    }

    if (!orders || orders.length === 0) {
      console.warn('⚠️ Pedido não encontrado para o pagamento:', paymentData.id);
      return;
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
      return;
    }

    console.log('✅ Pedido atualizado:', {
      order_id: order.id,
      status: orderStatus,
      payment_status: paymentStatus
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento:', error);
  }
}

serve(async (req) => {
  try {
    console.log('📨 Webhook recebido do Mercado Pago');

    const body = await req.json();
    
    console.log('🔍 Dados do webhook:', JSON.stringify(body, null, 2));

    // Mercado Pago envia notificações de diferentes tipos
    const { type, data } = body;

    // IMPORTANTE: Responder imediatamente ao Mercado Pago
    // O processamento acontecerá em segundo plano
    if (type === 'payment' && data?.id) {
      const paymentId = data.id;
      
      // Processar pagamento em background (não bloqueia a resposta)
      processPayment(paymentId).catch(error => {
        console.error('❌ Erro no processamento background:', error);
      });

      // Responder IMEDIATAMENTE para o Mercado Pago
      return new Response(
        JSON.stringify({ 
          received: true,
          payment_id: paymentId 
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Outros tipos de notificação
    console.log('ℹ️ Tipo de notificação não processado:', type);
    
    return new Response(
      JSON.stringify({ received: true, type }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Retornar 200 mesmo em caso de erro para o Mercado Pago não reenviar indefinidamente
    return new Response(
      JSON.stringify({ 
        received: true, 
        error: error.message 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
});


