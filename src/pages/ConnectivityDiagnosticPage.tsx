import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import ConnectivityFixer from '@/components/ConnectivityFixer';
import ConnectivityDiagnostic from '@/components/ConnectivityDiagnostic';
import ConnectivityTest from '@/components/ConnectivityTest';
import ConsoleErrorMonitor from '@/components/ConsoleErrorMonitor';
import SmartErrorDiagnostic from '@/components/SmartErrorDiagnostic';
import RealtimeStatusIndicator from '@/components/RealtimeStatusIndicator';
import { connectivityService } from '@/services/connectivityService';
import { useConnectivity } from '@/hooks/useConnectivity';

const ConnectivityDiagnosticPage: React.FC = () => {
  const [overallStatus, setOverallStatus] = useState<'success' | 'warning' | 'error' | 'pending'>('pending');
  const [lastDiagnostic, setLastDiagnostic] = useState<Date | null>(null);
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const { isOnline, lastError, retryCount } = useConnectivity();

  // Verificação automática de conectividade
  useEffect(() => {
    const runAutoCheck = async () => {
      if (!isAutoChecking) {
        setIsAutoChecking(true);
        try {
          const results = await connectivityService.runAllTestsParallel();
          const summary = connectivityService.getIssuesSummary();
          
          if (summary.critical > 0) {
            setOverallStatus('error');
          } else if (summary.warnings > 0) {
            setOverallStatus('warning');
          } else {
            setOverallStatus('success');
          }
          
          setLastDiagnostic(new Date());
        } catch (error) {
          console.error('Erro na verificação automática:', error);
          setOverallStatus('error');
        } finally {
          setIsAutoChecking(false);
        }
      }
    };

    // Verificação inicial
    runAutoCheck();

    // Verificação periódica a cada 5 minutos
    const interval = setInterval(runAutoCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAutoChecking]);

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-blue-500 animate-pulse" />;
    }
  };

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'success':
        return 'Todas as conexões estão funcionando perfeitamente!';
      case 'warning':
        return 'A conectividade está funcionando, mas há alguns avisos.';
      case 'error':
        return 'Há problemas críticos de conectividade que precisam ser resolvidos.';
      default:
        return 'Verificando status da conectividade...';
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Indicador de status em tempo real */}
      <RealtimeStatusIndicator />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Cabeçalho com status geral */}
        <Card className={getOverallStatusColor()}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getOverallStatusIcon()}
              <span>Diagnóstico de Conectividade</span>
              {isAutoChecking && (
                <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
              )}
            </CardTitle>
            <CardDescription>
              Monitoramento e correção de problemas de conectividade em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium">{getOverallStatusText()}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                  {lastError && (
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-4 w-4" />
                      {retryCount} tentativas
                    </div>
                  )}
                  {lastDiagnostic && (
                    <div className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      Última verificação: {lastDiagnostic.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              <Badge 
                variant={overallStatus === 'success' ? 'default' : 
                        overallStatus === 'error' ? 'destructive' : 'secondary'}
                className="text-sm"
              >
                {overallStatus === 'success' ? 'Conectado' : 
                 overallStatus === 'error' ? 'Problemas' : 
                 overallStatus === 'warning' ? 'Avisos' : 'Verificando'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre problemas comuns */}
        {overallStatus === 'error' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Problemas críticos detectados!</strong> Use as ferramentas abaixo para diagnosticar e corrigir os problemas de conectividade. 
              Os problemas mais comuns incluem configurações de firewall, DNS e proxy.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'warning' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Avisos encontrados.</strong> A aplicação está funcionando, mas alguns serviços podem ter limitações. 
              Recomendamos verificar as configurações para melhorar a performance.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs com diferentes ferramentas de diagnóstico */}
        <Tabs defaultValue="smart" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="smart" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Diagnóstico IA
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Teste Simples
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Monitor Console
            </TabsTrigger>
            <TabsTrigger value="fixer" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Corretor Automático
            </TabsTrigger>
            <TabsTrigger value="diagnostic" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Diagnóstico Completo
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="space-y-4">
            <SmartErrorDiagnostic />
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <ConnectivityTest />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            <ConsoleErrorMonitor />
          </TabsContent>

          <TabsContent value="fixer" className="space-y-4">
            <ConnectivityFixer />
          </TabsContent>

          <TabsContent value="diagnostic" className="space-y-4">
            <ConnectivityDiagnostic />
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações sobre Conectividade</CardTitle>
                <CardDescription>
                  Guia para entender e resolver problemas de conectividade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600 dark:text-green-400">
                      ✅ Serviços Funcionando
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Internet básica</li>
                      <li>• Resolução DNS</li>
                      <li>• API do Supabase</li>
                      <li>• Autenticação</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-600 dark:text-yellow-400">
                      ⚠️ Possíveis Avisos
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Realtime (WebSocket)</li>
                      <li>• Mercado Pago API</li>
                      <li>• Configurações CORS</li>
                      <li>• Performance</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Soluções Comuns</h4>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Firewall/Antivírus</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Adicione exceções para:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• *.supabase.co</li>
                          <li>• *.mercadopago.com</li>
                          <li>• Seu domínio</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">DNS</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Configure DNS alternativo:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• Google: 8.8.8.8</li>
                          <li>• Cloudflare: 1.1.1.1</li>
                          <li>• Execute: ipconfig /flushdns</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Proxy Corporativo</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Configure exceções:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• Adicione Supabase</li>
                          <li>• Permita WebSockets</li>
                          <li>• Teste com VPN</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Testes Rápidos</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>Para verificar:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• Use dados móveis</li>
                          <li>• Teste em modo incógnito</li>
                          <li>• Desabilite extensões</li>
                          <li>• Reinicie o navegador</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Se os problemas persistirem, tente usar uma rede diferente (dados móveis) 
                    ou uma VPN para identificar se é um problema específico da sua rede.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectivityDiagnosticPage;
