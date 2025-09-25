import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase, waitForSupabase } from '@/integrations/supabase/client';
import { useAuth } from './UnifiedAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selectedSize?: number;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, selectedSize?: number) => Promise<void>;
  addMultipleToCart: (productId: string, quantity: number, selectedSizes: number[]) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, selectedSize?: number) => Promise<void>;
  removeFromCart: (productId: string, selectedSize?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();


  // Lock para evitar atualizações concorrentes
  const updateLock = useRef(false);

  // Função para buscar selectedSize do localStorage (mantida para compatibilidade)
  const getSelectedSizeFromStorage = (productId: string): number | null => {
    try {
      const stored = localStorage.getItem(`cart_selected_size_${productId}`);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  };

  // Função para gerar chave única baseada em product_id + selectedSize
  const generateCartItemKey = (productId: string, selectedSize?: number): string => {
    const key = `${productId}_${selectedSize || 'no-size'}`;
    console.log('🔍 DEBUG - generateCartItemKey:', {
      productId,
      selectedSize,
      key
    });
    return key;
  };

  // Função para armazenar item com chave única
  const storeCartItem = (productId: string, selectedSize?: number, quantity: number = 1) => {
    const key = generateCartItemKey(productId, selectedSize);
    const itemData = {
      productId,
      selectedSize: selectedSize || null,
      quantity,
      timestamp: Date.now()
    };
    localStorage.setItem(`cart_item_${key}`, JSON.stringify(itemData));
  };

  // Função para buscar item do localStorage
  const getCartItem = (productId: string, selectedSize?: number) => {
    const key = generateCartItemKey(productId, selectedSize);
    try {
      const stored = localStorage.getItem(`cart_item_${key}`);
      const result = stored ? JSON.parse(stored) : null;
      console.log('🔍 DEBUG - getCartItem:', {
        productId,
        selectedSize,
        key,
        stored,
        result
      });
      return result;
    } catch (e) {
      console.log('🔍 DEBUG - getCartItem erro:', e);
      return null;
    }
  };

  // Função para remover item do localStorage
  const removeCartItem = (productId: string, selectedSize?: number) => {
    const key = generateCartItemKey(productId, selectedSize);
    localStorage.removeItem(`cart_item_${key}`);
  };

  // Generate session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
      // Gerar um ID mais simples e seguro
      sessionId = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
      localStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
  };

  // Helper function to normalize size values for comparison
  const normalizeSize = (size: any): number | undefined => {
    if (size === null || size === undefined || size === '') return undefined;
    const num = typeof size === 'string' ? parseInt(size, 10) : size;
    return isNaN(num) ? undefined : num;
  };

  // Load cart items
  const loadCart = async () => {
    setIsLoading(true);
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      let query = supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          selected_size,
          user_id,
          session_id,
          products!inner(
            id,
            name,
            price,
            image_url,
            stock_quantity
          )
        `);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { data, error } = await query;

      console.log('🔍 DEBUG - Dados carregados do banco:', {
        totalItems: data?.length || 0,
        items: data?.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity
        }))
      });

      // Mapear os dados usando selected_size do banco de dados
      const mappedItems = (data || []).map((item, index) => {
        // Usar selected_size diretamente do banco de dados
        const selectedSize = item.selected_size;
        
        console.log('🔍 DEBUG - Item do carrinho carregado:', {
          index,
          productId: item.product_id,
          selectedSize: selectedSize,
          hasSelectedSize: selectedSize !== null,
          hasProduct: !!item.products,
          itemId: item.id,
          quantity: item.quantity
        });
        
        return {
          ...item,
          selectedSize: selectedSize,
          product: item.products
        };
      });

      // Debug: mostrar todos os itens do localStorage
      console.log('🔍 DEBUG - Todos os itens do localStorage:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cart_item_')) {
          try {
            const itemData = JSON.parse(localStorage.getItem(key) || '{}');
            console.log('  - Chave:', key, 'Dados:', itemData);
          } catch (e) {
            console.log('  - Chave:', key, 'Erro ao parsear');
          }
        }
      }

      // Filtrar itens duplicados baseado em product_id + selectedSize
      const uniqueItems = [];
      const seenKeys = new Set();
      
      for (const item of mappedItems) {
        const key = `${item.product_id}_${item.selectedSize || 'no-size'}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueItems.push(item);
        } else {
          // Se já existe item com mesma chave, somar quantidades
          const existingItem = uniqueItems.find(i => 
            i.product_id === item.product_id && 
            i.selectedSize === item.selectedSize
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          }
        }
      }

      // Se ainda temos apenas 1 item mas deveria ter 2, vamos criar itens separados baseado no localStorage
      if (uniqueItems.length === 1 && data && data.length > 1) {
        console.log('🔍 DEBUG - Detectado problema: 1 item único mas múltiplos no banco');
        
        // Buscar todas as numerações diferentes no localStorage
        const allSizes = new Set();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cart_item_')) {
            try {
              const itemData = JSON.parse(localStorage.getItem(key) || '{}');
              if (itemData.productId === data[0].product_id) {
                allSizes.add(itemData.selectedSize);
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
        
        console.log('🔍 DEBUG - Numerações encontradas no localStorage:', Array.from(allSizes));
        
        // Criar itens separados para cada numeração
        const separatedItems = [];
        for (const size of allSizes) {
          const item = { ...data[0] };
          item.selectedSize = size;
          item.id = `${item.id}_${size}`; // ID único para cada numeração
          separatedItems.push(item);
        }
        
        console.log('🔍 DEBUG - Itens separados criados:', separatedItems.length);
        setItems(separatedItems);
        return;
      }

      // SOLUÇÃO RADICAL: Se temos múltiplos itens no banco mas apenas 1 único, vamos forçar separação
      if (data && data.length > 1 && uniqueItems.length === 1) {
        console.log('🔍 DEBUG - SOLUÇÃO RADICAL: Forçando separação de itens');
        
        // Criar itens separados baseado nos dados do banco
        const separatedItems = data.map((item, index) => {
          // Buscar numeração correspondente no localStorage
          let selectedSize = null;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cart_item_')) {
              try {
                const itemData = JSON.parse(localStorage.getItem(key) || '{}');
                if (itemData.productId === item.product_id) {
                  selectedSize = itemData.selectedSize;
                  break;
                }
              } catch (e) {
                // Ignorar erros de parsing
              }
            }
          }
          
          return {
            ...item,
            selectedSize: selectedSize,
            id: `${item.id}_${index}_${selectedSize || 'no-size'}`, // ID único
            product: item.products
          };
        });
        
        console.log('🔍 DEBUG - Itens separados criados (SOLUÇÃO RADICAL):', separatedItems.length);
        setItems(separatedItems);
        return;
      }
      
      console.log('🔍 DEBUG - Itens únicos após filtro:', {
        totalUniqueItems: uniqueItems.length,
        items: uniqueItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          selectedSize: item.selectedSize,
          quantity: item.quantity
        }))
      });
      
      console.log('🔍 DEBUG - Itens mapeados finais:', {
        totalMappedItems: mappedItems.length,
        items: mappedItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          selectedSize: item.selectedSize,
          quantity: item.quantity
        }))
      });
      
      setItems(uniqueItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1, selectedSize?: number) => {
    try {
      console.log('🛒 Adicionando ao carrinho:', { productId, quantity, selectedSize });
      
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      // Verificar se o produto existe primeiro
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('❌ Erro ao verificar produto:', productError);
        throw new Error('Produto não encontrado');
      }

      // Verificar se existe item com mesmo product_id e mesma numeração
      const existingItem = items.find(item => {
        return item.product_id === productId && item.selectedSize === selectedSize;
      });

      if (existingItem) {
        console.log('✅ Item existente com mesma numeração encontrado, atualizando quantidade');
        // Atualizar no banco de dados
        await updateQuantity(productId, existingItem.quantity + quantity, selectedSize);
        return;
      }

      console.log('🔄 Criando novo item - Numeração diferente ou primeiro item');

      // Sempre criar um novo item para cada numeração diferente
      console.log('🔄 Criando novo item no carrinho');
      
      // Verificar estoque disponível
      if (product.stock_quantity < quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.stock_quantity}`);
      }

      // Criar novo item no banco
      const cartData = user 
        ? { 
          user_id: user.id, 
          product_id: productId, 
          quantity,
          selected_size: selectedSize
        }
        : { 
          session_id: getSessionId(), 
          product_id: productId, 
          quantity,
          selected_size: selectedSize
        };
      
      // DEBUG: Mostrar informações do novo item
      console.log('🔍 DEBUG - Criando novo item:', {
        productId,
        selectedSize,
        quantity,
        hasExistingItems: existingItems.length > 0
      });

      console.log('🔍 DEBUG - Dados para inserção no banco:', {
        cartData,
        productId,
        selectedSize,
        quantity,
        willCreateNewRecord: true,
        reason: hasExistingItem ? 'Numeração diferente detectada' : 'Novo item'
      });

      const { data: insertedData, error } = await supabase
        .from('cart_items')
        .insert(cartData)
        .select();

      if (error) {
        console.error('❌ Erro ao inserir item:', error);
        throw error;
      }
      
      console.log('✅ Item inserido com sucesso');
      console.log('🔍 DEBUG - Item inserido no banco:', {
        productId,
        selectedSize,
        quantity,
        insertedData: insertedData?.[0]
      });
      
      // Salvar item no localStorage com chave única
      storeCartItem(productId, selectedSize, quantity);
      console.log('🔍 DEBUG - Item salvo no localStorage:', {
        key: generateCartItemKey(productId, selectedSize),
        data: getCartItem(productId, selectedSize)
      });
      
      await loadCart();
      toast({
        title: "Produto adicionado!",
        description: "Item adicionado ao carrinho com sucesso."
      });
    } catch (error: any) {
      console.error('❌ Erro ao adicionar produto:', error);
      toast({
        title: "Erro ao adicionar produto",
        description: error.message || "Erro desconhecido ao adicionar produto ao carrinho",
        variant: "destructive"
      });
    }
  };

  const addMultipleToCart = async (productId: string, quantity: number, selectedSizes: number[]) => {
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      // Add each item with its specific size, checking for existing items first
      for (let i = 0; i < quantity; i++) {
        const selectedSize = selectedSizes[i];
        
        // Verificar se já existe item com mesmo product_id e selected_size
        let query = supabase
          .from('cart_items')
          .select('*')
          .eq('product_id', productId)
          .eq('selected_size', selectedSize);

        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          query = query.eq('session_id', getSessionId());
        }

        const { data: existingItems, error: queryError } = await query;
        
        if (queryError) {
          console.error('Erro ao verificar itens existentes:', queryError);
          throw queryError;
        }
        
        // Se existe item com mesma numeração, atualizar quantidade
        if (existingItems && existingItems.length > 0) {
          const existingItem = existingItems[0];
          console.log('✅ Item existente com mesma numeração encontrado, atualizando quantidade');
          await updateQuantity(productId, existingItem.quantity + 1, selectedSize);
        } else {
          console.log('🔄 Criando novo item com numeração específica');
          // Criar novo item com numeração específica
          const cartData = user 
            ? { 
              user_id: user.id, 
              product_id: productId, 
              quantity: 1,
              selected_size: selectedSize
            }
            : { 
              session_id: getSessionId(), 
              product_id: productId, 
              quantity: 1,
              selected_size: selectedSize
            };

          const { error } = await supabase
            .from('cart_items')
            .insert(cartData);

          if (error) {
            console.error('Erro ao inserir item no carrinho:', error);
            throw error;
          }
        }
      }
      
      await loadCart();
      toast({
        title: "Produtos adicionados!",
        description: `${quantity} peça(s) adicionada(s) ao carrinho com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao adicionar múltiplos itens ao carrinho:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number, selectedSize?: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, selectedSize);
      return;
    }

    // Verificar se já há uma atualização em andamento
    if (updateLock.current) {
      console.log('🔒 Atualização em andamento, aguardando...');
      return;
    }

    try {
      updateLock.current = true;
      setIsUpdating(true);

      // Aguardar inicialização do Supabase
      await waitForSupabase();

      // Verificar estoque antes de atualizar
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (product.stock_quantity < quantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${product.stock_quantity} unidades disponíveis`,
          variant: "destructive"
        });
        return;
      }

      // Encontrar o item específico com a numeração correta
      const targetItem = items.find(item => {
        return item.product_id === productId && item.selectedSize === selectedSize;
      });

      if (!targetItem) {
        throw new Error('Item não encontrado no carrinho');
      }

      let query = supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', targetItem.id);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { error } = await query;
      if (error) throw error;
      
      await loadCart();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      updateLock.current = false;
      setIsUpdating(false);
    }
  };

  const removeFromCart = async (productId: string, selectedSize?: number) => {
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      // Remover item do localStorage primeiro
      removeCartItem(productId, selectedSize);

      // Encontrar o item específico para remover
      const targetItem = items.find(item => {
        return item.product_id === productId && 
               (selectedSize === undefined || selectedSize === null || item.selectedSize === selectedSize);
      });

      if (!targetItem) {
        console.log('Item não encontrado para remover');
        return;
      }

      // Remover o item específico do banco
      let query = supabase
        .from('cart_items')
        .delete()
        .eq('id', targetItem.id);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { error } = await query;
      if (error) throw error;

      // Remover o item do localStorage
      removeCartItem(productId, selectedSize);
      
      await loadCart();
      toast({
        title: "Produto removido",
        description: "Item removido do carrinho."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      let query = supabase.from('cart_items').delete();

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { error } = await query;
      if (error) throw error;
      
      setItems([]);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    isLoading,
    addToCart,
    addMultipleToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};