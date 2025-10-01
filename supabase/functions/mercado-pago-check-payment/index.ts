// Edge Function para verificar status de pagamento no Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    const { paymentId } = await req.json();

    console.log('🔍 Verificando status do pagamento:', paymentId);

    // Buscar dados do pagamento
    const response = await fetch(`${MERCADO_PAGO_API_URL}/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar pagamento');
    }

    const paymentData = await response.json();

    console.log('✅ Status do pagamento:', {
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: paymentData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao verificar pagamento:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


