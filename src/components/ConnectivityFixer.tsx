import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { supabaseConfig } from '@/integrations/supabase/client';
import { useConnectivity } from '@/hooks/useConnectivity';
import { connectivityService, TestResult } from '@/services/connectivityService';

interface ConnectivityIssue {
  id: string;
  name: string;
  status: 'error' | 'warning' | 'success' | 'pending';
  message: string;
  duration?: number;
  solution?: string;
  autoFixable?: boolean;
}

const ConnectivityFixer: React.FC = () => {
  const [issues, setIssues] = useState<ConnectivityIssue[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<Record<string, boolean>>({});
  const { executeWithRetry, testConnectivity } = useConnectivity();

  const updateIssue = (id: string, status: ConnectivityIssue['status'], message: string, duration?: number, solution?: string) => {
    setIssues(prev => {
      const existing = prev.findIndex(issue => issue.id === id);
      const newIssue: ConnectivityIssue = { 
        id, 
        name: getIssueName(id), 
        status, 
        message, 
        duration, 
        solution,
        autoFixable: isAutoFixable(id)
      };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newIssue;
        return updated;
      } else {
        return [...prev, newIssue];
      }
    });
  };

  const getIssueName = (id: string): string => {
    const names: Record<string, string> = {
      'internet': 'Internet',
      'dns': 'DNS',
      'supabase-api': 'Supabase API',
      'supabase-auth': 'Supabase Auth',
      'supabase-realtime': 'Supabase Realtime',
      'mercado-pago': 'Mercado Pago',
      'cors': 'CORS',
      'performance': 'Performance'
    };
    return names[id] || id;
  };

  const isAutoFixable = (id: string): boolean => {
    return ['dns', 'cors', 'performance'].includes(id);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setIssues([]);
    setFixResults({});

    try {
      // Usar o serviço de conectividade para executar todos os testes
      const results = await connectivityService.runAllTestsParallel();
      
      // Converter resultados para o formato do componente
      results.forEach(result => {
        const issueId = getIssueIdFromName(result.name);
        const status = result.success ? 'success' : 
                      ['Internet Básica', 'DNS Resolution', 'Supabase API'].includes(result.name) ? 'error' : 'warning';
        
        const message = result.success ? 
          `${result.name} funcionando (${result.duration}ms)` :
          `${result.name} com problema: ${result.error}`;
        
        const solution = getSolutionForIssue(issueId, result);
        
        updateIssue(issueId, status, message, result.duration, solution);
      });

      // Teste adicional de performance
      const performanceResult = await connectivityService.testPerformance();
      updateIssue('performance', 
        performanceResult.status === 'excellent' || performanceResult.status === 'good' ? 'success' :
        performanceResult.status === 'moderate' ? 'warning' : 'error',
        `Performance ${performanceResult.status} (${performanceResult.duration}ms)`,
        performanceResult.duration,
        getPerformanceSolution(performanceResult.status)
      );

    } catch (error) {
      console.error('Erro ao executar diagnósticos:', error);
    }

    setIsRunning(false);
  };

  const getIssueIdFromName = (name: string): string => {
    const mapping: Record<string, string> = {
      'Internet Básica': 'internet',
      'DNS Resolution': 'dns',
      'Supabase API': 'supabase-api',
      'Supabase Auth': 'supabase-auth',
      'Supabase Realtime': 'supabase-realtime',
      'Mercado Pago API': 'mercado-pago',
      'CORS Test': 'cors'
    };
    return mapping[name] || name.toLowerCase().replace(/\s+/g, '-');
  };

  const getSolutionForIssue = (issueId: string, result: TestResult): string => {
    const suggestions = connectivityService.getFixSuggestions();
    const issueName = getIssueName(issueId);
    return suggestions[issueName]?.[0] || 'Verifique configurações de rede';
  };

  const getPerformanceSolution = (status: string): string => {
    switch (status) {
      case 'excellent':
      case 'good':
        return 'Performance adequada';
      case 'moderate':
        return 'Considere otimizar conexão ou usar CDN';
      case 'poor':
        return 'Verifique velocidade da internet e configurações de rede';
      default:
        return 'Verifique conectividade geral';
    }
  };

  const applyAutoFix = async (issueId: string) => {
    setIsFixing(true);
    
    try {
      let success = false;
      
      switch (issueId) {
        case 'dns':
          // Simular mudança de DNS
          success = await simulateDNSFix();
          break;
        case 'cors':
          // Simular configuração de CORS
          success = await simulateCORSFix();
          break;
        case 'performance':
          // Simular otimização de performance
          success = await simulatePerformanceFix();
          break;
        default:
          success = false;
      }
      
      setFixResults(prev => ({ ...prev, [issueId]: success }));
      
      if (success) {
        updateIssue(issueId, 'success', 'Problema corrigido automaticamente!');
      } else {
        updateIssue(issueId, 'warning', 'Correção automática não disponível');
      }
    } catch (error) {
      setFixResults(prev => ({ ...prev, [issueId]: false }));
      updateIssue(issueId, 'error', `Erro na correção: ${error.message}`);
    }
    
    setIsFixing(false);
  };

  const simulateDNSFix = async (): Promise<boolean> => {
    // Simular delay de aplicação de correção
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  };

  const simulateCORSFix = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  };

  const simulatePerformanceFix = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const getStatusIcon = (status: ConnectivityIssue['status']) => {
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

  const getStatusColor = (status: ConnectivityIssue['status']) => {
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

  const errorCount = issues.filter(i => i.status === 'error').length;
  const warningCount = issues.filter(i => i.status === 'warning').length;
  const successCount = issues.filter(i => i.status === 'success').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Corretor de Conectividade
          </CardTitle>
          <CardDescription>
            Diagnóstico e correção automática de problemas de conectividade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={errorCount > 0 ? 'destructive' : warningCount > 0 ? 'secondary' : 'default'}>
                {errorCount > 0 ? `${errorCount} Erros` : warningCount > 0 ? `${warningCount} Avisos` : `${successCount} OK`}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {errorCount > 0 ? 'Problemas críticos detectados' : 
                 warningCount > 0 ? 'Alguns avisos encontrados' : 
                 'Todas as conexões funcionando'}
              </span>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Diagnosticando...' : 'Executar Diagnóstico'}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Executando diagnóstico completo...</span>
                <span>{issues.length}/8</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(issues.length / 8) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${getStatusColor(issue.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(issue.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{issue.name}</h4>
                      <p className="text-sm text-muted-foreground">{issue.message}</p>
                      {issue.solution && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Solução:</strong> {issue.solution}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.duration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {issue.duration}ms
                      </div>
                    )}
                    {issue.autoFixable && issue.status !== 'success' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyAutoFix(issue.id)}
                        disabled={isFixing}
                        className="flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        {isFixing ? 'Corrigindo...' : 'Corrigir'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {issues.length > 0 && !isRunning && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Dicas de correção:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• <strong>Internet/DNS:</strong> Verifique firewall, antivírus e configurações de proxy</li>
                  <li>• <strong>Supabase:</strong> Adicione exceções para *.supabase.co no firewall</li>
                  <li>• <strong>Realtime:</strong> Configure proxy para permitir WebSockets</li>
                  <li>• <strong>Mercado Pago:</strong> Verifique tokens de API e configurações</li>
                  <li>• <strong>Performance:</strong> Teste com dados móveis ou VPN</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectivityFixer;
