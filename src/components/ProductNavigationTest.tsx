import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProductNavigationTestProps {
  productId: string;
  productName: string;
}

const ProductNavigationTest = ({ productId, productName }: ProductNavigationTestProps) => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`🧪 Navigation Test: ${message}`);
  };

  const testNavigation = () => {
    setTestResults([]);
    addResult('Iniciando teste de navegação...');
    
    try {
      addResult(`Tentando navegar para: /produto/${productId}`);
      addResult(`Produto: ${productName}`);
      
      // Teste 1: Verificar se o navigate está disponível
      if (typeof navigate === 'function') {
        addResult('✅ Hook useNavigate está disponível');
      } else {
        addResult('❌ Hook useNavigate não está disponível');
        return;
      }
      
      // Teste 2: Verificar se o productId é válido
      if (productId && productId.trim() !== '') {
        addResult(`✅ Product ID é válido: ${productId}`);
      } else {
        addResult('❌ Product ID é inválido ou vazio');
        return;
      }
      
      // Teste 3: Tentar navegar
      addResult('🔄 Executando navigate...');
      navigate(`/produto/${productId}`);
      addResult('✅ Comando navigate executado sem erro');
      
    } catch (error) {
      addResult(`❌ Erro durante navegação: ${error}`);
      console.error('Erro na navegação:', error);
    }
  };

  const testDirectNavigation = () => {
    setTestResults([]);
    addResult('Testando navegação direta via window.location...');
    
    try {
      const url = `/produto/${productId}`;
      addResult(`Redirecionando para: ${url}`);
      window.location.href = url;
    } catch (error) {
      addResult(`❌ Erro na navegação direta: ${error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Teste de Navegação - {productName}</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={testNavigation} variant="default">
          Testar Navegação com React Router
        </Button>
        <Button onClick={testDirectNavigation} variant="outline">
          Testar Navegação Direta
        </Button>
      </div>
      
      <div className="bg-black text-green-400 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
        <div className="font-bold mb-2">Logs do Teste:</div>
        {testResults.length === 0 ? (
          <div className="text-gray-500">Clique em um botão para iniciar o teste</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductNavigationTest;
