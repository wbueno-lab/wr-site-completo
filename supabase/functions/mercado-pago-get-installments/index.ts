// Edge Function para buscar parcelas disponíveis no Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

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
    const { amount, paymentMethodId = 'visa' } = await req.json();

    console.log('🔍 Buscando parcelas:', { amount, paymentMethodId });

    // URL da API de installments do Mercado Pago
    const url = `https://api.mercadopago.com/v1/payment_methods/installments?` +
      `amount=${amount}&` +
      `payment_method_id=${paymentMethodId}&` +
      `locale=pt-BR`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar parcelas');
    }

    const data = await response.json();
    
    // Extrair lista de parcelas
    const installments = data[0]?.payer_costs || [];

    console.log('✅ Parcelas encontradas:', installments.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        installments 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao buscar parcelas:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        installments: []
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


