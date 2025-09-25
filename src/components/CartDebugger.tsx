import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';

const CartDebugger = () => {
  const { items, addToCart, loadCart, getCartCount, getCartTotal } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testAddToCart = async () => {
    setIsLoading(true);
    try {
      // Buscar um produto para testar
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(1);

      if (error) throw error;
      if (!products || products.length === 0) {
        throw new Error('Nenhum produto encontrado para teste');
      }

      const product = products[0];
      console.log('🧪 TESTANDO ADIÇÃO AO CARRINHO:', product);
      
      await addToCart(product.id, 1);
      console.log('✅ TESTE CONCLUÍDO');
    } catch (error) {
      console.error('❌ ERRO NO TESTE:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDebugInfo = async () => {
    setIsLoading(true);
    try {
      // Verificar estrutura da tabela cart_items
      const { data: tableInfo, error: tableError } = await supabase
        .from('cart_items')
        .select('*')
        .limit(1);

      // Verificar políticas RLS
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_table_policies', { table_name: 'cart_items' })
        .catch(() => ({ data: null, error: 'Função não disponível' }));

      // Verificar constraints
      const { data: constraints, error: constraintsError } = await supabase
        .rpc('get_table_constraints', { table_name: 'cart_items' })
        .catch(() => ({ data: null, error: 'Função não disponível' }));

      setDebugInfo({
        tableInfo,
        tableError,
        policies,
        policiesError,
        constraints,
        constraintsError,
        currentUser: user,
        sessionId: localStorage.getItem('guest_session_id'),
        cartItems: items,
        cartCount: getCartCount(),
        cartTotal: getCartTotal()
      });
    } catch (error) {
      console.error('Erro ao obter informações de debug:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
      await loadCart();
      console.log('✅ CARRINHO LIMPO');
    } catch (error) {
      console.error('❌ ERRO AO LIMPAR CARRINHO:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Debug do Carrinho</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={testAddToCart} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Testando...' : 'Testar Adicionar ao Carrinho'}
          </Button>
          
          <Button 
            onClick={getDebugInfo} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Carregando...' : 'Obter Info de Debug'}
          </Button>
          
          <Button 
            onClick={clearCart} 
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? 'Limpando...' : 'Limpar Carrinho'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Estado Atual do Carrinho:</h3>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Usuário:</strong> {user ? `${user.email} (${user.id})` : 'Convidado'}</p>
              <p><strong>Session ID:</strong> {localStorage.getItem('guest_session_id') || 'N/A'}</p>
              <p><strong>Itens no carrinho:</strong> {getCartCount()}</p>
              <p><strong>Total:</strong> R$ {getCartTotal().toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Itens do Carrinho:</h3>
            <div className="bg-gray-100 p-3 rounded text-sm max-h-40 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-gray-500">Carrinho vazio</p>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
                    <p><strong>Produto:</strong> {item.product?.name || 'N/A'}</p>
                    <p><strong>Quantidade:</strong> {item.quantity}</p>
                    <p><strong>Tamanho:</strong> {item.selectedSize || 'N/A'}</p>
                    <p><strong>Preço:</strong> R$ {item.product?.price || 0}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {debugInfo && (
          <div>
            <h3 className="font-semibold mb-2">Informações de Debug:</h3>
            <div className="bg-gray-100 p-3 rounded text-sm max-h-60 overflow-y-auto">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartDebugger;
