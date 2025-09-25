import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NavigationTest = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testProductNavigation = () => {
    addLog('🧪 Testando navegação para produto...');
    
    // ID de produto real (você pode mudar para um ID que existe)
    const productId = 'test-product-123';
    const url = `/produto/${productId}`;
    
    addLog(`📍 URL destino: ${url}`);
    addLog(`👤 Usuário: ${user ? user.email : 'Não logado'}`);
    addLog(`📊 Perfil: ${profile ? 'Carregado' : 'Não carregado'}`);
    addLog(`⏳ Loading: isLoading=${isLoading}, isProfileLoading=${isProfileLoading}`);
    
    try {
      addLog('🚀 Executando navigate...');
      navigate(url);
      addLog('✅ Navigate executado com sucesso');
      
      // Verificar se a URL mudou
      setTimeout(() => {
        addLog(`🌐 URL após navegação: ${window.location.href}`);
        if (window.location.pathname === url) {
          addLog('✅ Navegação bem-sucedida - URL mudou corretamente');
        } else {
          addLog('❌ Navegação falhou - URL não mudou');
        }
      }, 500);
      
    } catch (error) {
      addLog(`❌ Erro na navegação: ${error}`);
    }
  };

  const testCatalogNavigation = () => {
    addLog('🧪 Testando navegação para catálogo...');
    
    try {
      addLog('🚀 Executando navigate para /catalogo...');
      navigate('/catalogo');
      addLog('✅ Navigate para catálogo executado');
      
      setTimeout(() => {
        addLog(`🌐 URL após navegação: ${window.location.href}`);
        if (window.location.pathname === '/catalogo') {
          addLog('✅ Navegação para catálogo bem-sucedida');
        } else {
          addLog('❌ Navegação para catálogo falhou');
        }
      }, 500);
      
    } catch (error) {
      addLog(`❌ Erro na navegação para catálogo: ${error}`);
    }
  };

  const testDirectURLChange = () => {
    addLog('🧪 Testando mudança direta de URL...');
    
    try {
      const url = '/produto/test-direct-456';
      addLog(`🌐 Mudando URL para: ${url}`);
      window.history.pushState({}, '', url);
      addLog('✅ URL mudada diretamente');
      
      setTimeout(() => {
        addLog(`🌐 URL atual: ${window.location.href}`);
        if (window.location.pathname === url) {
          addLog('✅ Mudança direta de URL bem-sucedida');
        } else {
          addLog('❌ Mudança direta de URL falhou');
        }
      }, 100);
      
    } catch (error) {
      addLog(`❌ Erro ao mudar URL diretamente: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = () => {
    if (isLoading || isProfileLoading) return 'bg-yellow-500';
    if (user && profile) return 'bg-green-500';
    if (user && !profile) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'Carregando...';
    if (isProfileLoading) return 'Carregando perfil...';
    if (user && profile) return 'Completo';
    if (user && !profile) return 'Usuário sem perfil';
    return 'Não logado';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧭 Teste de Navegação
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Estado da Autenticação:</h4>
            <p><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</p>
            <p><strong>Perfil:</strong> {profile ? 'Carregado' : 'Não carregado'}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}</p>
            <p><strong>Profile Loading:</strong> {isProfileLoading ? 'Sim' : 'Não'}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Informações da URL:</h4>
            <p><strong>Atual:</strong> {window.location.pathname}</p>
            <p><strong>Hash:</strong> {window.location.hash || 'N/A'}</p>
            <p><strong>Search:</strong> {window.location.search || 'N/A'}</p>
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={testProductNavigation} variant="default" size="sm">
            Testar Navegação para Produto
          </Button>
          <Button onClick={testCatalogNavigation} variant="outline" size="sm">
            Testar Navegação para Catálogo
          </Button>
          <Button onClick={testDirectURLChange} variant="secondary" size="sm">
            Testar Mudança Direta de URL
          </Button>
          <Button onClick={clearLogs} variant="ghost" size="sm">
            Limpar Logs
          </Button>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
          <div className="font-bold mb-2 text-white">Logs de Navegação:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">Clique em um botão para iniciar os testes</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 break-all">{log}</div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationTest;
