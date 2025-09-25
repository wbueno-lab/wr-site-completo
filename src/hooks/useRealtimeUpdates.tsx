import { useEffect, useRef } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useToast } from '@/components/ui/use-toast';

export const useRealtimeUpdates = () => {
  const { products, orders, categories } = useRealtime();
  const { toast } = useToast();
  const previousDataRef = useRef({
    products: [] as any[],
    orders: [] as any[],
    categories: [] as any[]
  });

  useEffect(() => {
    const previousData = previousDataRef.current;
    
    // Check for new products
    if (products.length > previousData.products.length) {
      const newProducts = products.filter(
        product => !previousData.products.some(p => p.id === product.id)
      );
      
      if (newProducts.length > 0) {
        toast({
          title: "Novos produtos disponíveis!",
          description: `${newProducts.length} novo(s) produto(s) foi(ram) adicionado(s) ao catálogo.`,
        });
      }
    }

    // Check for updated products
    if (products.length === previousData.products.length) {
      const updatedProducts = products.filter(product => {
        const previousProduct = previousData.products.find(p => p.id === product.id);
        if (!previousProduct) return false;
        
        return (
          product.name !== previousProduct.name ||
          product.price !== previousProduct.price ||
          product.is_active !== previousProduct.is_active ||
          product.is_new !== previousProduct.is_new ||
          product.is_promo !== previousProduct.is_promo
        );
      });

      if (updatedProducts.length > 0) {
        toast({
          title: "Produtos atualizados!",
          description: `${updatedProducts.length} produto(s) foi(ram) atualizado(s).`,
        });
      }
    }

    // Check for new orders
    if (orders.length > previousData.orders.length) {
      const newOrders = orders.filter(
        order => !previousData.orders.some(o => o.id === order.id)
      );
      
      if (newOrders.length > 0) {
        toast({
          title: "Novos pedidos recebidos!",
          description: `${newOrders.length} novo(s) pedido(s) foi(ram) realizado(s).`,
        });
      }
    }

    // Check for updated orders
    if (orders.length === previousData.orders.length) {
      const updatedOrders = orders.filter(order => {
        const previousOrder = previousData.orders.find(o => o.id === order.id);
        if (!previousOrder) return false;
        
        return (
          order.status !== previousOrder.status ||
          order.payment_status !== previousOrder.payment_status
        );
      });

      if (updatedOrders.length > 0) {
        toast({
          title: "Pedidos atualizados!",
          description: `${updatedOrders.length} pedido(s) foi(ram) atualizado(s).`,
        });
      }
    }

    // Check for new categories
    if (categories.length > previousData.categories.length) {
      const newCategories = categories.filter(
        category => !previousData.categories.some(c => c.id === category.id)
      );
      
      if (newCategories.length > 0) {
        toast({
          title: "Novas categorias adicionadas!",
          description: `${newCategories.length} nova(s) categoria(s) foi(ram) adicionada(s).`,
        });
      }
    }

    // Update the reference data
    previousDataRef.current = {
      products: [...products],
      orders: [...orders],
      categories: [...categories]
    };
  }, [products, orders, categories, toast]);

  return {
    products,
    orders,
    categories
  };
};




































