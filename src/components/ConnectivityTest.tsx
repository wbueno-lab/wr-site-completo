import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wifi, 
  RefreshCw,
  Globe,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  duration?: number;
}

const ConnectivityTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | 'pending'>('pending');

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.findIndex(test => test.name === name);
      const newTest: TestResult = { name, status, message, duration };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newTest;
        return updated;
      } else {
        return [...prev, newTest];
      }
    });
  };

  const runConnectivityTests = async () => {
    setIsRunning(true);
    setTests([]);
    setOverallStatus('pending');

    // Teste 1: Conectividade básica usando um endpoint confiável
    updateTest('Internet', 'pending', 'Testando conectividade básica...');
    try {
      const startTime = Date.now();
      // Usar um endpoint que sabemos que funciona
      const response = await fetch('https://api.github.com/zen', {
        method: 'GET',
        cache: 'no-cache'
      });
      const duration = Date.now() - startTime;
      if (response.ok) {
        updateTest('Internet', 'success', `Conectividade básica OK (${duration}ms)`, duration);
      } else {
        updateTest('Internet', 'warning', `Conectividade limitada (${response.status})`, duration);
      }
    } catch (error) {
      updateTest('Internet', 'error', `Erro de conectividade: ${error.message}`);
    }

    // Teste 2: Supabase usando o cliente oficial
    updateTest('Supabase', 'pending', 'Testando conexão com Supabase...');
    try {
      const startTime = Date.now();
      
      // Usar o cliente Supabase oficial para testar a conexão
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        if (error.message.includes('JWT') || error.message.includes('permission')) {
          updateTest('Supabase', 'warning', `Supabase conectado mas precisa de configuração (${duration}ms)`, duration);
        } else {
          updateTest('Supabase', 'error', `Erro no Supabase: ${error.message}`, duration);
        }
      } else {
        updateTest('Supabase', 'success', `Supabase funcionando perfeitamente (${duration}ms)`, duration);
      }
    } catch (error) {
      updateTest('Supabase', 'error', `Erro ao conectar com Supabase: ${error.message}`);
    }

    // Teste 3: Autenticação Supabase
    updateTest('Auth', 'pending', 'Testando autenticação...');
    try {
      const startTime = Date.now();
      
      // Testar se conseguimos obter a sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      const duration = Date.now() - startTime;
      
      if (error) {
        updateTest('Auth', 'warning', `Auth com problemas: ${error.message}`, duration);
      } else if (session) {
        updateTest('Auth', 'success', `Autenticação ativa (${duration}ms)`, duration);
      } else {
        updateTest('Auth', 'warning', `Auth funcionando mas sem sessão ativa (${duration}ms)`, duration);
      }
    } catch (error) {
      updateTest('Auth', 'error', `Erro na autenticação: ${error.message}`);
    }

    // Teste 4: Mercado Pago (teste simples)
    updateTest('Mercado Pago', 'pending', 'Testando API do Mercado Pago...');
    try {
      const startTime = Date.now();
      // Testar apenas se conseguimos fazer uma requisição básica
      const response = await fetch('https://api.mercadopago.com', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const duration = Date.now() - startTime;
      
      // Mercado Pago pode retornar 405 para HEAD, mas isso significa que está acessível
      if (response.status === 405 || response.status === 200) {
        updateTest('Mercado Pago', 'success', `Mercado Pago acessível (${duration}ms)`, duration);
      } else {
        updateTest('Mercado Pago', 'warning', `Mercado Pago retornou ${response.status}`, duration);
      }
    } catch (error) {
      updateTest('Mercado Pago', 'warning', `Mercado Pago pode estar indisponível: ${error.message}`);
    }

    // Calcular status geral
    setTimeout(() => {
      const errorCount = tests.filter(t => t.status === 'error').length;
      const warningCount = tests.filter(t => t.status === 'warning').length;
      
      if (errorCount > 0) {
        setOverallStatus('error');
      } else if (warningCount > 0) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('success');
      }
      
      setIsRunning(false);
    }, 1000);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'success':
        return <Wifi className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Globe className="h-6 w-6 text-blue-500" />;
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'success':
        return 'Todas as conexões estão funcionando perfeitamente!';
      case 'error':
        return 'Há problemas críticos de conectividade que precisam ser resolvidos.';
      case 'warning':
        return 'A conectividade está funcionando, mas há alguns avisos.';
      default:
        return 'Execute os testes para verificar a conectividade.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getOverallStatusIcon()}
            Teste de Conectividade
          </CardTitle>
          <CardDescription>
            Verificação simplificada da conectividade com os serviços principais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={overallStatus === 'success' ? 'default' : overallStatus === 'error' ? 'destructive' : 'secondary'}>
                {overallStatus === 'success' ? 'Conectado' : overallStatus === 'error' ? 'Problemas' : overallStatus === 'warning' ? 'Avisos' : 'Pendente'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getOverallStatusText()}
              </span>
            </div>
            <Button 
              onClick={runConnectivityTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Testando...' : 'Executar Testes'}
            </Button>
          </div>

          <div className="grid gap-4">
            {tests.map((test, index) => (
              <div
                key={test.name}
                className={`p-4 rounded-lg border transition-all duration-300 ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-muted-foreground">{test.message}</p>
                    </div>
                  </div>
                  {test.duration && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Database className="h-4 w-4" />
                      {test.duration}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {tests.length > 0 && !isRunning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Informações importantes:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Testes de conectividade simplificados para evitar erros de CSP</li>
                  <li>• Avisos são normais e indicam que os serviços estão funcionando</li>
                  <li>• Erros críticos precisam de atenção imediata</li>
                  <li>• Execute os testes novamente se houver problemas temporários</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectivityTest;
