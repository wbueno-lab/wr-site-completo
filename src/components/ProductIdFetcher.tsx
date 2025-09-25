import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  is_active: boolean;
}

const ProductIdFetcher = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🔄 Buscando produtos no banco de dados...');
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, is_active')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        addLog(`❌ Erro ao buscar produtos: ${error.message}`);
        addLog(`❌ Código do erro: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details}`);
      } else {
        addLog(`✅ Produtos encontrados: ${data?.length || 0}`);
        setProducts(data || []);
        
        if (data && data.length > 0) {
          addLog('📋 Lista de produtos:');
          data.forEach((product, index) => {
            addLog(`  ${index + 1}. ${product.name} (ID: ${product.id}) - R$ ${product.price}`);
          });
        } else {
          addLog('⚠️ Nenhum produto ativo encontrado');
        }
      }
    } catch (error) {
      addLog(`❌ Erro inesperado: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testProductNavigation = (productId: string, productName: string) => {
    addLog(`🧪 Testando navegação para: ${productName}`);
    addLog(`📍 ID do produto: ${productId}`);
    
    // Simular navegação
    const url = `/produto/${productId}`;
    addLog(`🌐 URL de destino: ${url}`);
    
    // Usar window.location para navegar
    try {
      window.location.href = url;
      addLog('✅ Navegação iniciada');
    } catch (error) {
      addLog(`❌ Erro na navegação: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    // Buscar produtos automaticamente quando o componente carrega
    fetchProducts();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛍️ Produtos Disponíveis
          <Badge variant="secondary">
            {products.length} encontrados
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button 
            onClick={fetchProducts} 
            disabled={loading}
            variant="default"
            size="sm"
          >
            {loading ? 'Buscando...' : 'Buscar Produtos'}
          </Button>
          <Button onClick={clearLogs} variant="ghost" size="sm">
            Limpar Logs
          </Button>
        </div>

        {/* Lista de Produtos */}
        {products.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Produtos para Teste:</h4>
            {products.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <h5 className="font-medium">{product.name}</h5>
                  <p className="text-sm text-gray-600">
                    ID: {product.id} | SKU: {product.sku || 'N/A'} | R$ {product.price.toFixed(2)}
                  </p>
                </div>
                <Button
                  onClick={() => testProductNavigation(product.id, product.name)}
                  variant="outline"
                  size="sm"
                >
                  Testar Navegação
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
          <div className="font-bold mb-2 text-white">Logs:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">Clique em "Buscar Produtos" para ver os logs</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 break-all">{log}</div>
            ))
          )}
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Como usar:</h4>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Clique em "Buscar Produtos" para obter a lista de produtos do banco</li>
            <li>Clique em "Testar Navegação" em qualquer produto para navegar para sua página</li>
            <li>Verifique se a página do produto carrega corretamente</li>
            <li>Observe os logs para identificar possíveis problemas</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductIdFetcher;
