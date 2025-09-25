import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SupabaseConnectionTest = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addLog('🧪 Testando conexão com Supabase...');
    
    try {
      // Teste 1: Verificar se o cliente está configurado
      addLog('✅ Cliente Supabase configurado');
      addLog(`📍 URL: ${supabase.supabaseUrl}`);
      addLog(`🔑 Anon Key: ${supabase.supabaseKey.substring(0, 20)}...`);
      
      // Teste 2: Verificar autenticação
      addLog('🔄 Testando autenticação...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addLog(`❌ Erro na autenticação: ${authError.message}`);
      } else {
        addLog(`✅ Autenticação OK - Usuário: ${user ? user.email : 'Anônimo'}`);
      }
      
      // Teste 3: Testar query simples
      addLog('🔄 Testando query simples...');
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1);
        
      if (error) {
        addLog(`❌ Erro na query: ${error.message}`);
        addLog(`❌ Código: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details}`);
        addLog(`❌ Hint: ${error.hint}`);
      } else {
        addLog(`✅ Query executada com sucesso`);
        addLog(`📊 Resultado: ${JSON.stringify(data)}`);
      }
      
    } catch (error) {
      addLog(`❌ Erro inesperado: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProductsQuery = async () => {
    setIsLoading(true);
    addLog('🔄 Testando query de produtos...');
    
    try {
      // Query básica sem filtros
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, is_active')
        .limit(5);

      if (error) {
        addLog(`❌ Erro na query de produtos: ${error.message}`);
        addLog(`❌ Código: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details}`);
        addLog(`❌ Hint: ${error.hint}`);
      } else {
        addLog(`✅ Query de produtos executada com sucesso`);
        addLog(`📊 Produtos encontrados: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          addLog('📋 Lista de produtos:');
          data.forEach((product, index) => {
            addLog(`  ${index + 1}. ${product.name} - R$ ${product.price} - Ativo: ${product.is_active}`);
          });
        } else {
          addLog('⚠️ Nenhum produto retornado');
        }
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na query de produtos: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCategoriesQuery = async () => {
    setIsLoading(true);
    addLog('🔄 Testando query de categorias...');
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .limit(5);

      if (error) {
        addLog(`❌ Erro na query de categorias: ${error.message}`);
        addLog(`❌ Código: ${error.code}`);
        addLog(`❌ Detalhes: ${error.details}`);
      } else {
        addLog(`✅ Query de categorias executada com sucesso`);
        addLog(`📊 Categorias encontradas: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          addLog('📋 Lista de categorias:');
          data.forEach((category, index) => {
            addLog(`  ${index + 1}. ${category.name} (${category.slug})`);
          });
        } else {
          addLog('⚠️ Nenhuma categoria retornada');
        }
      }
    } catch (error) {
      addLog(`❌ Erro inesperado na query de categorias: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNetworkConnection = async () => {
    setIsLoading(true);
    addLog('🔄 Testando conectividade de rede...');
    
    try {
      // Teste de conectividade básica
      const response = await fetch('https://httpbin.org/get');
      if (response.ok) {
        addLog('✅ Conectividade de rede OK');
      } else {
        addLog('❌ Problema de conectividade de rede');
      }
      
      // Teste específico do Supabase
      const supabaseResponse = await fetch('https://fflomlvtgaqbzrjnvqaz.supabase.co/rest/v1/', {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        }
      });
      
      if (supabaseResponse.ok) {
        addLog('✅ Conectividade com Supabase OK');
      } else {
        addLog(`❌ Problema de conectividade com Supabase: ${supabaseResponse.status}`);
      }
      
    } catch (error) {
      addLog(`❌ Erro de rede: ${error}`);
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
          🔗 Teste de Conexão Supabase
          <Badge variant={isLoading ? "secondary" : "default"}>
            {isLoading ? "Testando..." : "Pronto"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de Teste */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            Testar Conexão
          </Button>
          <Button 
            onClick={testProductsQuery} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Testar Produtos
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
            onClick={testNetworkConnection} 
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            Testar Rede
          </Button>
        </div>

        <Button onClick={clearLogs} variant="ghost" size="sm" className="w-full">
          Limpar Logs
        </Button>

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-80 overflow-y-auto">
          <div className="font-bold mb-2 text-white">Logs de Conexão:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">Clique em um botão para iniciar os testes</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 break-all">{log}</div>
            ))
          )}
        </div>

        {/* Informações da Configuração */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Configuração Atual:</h4>
          <p><strong>URL:</strong> {supabase.supabaseUrl}</p>
          <p><strong>Anon Key:</strong> {supabase.supabaseKey.substring(0, 30)}...</p>
          <p><strong>Status:</strong> {isLoading ? 'Testando...' : 'Pronto para teste'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
