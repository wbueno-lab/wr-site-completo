import { supabase } from '@/integrations/supabase/client';
import { mercadoPagoClient } from '@/integrations/mercado-pago/client-fetch';
import { PaymentResult, MercadoPagoPreference } from '@/integrations/mercado-pago/types';
import { useAuth } from '@/contexts/AuthContext';

export interface OrderData {
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    product_name?: string;
    selectedSize?: number;
    helmet_sizes?: number[];
  }>;
  total_amount: number;
  payment_method: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'bank_transfer';
  enabled: boolean;
  processing_fee_percentage: number;
  min_amount: number;
  max_amount?: number;
}

class PaymentService {
  // Buscar métodos de pagamento disponíveis
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      // Retornar métodos de pagamento padrão já que a tabela não existe
      return [
        {
          id: 'credit_card',
          name: 'Cartão de Crédito',
          type: 'credit_card' as const,
          enabled: true,
          processing_fee_percentage: 3.5,
          min_amount: 10,
          max_amount: 10000
        },
        {
          id: 'pix',
          name: 'PIX',
          type: 'pix' as const,
          enabled: true,
          processing_fee_percentage: 0,
          min_amount: 1,
          max_amount: 50000
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return [];
    }
  }

  // Mapear nome do método para tipo do Mercado Pago
  private mapPaymentType(methodName: string): PaymentMethod['type'] {
    const name = methodName.toLowerCase();
    
    if (name.includes('crédito') || name.includes('credit')) {
      return 'credit_card';
    } else if (name.includes('débito') || name.includes('debit')) {
      return 'debit_card';
    } else if (name.includes('pix')) {
      return 'pix';
    } else if (name.includes('boleto')) {
      return 'boleto';
    } else if (name.includes('transferência') || name.includes('bank')) {
      return 'bank_transfer';
    }
    
    return 'credit_card'; // default
  }

  // Criar pedido e processar pagamento
  async processPayment(orderData: OrderData): Promise<PaymentResult> {
    try {
      // Debug simplificado
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 PaymentService processando:', {
          itemsCount: orderData.items.length,
          itemsWithSize: orderData.items.filter(item => item.selectedSize !== undefined).length
        });
      }
      
      // 1. Criar pedido no banco de dados
      const order = await this.createOrder(orderData);
      
      // 2. Criar preferência no Mercado Pago
      const preference = await this.createMercadoPagoPreference(order, orderData);
      
      if (!preference.success) {
        return preference;
      }

      // 3. Atualizar pedido com ID da preferência
      await this.updateOrderWithPaymentId(order.id, preference.paymentId!);

      return {
        success: true,
        paymentId: preference.paymentId,
        redirectUrl: preference.redirectUrl,
        message: 'Pagamento processado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      return {
        success: false,
        message: error.message || 'Erro ao processar pagamento'
      };
    }
  }

  // Criar pedido no banco de dados
  private async createOrder(orderData: OrderData) {
    // Debug simplificado
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 createOrder processando:', {
        itemsCount: orderData.items.length,
        itemsWithSize: orderData.items.filter(item => item.selectedSize !== undefined).length
      });
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        status: 'pending',
        shipping_address: orderData.shipping_address,
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      })
      .select()
      .single();

    if (error) throw error;

    // Criar itens do pedido com product_snapshot completo
    const orderItems = [];
    
    for (const item of orderData.items) {
      // Buscar dados completos do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*, categories(*), brands(*)')
        .eq('id', item.product_id)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        console.error(`Produto ${item.product_id} não encontrado:`, productError);
        continue; // Pular item se produto não for encontrado
      }

      // Debug simplificado
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Criando item:', {
          productId: item.product_id,
          selectedSize: item.selectedSize
        });
      }

      // Preparar dados do item COM selected_size
      const orderItemData = {
        order_id: data.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        selected_size: item.selectedSize,
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
            helmet_numbers: [],
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
            // Armazenar selectedSize como string no product_snapshot para evitar problemas de tipo
            selected_size: item.selectedSize ? item.selectedSize.toString() : null
        }
      };
      
      orderItems.push(orderItemData);

    }

    // Usar dados diretamente sem limpeza complexa
    const cleanedOrderItems = orderItems;

    // Debug: Verificar dados antes de inserir
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG - Dados sendo inseridos em order_items:', JSON.stringify(cleanedOrderItems, null, 2));
    }

    // Inserção simples sem selected_size
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(cleanedOrderItems);

    if (itemsError) {
      console.error('❌ Erro ao inserir order_items:', itemsError);
      console.error('❌ Dados que causaram erro:', JSON.stringify(cleanedOrderItems, null, 2));
      throw itemsError;
    }

    return data;
  }

  // Criar preferência no Mercado Pago
  private async createMercadoPagoPreference(order: any, orderData: OrderData): Promise<PaymentResult> {
    const items = orderData.items.map(item => ({
      id: item.product_id,
      title: item.product_name || `Capacete ${item.product_id}`,
      description: item.product_name || `Capacete de qualidade profissional`,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'BRL'
    }));

    const preference: MercadoPagoPreference = {
      items,
      payer: mercadoPagoClient.createPayer(
        orderData.customer_email,
        orderData.customer_name,
        orderData.customer_phone
      ),
      external_reference: order.id,
      notification_url: `${window.location.origin}/api/webhooks/mercado-pago`
    };

    return await mercadoPagoClient.createPreference(preference);
  }

  // Atualizar pedido com ID do pagamento
  private async updateOrderWithPaymentId(orderId: string, paymentId: string) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  // Verificar status do pagamento
  async checkPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const result = await mercadoPagoClient.checkPaymentStatus(paymentId);
      
      if (result.success) {
        // Atualizar status do pedido no banco
        await this.updateOrderStatus(paymentId, 'approved');
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao verificar status do pagamento'
      };
    }
  }

  // Atualizar status do pedido
  private async updateOrderStatus(paymentId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    if (error) throw error;
  }

  // Buscar pedido por ID
  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items!inner (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          selected_size,
          product_snapshot,
          product:products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar pedidos do usuário
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items!inner (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          selected_size,
          product_snapshot,
          product:products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const paymentService = new PaymentService();

