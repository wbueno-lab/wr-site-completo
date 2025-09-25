import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DatabaseDirectTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testRawQuery = async () => {
    setIsLoading(true);
    addLog('🧪 Testando query RAW no banco...');
    
    try {
      // Query mais simples possível
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (error) {
        addLog(`❌ Erro na query RAW: ${error.message}`);
        addLog(`❌ Código: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details}`);
        addLog(`❌ Hint: ${error.hint}`);
      } else {
        addLog(`✅ Query RAW executada com sucesso`);
        addLog(`📊 Produtos encontrados: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          addLog('📋 Produtos retornados:');
          data.forEach((product, index) => {
            addLog(`  ${index + 1}. ${product.name} - ID: ${product.id} - Preço: R$ ${product.price}`);
          });
        } else {
          addLog('⚠️ Nenhum produto retornado - tabela pode estar vazia');
        }
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na query RAW: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCountQuery = async () => {
    setIsLoading(true);
    addLog('🧪 Testando contagem de produtos...');
    
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        addLog(`❌ Erro na contagem: ${error.message}`);
      } else {
        addLog(`✅ Contagem executada: ${count} produtos na tabela`);
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na contagem: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInsertProduct = async () => {
    setIsLoading(true);
    addLog('🧪 Testando inserção de produto de teste...');
    
    try {
      const testProduct = {
        name: 'Produto Teste ' + Date.now(),
        price: 99.90,
        description: 'Produto criado para teste',
        is_active: true,
        sku: 'TEST-' + Date.now()
      };

      const { data, error } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();

      if (error) {
        addLog(`❌ Erro ao inserir produto: ${error.message}`);
        addLog(`❌ Código: ${error.code}`);
      } else {
        addLog(`✅ Produto inserido com sucesso: ${data.name}`);
        addLog(`📊 ID do produto: ${data.id}`);
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na inserção: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCategoriesQuery = async () => {
    setIsLoading(true);
    addLog('🧪 Testando query de categorias...');
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(5);

      if (error) {
        addLog(`❌ Erro na query de categorias: ${error.message}`);
      } else {
        addLog(`✅ Categorias encontradas: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          addLog('📋 Categorias:');
          data.forEach((category, index) => {
            addLog(`  ${index + 1}. ${category.name} (${category.slug})`);
          });
        }
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na query de categorias: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    addLog('🧪 Testando fetch direto para API...');
    
    try {
      const response = await fetch('https://fflomlvtgaqbzrjnvqaz.supabase.co/rest/v1/products?select=*&limit=5', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Fetch direto executado com sucesso`);
        addLog(`📊 Produtos retornados: ${data.length}`);
        
        if (data.length > 0) {
          addLog('📋 Primeiro produto:');
          addLog(`  Nome: ${data[0].name}`);
          addLog(`  ID: ${data[0].id}`);
          addLog(`  Preço: R$ ${data[0].price}`);
        }
      } else {
        addLog(`❌ Erro no fetch direto: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        addLog(`❌ Detalhes: ${errorText}`);
      }
    } catch (error) {
      addLog(`❌ Erro inesperado no fetch direto: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗄️ Teste Direto do Banco
          <Badge variant={isLoading ? "secondary" : "default"}>
            {isLoading ? "Testando..." : "Pronto"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Teste */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testRawQuery} 
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            Query RAW
          </Button>
          <Button 
            onClick={testCountQuery} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Contar Produtos
          </Button>
          <Button 
            onClick={testCategoriesQuery} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Testar Categorias
          </Button>
          <Button 
            onClick={testDirectFetch} 
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            Fetch Direto
          </Button>
        </div>

        <Button 
          onClick={testInsertProduct} 
          disabled={isLoading}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          Inserir Produto Teste
        </Button>

        <Button onClick={clearLogs} variant="ghost" size="sm" className="w-full">
          Limpar Logs
        </Button>

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-80 overflow-y-auto">
          <div className="font-bold mb-2 text-white">Logs do Banco:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">Clique em um botão para iniciar os testes</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 break-all">{log}</div>
            ))
          )}
        </div>

        {/* Instruções */}
        <div className="bg-red-50 p-3 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">⚠️ Testes Destrutivos:</h4>
          <p className="text-gray-700">
            O botão "Inserir Produto Teste" irá criar um produto real no banco de dados. 
            Use apenas para testes!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseDirectTest;

