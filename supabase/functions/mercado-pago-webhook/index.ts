import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface para dados do pagamento
interface PaymentData {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
  payment_method_id: string;
  payment_type_id: string;
  date_approved?: string;
  date_created: string;
  date_last_updated: string;
  external_reference?: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
    phone: {
      area_code: string;
      number: string;
    };
    first_name: string;
    last_name: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const body = await req.json()
    
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    // Extract payment information from webhook
    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id
      
      // Fetch payment details from Mercado Pago
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
      if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured')
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment details: ${paymentResponse.statusText}`)
      }

      const payment: PaymentData = await paymentResponse.json()
      
      console.log('Payment details:', JSON.stringify(payment, null, 2))

      // Update order status based on payment status
      const orderStatus = mapPaymentStatusToOrderStatus(payment.status)
      
      // Buscar o pedido pelo external_reference (ID do pedido)
      const orderId = payment.external_reference
      if (!orderId) {
        throw new Error('External reference not found in payment data')
      }

      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ 
          status: orderStatus,
          payment_status: payment.status,
          payment_details: payment,
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order:', updateError)
        throw new Error(`Failed to update order: ${updateError.message}`)
      }

      // If payment is approved, clear the cart and send notification
      if (payment.status === 'approved') {
        // Get the order to find the user
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .select('user_id, customer_email, customer_name, total_amount')
          .eq('id', orderId)
          .single()

        if (!orderError && order?.user_id) {
          // Clear user's cart
          await supabaseClient
            .from('cart_items')
            .delete()
            .eq('user_id', order.user_id)

          // Send notification to user
          await sendPaymentNotification(order, payment)
        }

        // Send notification to admin about new paid order
        await sendAdminNotification(order, payment)
      }

      console.log(`Order updated successfully. Payment ID: ${paymentId}, Order ID: ${orderId}, Status: ${orderStatus}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Função para enviar notificação de pagamento
async function sendPaymentNotification(order: any, payment: PaymentData) {
  try {
    // Aqui você pode implementar envio de email, push notification, etc.
    console.log(`Payment approved for order ${order.id}. Customer: ${order.customer_name} (${order.customer_email}). Amount: R$ ${order.total_amount}`)
    
    // Exemplo: Salvar notificação no banco
    // await supabaseClient
    //   .from('notifications')
    //   .insert({
    //     user_id: order.user_id,
    //     type: 'payment_approved',
    //     title: 'Pagamento Aprovado!',
    //     message: `Seu pagamento de R$ ${order.total_amount} foi aprovado.`,
    //     data: { order_id: order.id, payment_id: payment.id }
    //   })
  } catch (error) {
    console.error('Error sending payment notification:', error)
  }
}

// Função para enviar notificação para o admin
async function sendAdminNotification(order: any, payment: PaymentData) {
  try {
    console.log(`NEW PAID ORDER: #${order.id} - Customer: ${order.customer_name} (${order.customer_email}) - Amount: R$ ${order.total_amount} - Payment ID: ${payment.id}`)
    
    // Aqui você pode implementar notificação para o admin via email, webhook, etc.
    // Exemplo: Enviar email para o admin
    // await sendAdminEmail({
    //   subject: `Novo Pedido Pago - #${order.id}`,
    //   body: `Cliente: ${order.customer_name}\nEmail: ${order.customer_email}\nValor: R$ ${order.total_amount}\nMétodo: ${payment.payment_method_id}`
    // })
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}

function mapPaymentStatusToOrderStatus(paymentStatus: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'approved': 'approved',
    'authorized': 'approved',
    'in_process': 'processing',
    'in_mediation': 'processing',
    'rejected': 'rejected',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'charged_back'
  }

  return statusMap[paymentStatus] || 'pending'
}

