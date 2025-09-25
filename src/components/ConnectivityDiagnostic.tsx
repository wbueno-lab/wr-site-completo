import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Globe, 
  Server, 
  Database,
  Clock,
  Activity
} from 'lucide-react';
import { supabaseConfig } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  duration?: number;
  details?: string;
}

const ConnectivityDiagnostic: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | 'pending'>('pending');

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number, details?: string) => {
    setTests(prev => {
      const existing = prev.findIndex(test => test.name === name);
      const newTest: TestResult = { name, status, message, duration, details };
      
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

    // Teste 1: Conectividade básica da internet
    updateTest('Internet', 'pending', 'Testando conectividade básica...');
    try {
      const startTime = Date.now();
      // Usar Google DNS como teste de conectividade mais confiável
      const response = await fetch('https://dns.google/resolve?name=google.com&type=A', {
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

    // Teste 2: DNS Resolution
    updateTest('DNS', 'pending', 'Testando resolução DNS...');
    try {
      const startTime = Date.now();
      // Testar DNS usando Google DNS API
      const response = await fetch('https://dns.google/resolve?name=supabase.com&type=A', {
        method: 'GET',
        cache: 'no-cache'
      });
      const duration = Date.now() - startTime;
      if (response.ok) {
        updateTest('DNS', 'success', `DNS resolvido com sucesso (${duration}ms)`, duration);
      } else {
        updateTest('DNS', 'warning', `DNS OK mas API retornou ${response.status}`, duration);
      }
    } catch (error) {
      updateTest('DNS', 'error', `Erro de DNS: ${error.message}`);
    }

    // Teste 3: Supabase API
    updateTest('Supabase API', 'pending', 'Testando API do Supabase...');
    try {
      const startTime = Date.now();
      const response = await fetch(`${supabaseConfig.url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        mode: 'cors'
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest('Supabase API', 'success', `API do Supabase acessível (${duration}ms)`, duration);
      } else if (response.status === 401) {
        updateTest('Supabase API', 'warning', `API acessível mas autenticação necessária (${duration}ms)`, duration);
      } else {
        updateTest('Supabase API', 'error', `API retornou erro ${response.status}: ${response.statusText}`, duration);
      }
    } catch (error) {
      // Verificar se é erro de CORS ou rede
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        updateTest('Supabase API', 'warning', `API bloqueada por CORS - verificar configuração`, undefined, error.message);
      } else {
        updateTest('Supabase API', 'error', `Erro ao acessar Supabase: ${error.message}`);
      }
    }

    // Teste 4: Supabase Auth
    updateTest('Supabase Auth', 'pending', 'Testando autenticação...');
    try {
      const startTime = Date.now();
      const response = await fetch(`${supabaseConfig.url}/auth/v1/settings`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        mode: 'cors'
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest('Supabase Auth', 'success', `Autenticação funcionando (${duration}ms)`, duration);
      } else if (response.status === 401) {
        updateTest('Supabase Auth', 'warning', `Auth acessível mas precisa de configuração (${duration}ms)`, duration);
      } else {
        updateTest('Supabase Auth', 'warning', `Auth retornou ${response.status}`, duration);
      }
    } catch (error) {
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        updateTest('Supabase Auth', 'warning', `Auth bloqueado por CORS - verificar configuração`, undefined, error.message);
      } else {
        updateTest('Supabase Auth', 'error', `Erro na autenticação: ${error.message}`);
      }
    }

    // Teste 5: Supabase Realtime
    updateTest('Supabase Realtime', 'pending', 'Testando conexão em tempo real...');
    try {
      const startTime = Date.now();
      const response = await fetch(`${supabaseConfig.url}/realtime/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        mode: 'cors'
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest('Supabase Realtime', 'success', `Realtime acessível (${duration}ms)`, duration);
      } else if (response.status === 401) {
        updateTest('Supabase Realtime', 'warning', `Realtime acessível mas precisa de configuração (${duration}ms)`, duration);
      } else {
        updateTest('Supabase Realtime', 'warning', `Realtime retornou ${response.status}`, duration);
      }
    } catch (error) {
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        updateTest('Supabase Realtime', 'warning', `Realtime bloqueado por CORS - verificar configuração`, undefined, error.message);
      } else {
        updateTest('Supabase Realtime', 'error', `Erro no Realtime: ${error.message}`);
      }
    }

    // Teste 6: Mercado Pago API
    updateTest('Mercado Pago', 'pending', 'Testando API do Mercado Pago...');
    try {
      const startTime = Date.now();
      const response = await fetch('https://api.mercadopago.com/v1/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest('Mercado Pago', 'success', `Mercado Pago acessível (${duration}ms)`, duration);
      } else {
        updateTest('Mercado Pago', 'warning', `Mercado Pago retornou ${response.status}`, duration);
      }
    } catch (error) {
      updateTest('Mercado Pago', 'error', `Erro no Mercado Pago: ${error.message}`);
    }

    // Teste 7: CORS Headers
    updateTest('CORS', 'pending', 'Testando configurações CORS...');
    try {
      const startTime = Date.now();
      const response = await fetch(`${supabaseConfig.url}/rest/v1/products?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        mode: 'cors'
      });
      const duration = Date.now() - startTime;
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };
      
      if (response.ok) {
        updateTest('CORS', 'success', `CORS configurado corretamente (${duration}ms)`, duration, 
          `Origin: ${corsHeaders['Access-Control-Allow-Origin'] || 'N/A'}`);
      } else if (response.status === 401) {
        updateTest('CORS', 'warning', `CORS OK mas tabela products não acessível (${duration}ms)`, duration);
      } else {
        updateTest('CORS', 'warning', `CORS retornou ${response.status}`, duration);
      }
    } catch (error) {
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        updateTest('CORS', 'warning', `CORS bloqueado - verificar configuração`, undefined, error.message);
      } else {
        updateTest('CORS', 'error', `Erro no CORS: ${error.message}`);
      }
    }

    // Teste 8: Performance geral
    updateTest('Performance', 'pending', 'Testando performance geral...');
    try {
      const startTime = Date.now();
      const promises = [
        fetch('https://dns.google/resolve?name=google.com&type=A'),
        fetch(`${supabaseConfig.url}/rest/v1/`),
        fetch('https://api.mercadopago.com/v1/health')
      ];
      
      await Promise.allSettled(promises);
      const duration = Date.now() - startTime;
      
      if (duration < 2000) {
        updateTest('Performance', 'success', `Performance excelente (${duration}ms)`, duration);
      } else if (duration < 5000) {
        updateTest('Performance', 'warning', `Performance moderada (${duration}ms)`, duration);
      } else {
        updateTest('Performance', 'error', `Performance lenta (${duration}ms)`, duration);
      }
    } catch (error) {
      updateTest('Performance', 'error', `Erro no teste de performance: ${error.message}`);
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
        return <WifiOff className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Activity className="h-6 w-6 text-blue-500" />;
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
            Diagnóstico de Conectividade
          </CardTitle>
          <CardDescription>
            Verificação completa da conectividade do seu site com todos os serviços externos
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

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Executando testes de conectividade...</span>
                <span>{tests.length}/8</span>
              </div>
              <Progress value={(tests.length / 8) * 100} className="h-2" />
            </div>
          )}

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
                      {test.details && (
                        <p className="text-xs text-muted-foreground mt-1">{test.details}</p>
                      )}
                    </div>
                  </div>
                  {test.duration && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
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
                  <li>• Se algum teste falhar, verifique sua conexão com a internet</li>
                  <li>• Problemas com Supabase podem indicar bloqueio de firewall ou proxy</li>
                  <li>• Testes de performance acima de 5 segundos indicam conexão lenta</li>
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

export default ConnectivityDiagnostic;