import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  type: 'order_confirmation' | 'order_update' | 'welcome';
  data: any;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const notificationData: NotificationRequest = await req.json();
    logStep("Notification data received", { type: notificationData.type, email: notificationData.email });

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll just log the notification
    
    let emailContent = '';
    let subject = '';

    switch (notificationData.type) {
      case 'order_confirmation':
        subject = `Pedido Confirmado #${notificationData.data.order_number}`;
        emailContent = `
          <h1>Obrigado pelo seu pedido!</h1>
          <p>Seu pedido #${notificationData.data.order_number} foi confirmado.</p>
          <p>Total: R$ ${notificationData.data.total_amount.toFixed(2)}</p>
          <p>Status: ${notificationData.data.status}</p>
        `;
        break;
      
      case 'order_update':
        subject = `Atualização do Pedido #${notificationData.data.order_number}`;
        emailContent = `
          <h1>Status do pedido atualizado</h1>
          <p>Seu pedido #${notificationData.data.order_number} foi atualizado.</p>
          <p>Novo status: ${notificationData.data.status}</p>
        `;
        break;
      
      case 'welcome':
        subject = 'Bem-vindo à WR Capacetes!';
        emailContent = `
          <h1>Bem-vindo!</h1>
          <p>Obrigado por se cadastrar na WR Capacetes.</p>
          <p>Explore nossos produtos e encontre o capacete perfeito para você!</p>
        `;
        break;
      
      default:
        throw new Error(`Unknown notification type: ${notificationData.type}`);
    }

    logStep("Email prepared", { subject, type: notificationData.type });

    // TODO: Implement actual email sending with your preferred service
    // Example with Resend:
    /*
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const emailResponse = await resend.emails.send({
      from: "WR Capacetes <orders@wrcapacetes.com>",
      to: [notificationData.email],
      subject: subject,
      html: emailContent,
    });
    */

    logStep("Notification processed successfully", { email: notificationData.email });

    return new Response(JSON.stringify({
      success: true,
      message: "Notification sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-notification", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});