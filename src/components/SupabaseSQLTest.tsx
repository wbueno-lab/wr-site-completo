import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SupabaseSQLTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testSQLQueries = async () => {
    setIsLoading(true);
    addLog('🧪 Executando testes SQL diretos...');
    
    const SUPABASE_URL = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4';

    const tests = [
      {
        endpoint: 'products?select=count',
        description: 'Contagem total de produtos'
      },
      {
        endpoint: 'products?select=*&limit=5',
        description: 'Busca simples de produtos'
      },
      {
        endpoint: 'products?select=*&is_active=eq.true&limit=5',
        description: 'Produtos ativos'
      },
      {
        endpoint: 'products?select=id,name,price,is_active&limit=10',
        description: 'Produtos com campos específicos'
      },
      {
        endpoint: 'categories?select=*&limit=5',
        description: 'Categorias'
      }
    ];

    for (const test of tests) {
      try {
        addLog(`🔄 ${test.description}...`);
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${test.endpoint}`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          addLog(`✅ ${test.description} - Sucesso: ${Array.isArray(data) ? data.length : 'N/A'} itens`);
          
          if (Array.isArray(data) && data.length > 0) {
            addLog(`📊 Primeiro item: ${JSON.stringify(data[0], null, 2)}`);
          }
        } else {
          addLog(`❌ ${test.description} - Erro: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          addLog(`❌ Detalhes: ${errorText}`);
        }
      } catch (error) {
        addLog(`❌ ${test.description} - Erro inesperado: ${error}`);
      }
    }

    setIsLoading(false);
    addLog('🏁 Testes SQL concluídos!');
  };

  const testInsertProduct = async () => {
    setIsLoading(true);
    addLog('⚠️ Testando inserção de produto...');
    
    const SUPABASE_URL = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4';

    const testProduct = {
      name: `Produto Teste React ${Date.now()}`,
      price: 99.90,
      description: 'Produto criado via React para teste',
      is_active: true,
      sku: `REACT-TEST-${Date.now()}`
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testProduct)
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Produto inserido com sucesso: ${data[0].name}`);
        addLog(`📊 ID: ${data[0].id}`);
      } else {
        addLog(`❌ Erro na inserção: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        addLog(`❌ Detalhes: ${errorText}`);
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na inserção: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testComplexQuery = async () => {
    setIsLoading(true);
    addLog('🧪 Testando query complexa...');
    
    const SUPABASE_URL = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4';

    try {
      // Query complexa com joins
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,price,categories(name)&limit=5`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Query complexa executada: ${data.length} produtos`);
        
        data.forEach((product, index) => {
          addLog(`  ${index + 1}. ${product.name} - Categoria: ${product.categories?.name || 'N/A'}`);
        });
      } else {
        addLog(`❌ Erro na query complexa: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        addLog(`❌ Detalhes: ${errorText}`);
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na query complexa: ${error}`);
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
          🗃️ Teste SQL Direto
          <Badge variant={isLoading ? "secondary" : "default"}>
            {isLoading ? "Testando..." : "Pronto"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Teste */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testSQLQueries} 
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            Testar Queries SQL
          </Button>
          <Button 
            onClick={testComplexQuery} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Query Complexa
          </Button>
          <Button 
            onClick={testInsertProduct} 
            disabled={isLoading}
            variant="destructive"
            size="sm"
            className="col-span-2"
          >
            Inserir Produto Teste
          </Button>
        </div>

        <Button onClick={clearLogs} variant="ghost" size="sm" className="w-full">
          Limpar Logs
        </Button>

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-80 overflow-y-auto">
          <div className="font-bold mb-2 text-white">Logs SQL:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">Clique em um botão para iniciar os testes SQL</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 break-all">{log}</div>
            ))
          )}
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 p-3 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">📋 Arquivos Criados:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><code>supabase_direct_test.sql</code> - Script SQL para executar no Supabase Dashboard</li>
            <li><code>browser_console_test.js</code> - Código para executar no console do navegador</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseSQLTest;