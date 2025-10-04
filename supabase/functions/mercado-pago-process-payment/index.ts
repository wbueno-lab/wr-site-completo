// Edge Function para processar pagamentos do Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar token
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    const { paymentData, orderData, paymentType } = await req.json();

    console.log('🔍 Processando pagamento:', { 
      paymentType, 
      amount: paymentData.transaction_amount,
      paymentMethodId: paymentData.payment_method_id,
      hasEmail: !!paymentData.payer?.email
    });

    // Fazer requisição para API do Mercado Pago
    const response = await fetch(MERCADO_PAGO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();

    console.log('📥 Resposta da API Mercado Pago:', {
      status: response.status,
      ok: response.ok,
      data: JSON.stringify(responseData, null, 2)
    });

    if (!response.ok) {
      console.error('❌ Erro na API do Mercado Pago (Status:', response.status, ')');
      console.error('❌ Detalhes do erro:', JSON.stringify(responseData, null, 2));
      
      // Extrair mensagens de erro mais específicas
      let errorMessage = 'Erro ao processar pagamento';
      
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.cause && responseData.cause.length > 0) {
        errorMessage = responseData.cause.map((c: any) => c.description).join(', ');
      } else if (responseData.error) {
        errorMessage = responseData.error;
      }
      
      // Retornar erro detalhado
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: responseData,
          status: response.status
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Pagamento processado:', {
      id: responseData.id,
      status: responseData.status
    });

    // Criar pedido no Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        shipping_cost: orderData.shipping_cost || 0,
        shipping_service: orderData.shipping_service,
        payment_method: paymentType || 'credit_card',
        payment_details: {
          mercado_pago_id: responseData.id,
          payment_type: paymentType,
          status: responseData.status,
          status_detail: responseData.status_detail
        },
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address || orderData.shipping_address,
        status: responseData.status === 'approved' ? 'processing' : 'pending',
        payment_status: responseData.status === 'approved' ? 'paid' : 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erro ao criar pedido:', orderError);
    } else {
      console.log('✅ Pedido criado:', order.id);

      // Criar itens do pedido
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map((item: any) => {
          const unitPrice = item.price || item.unit_price || 0;
          return {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: unitPrice * item.quantity,
            selected_size: item.selectedSize || item.selected_size || item.helmet_size || null,
            // Usar o product_snapshot completo que vem do frontend (já inclui image_url)
            product_snapshot: item.product_snapshot ? {
              ...item.product_snapshot,
              selected_size: item.selectedSize || item.selected_size || item.helmet_size || null
            } : {
              name: item.product_name,
              price: unitPrice,
              image_url: null
            }
          };
        });

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItems);
          
        if (itemsError) {
          console.error('❌ Erro ao criar order_items:', itemsError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: responseData,
        order: order 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno ao processar pagamento'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


