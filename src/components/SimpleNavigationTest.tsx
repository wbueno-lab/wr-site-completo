import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SimpleNavigationTest = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testNavigateToProduct = () => {
    addLog('🧪 Testando navegação para produto...');
    
    // ID de teste (você pode mudar para um ID real)
    const testProductId = 'test-product-123';
    const url = `/produto/${testProductId}`;
    
    addLog(`📍 URL de destino: ${url}`);
    addLog(`🔧 Hook navigate disponível: ${typeof navigate === 'function'}`);
    addLog(`📍 Parâmetros atuais: ${JSON.stringify(params)}`);
    addLog(`🌐 URL atual: ${window.location.href}`);
    
    try {
      addLog('🚀 Executando navigate...');
      navigate(url);
      addLog('✅ Navigate executado com sucesso');
      
      // Verificar se a URL mudou
      setTimeout(() => {
        addLog(`🌐 URL após navegação: ${window.location.href}`);
      }, 200);
      
    } catch (error) {
      addLog(`❌ Erro no navigate: ${error}`);
    }
  };

  const testNavigateToCatalog = () => {
    addLog('🧪 Testando navegação para catálogo...');
    
    try {
      addLog('🚀 Executando navigate para /catalogo...');
      navigate('/catalogo');
      addLog('✅ Navigate para catálogo executado com sucesso');
    } catch (error) {
      addLog(`❌ Erro no navigate para catálogo: ${error}`);
    }
  };

  const testDirectURL = () => {
    addLog('🧪 Testando mudança direta de URL...');
    
    try {
      const url = '/produto/test-direct-123';
      addLog(`🌐 Mudando URL para: ${url}`);
      window.history.pushState({}, '', url);
      addLog('✅ URL mudada com sucesso');
    } catch (error) {
      addLog(`❌ Erro ao mudar URL: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teste de Navegação</h2>
      
      <div className="space-y-3 mb-6">
        <Button onClick={testNavigateToProduct} className="w-full">
          Testar Navegação para Produto
        </Button>
        <Button onClick={testNavigateToCatalog} variant="outline" className="w-full">
          Testar Navegação para Catálogo
        </Button>
        <Button onClick={testDirectURL} variant="secondary" className="w-full">
          Testar Mudança Direta de URL
        </Button>
        <Button onClick={clearLogs} variant="ghost" className="w-full">
          Limpar Logs
        </Button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
        <div className="font-bold mb-2 text-white">Logs de Teste:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">Clique em um botão para iniciar os testes</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 break-all">{log}</div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>URL Atual:</strong> {window.location.href}</p>
        <p><strong>Pathname:</strong> {window.location.pathname}</p>
        <p><strong>Search:</strong> {window.location.search}</p>
        <p><strong>Hash:</strong> {window.location.hash}</p>
      </div>
    </div>
  );
};

export default SimpleNavigationTest;
