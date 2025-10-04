import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    helmet_size?: number;
    helmet_sizes?: number[];
  }>;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  payment_method: string;
  payment_details?: {
    method_name: string;
    processing_fee: number;
    total_with_fee: number;
  };
  shipping_method?: string;
  notes?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const orderData: CreateOrderRequest = await req.json();
    logStep("Order data received", { 
      itemCount: orderData.items.length,
      paymentMethod: orderData.payment_method,
      hasShippingAddress: !!orderData.shipping_address
    });

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("No items provided in order");
    }

    if (!orderData.shipping_address) {
      throw new Error("Shipping address is required");
    }

    if (!orderData.payment_method) {
      throw new Error("Payment method is required");
    }

    // Validate cart items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          original_price,
          image_url,
          description,
          is_new,
          is_promo,
          stock_quantity,
          sku,
          weight,
          material,
          helmet_type,
          available_sizes,
          helmet_numbers,
          color_options,
          warranty_period,
          country_of_origin,
          gallery,
          category_id,
          brand_id,
          categories (
            id,
            name
          ),
          brands (
            id,
            name,
            country_of_origin
          )
        `)
        .eq('id', item.product_id)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        throw new Error(`Product ${item.product_id} not found or inactive`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        selected_size: item.selectedSize || item.selected_size || item.helmet_size || null,
        helmet_size: item.helmet_size || null,
        helmet_sizes: item.helmet_sizes || null,
        product_snapshot: {
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
          description: product.description,
          is_new: product.is_new,
          is_promo: product.is_promo,
          stock_quantity: product.stock_quantity,
          sku: product.sku,
          weight: product.weight,
          material: product.material,
          helmet_type: product.helmet_type,
          available_sizes: product.available_sizes,
          helmet_numbers: product.helmet_numbers,
          color_options: product.color_options,
          warranty_period: product.warranty_period,
          country_of_origin: product.country_of_origin,
          gallery: product.gallery,
          categories: product.categories ? {
            id: product.categories.id,
            name: product.categories.name
          } : null,
          brands: product.brands ? {
            id: product.brands.id,
            name: product.brands.name,
            country_of_origin: product.brands.country_of_origin
          } : null,
          selected_size: item.selectedSize || item.selected_size || item.helmet_size || null
        }
      });
    }

    logStep("Items validated", { totalAmount, itemCount: orderItems.length });

    // Verify that orders table exists and is accessible
    const { data: tableCheck, error: tableError } = await supabaseClient
      .from('orders')
      .select('id')
      .limit(1);
    
    if (tableError) {
      logStep("ERROR: Orders table not accessible", { error: tableError.message });
      throw new Error(`Database error: ${tableError.message}`);
    }

    logStep("Orders table verified", { accessible: true });

    // Get payment method details if payment_method_id is provided
    let paymentMethodId = null;
    if (orderData.payment_method && typeof orderData.payment_method === 'string') {
      const { data: paymentMethod } = await supabaseClient
        .from('payment_methods')
        .select('id')
        .eq('id', orderData.payment_method)
        .single();
      
      if (paymentMethod) {
        paymentMethodId = paymentMethod.id;
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: orderData.payment_details?.total_with_fee || totalAmount,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address || orderData.shipping_address,
        payment_method: orderData.payment_method,
        payment_details: orderData.payment_details,
        shipping_method: orderData.shipping_method || 'standard',
        shipping_cost: 0, // TODO: Calculate shipping cost
        notes: orderData.notes,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);
    
    logStep("Order created", { orderId: order.id, orderNumber: order.order_number });

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: orderItemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (orderItemsError) throw new Error(`Failed to create order items: ${orderItemsError.message}`);

    // Update product stock
    for (const item of orderData.items) {
      // First get current stock
      const { data: productData, error: fetchError } = await supabaseClient
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (fetchError) {
        logStep("Warning: Failed to fetch product stock", { productId: item.product_id, error: fetchError.message });
        continue;
      }

      const newStock = productData.stock_quantity - item.quantity;
      
      const { error: stockError } = await supabaseClient
        .from('products')
        .update({ 
          stock_quantity: newStock
        })
        .eq('id', item.product_id);

      if (stockError) {
        logStep("Warning: Failed to update stock", { productId: item.product_id, error: stockError.message });
      }
    }

    // Clear user's cart
    const { error: clearCartError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (clearCartError) {
      logStep("Warning: Failed to clear cart", { error: clearCartError.message });
    }

    logStep("Order completed successfully", { orderId: order.id });

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logStep("ERROR in create-order", { 
      message: errorMessage, 
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorStack,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});