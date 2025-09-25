import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ConsoleErrorDetector, testBasicConnectivity } from '@/utils/consoleErrorDetector';
import ConsoleErrorDemo from '@/components/ConsoleErrorDemo';

interface ConsoleError {
  id: string;
  type: 'error' | 'warn' | 'info' | 'log';
  message: string;
  stack?: string;
  timestamp: Date;
  source?: string;
  url?: string;
  line?: number;
  column?: number;
}

const ConsoleErrorDiagnosticPage: React.FC = () => {
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [connectivityTest, setConnectivityTest] = useState<any>(null);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isMonitoring) return;

    // Salvar referências originais dos métodos de console
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalLog = console.log;

    // Interceptar console.error
    console.error = (...args) => {
      const error = createConsoleError('error', args);
      setErrors(prev => [error, ...prev.slice(0, 199)]); // Manter apenas os últimos 200
      originalError.apply(console, args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      const error = createConsoleError('warn', args);
      setErrors(prev => [error, ...prev.slice(0, 199)]);
      originalWarn.apply(console, args);
    };

    // Interceptar console.info
    console.info = (...args) => {
      const error = createConsoleError('info', args);
      setErrors(prev => [error, ...prev.slice(0, 199)]);
      originalInfo.apply(console, args);
    };

    // Interceptar console.log (opcional)
    console.log = (...args) => {
      const error = createConsoleError('log', args);
      setErrors(prev => [error, ...prev.slice(0, 199)]);
      originalLog.apply(console, args);
    };

    // Interceptar erros não capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      const error: ConsoleError = {
        id: `unhandled-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        source: 'Unhandled Error',
        url: event.filename,
        line: event.lineno,
        column: event.colno
      };
      setErrors(prev => [error, ...prev.slice(0, 199)]);
    };

    // Interceptar promessas rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ConsoleError = {
        id: `rejection-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: event.reason?.toString() || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date(),
        source: 'Unhandled Rejection'
      };
      setErrors(prev => [error, ...prev.slice(0, 199)]);
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
      console.log = originalLog;
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isMonitoring]);

  const createConsoleError = (type: ConsoleError['type'], args: any[]): ConsoleError => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return arg?.toString() || 'Unknown Object';
        }
      }
      return String(arg);
    }).join(' ');

    return {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      source: 'Console'
    };
  };

  const runConnectivityTest = async () => {
    setIsTestingConnectivity(true);
    try {
      const result = await testBasicConnectivity();
      setConnectivityTest(result);
      
      if (result.success) {
        toast({
          title: "Teste de Conectividade",
          description: "Todos os serviços estão acessíveis!",
        });
      } else {
        toast({
          title: "Problemas de Conectividade",
          description: `${result.errors.length} problemas encontrados`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: "Falha ao executar teste de conectividade",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const getErrorIcon = (type: ConsoleError['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getErrorColor = (type: ConsoleError['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const clearErrors = () => {
    setErrors([]);
    toast({
      title: "Logs Limpos",
      description: "Todos os logs foram removidos",
    });
  };

  const exportErrors = () => {
    const errorData = {
      timestamp: new Date().toISOString(),
      errors: errors.map(error => ({
        type: error.type,
        message: error.message,
        timestamp: error.timestamp.toISOString(),
        source: error.source,
        stack: error.stack,
        url: error.url,
        line: error.line,
        column: error.column
      }))
    };

    const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-errors-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Logs Exportados",
      description: "Arquivo JSON baixado com sucesso",
    });
  };

  const copyErrorToClipboard = (error: ConsoleError) => {
    const errorText = `[${error.type.toUpperCase()}] ${error.timestamp.toLocaleString()}
${error.message}
${error.stack ? `Stack: ${error.stack}` : ''}
${error.source ? `Source: ${error.source}` : ''}`;

    navigator.clipboard.writeText(errorText).then(() => {
      toast({
        title: "Copiado!",
        description: "Erro copiado para a área de transferência",
      });
    });
  };

  const filteredErrors = errors.filter(error => {
    switch (error.type) {
      case 'error':
        return showErrors;
      case 'warn':
        return showWarnings;
      case 'info':
      case 'log':
        return showInfo;
      default:
        return false;
    }
  });

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warn').length;
  const infoCount = errors.filter(e => e.type === 'info' || e.type === 'log').length;

  // Análise dos erros
  const errorMessages = errors.map(e => e.message);
  const diagnosticReport = errorMessages.length > 0 ? ConsoleErrorDetector.generateDiagnosticReport(errorMessages) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Bug className="h-8 w-8" />
          Diagnóstico de Console
        </h1>
        <p className="text-muted-foreground">
          Ferramenta completa para monitoramento e análise de erros do console
        </p>
      </div>

      <Tabs defaultValue="monitor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="connectivity">Conectividade</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitor de Console em Tempo Real
              </CardTitle>
              <CardDescription>
                Captura todos os logs, erros e avisos do console JavaScript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controles */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    variant={isMonitoring ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isMonitoring ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Parar Monitoramento
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Iniciar Monitoramento
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={clearErrors}
                    variant="outline"
                    disabled={errors.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar ({errors.length})
                  </Button>

                  <Button
                    onClick={exportErrors}
                    variant="outline"
                    disabled={errors.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowErrors(!showErrors)}
                    variant={showErrors ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Erros ({errorCount})
                  </Button>
                  <Button
                    onClick={() => setShowWarnings(!showWarnings)}
                    variant={showWarnings ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Avisos ({warningCount})
                  </Button>
                  <Button
                    onClick={() => setShowInfo(!showInfo)}
                    variant={showInfo ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Info className="h-3 w-3" />
                    Info ({infoCount})
                  </Button>
                </div>
              </div>

              {/* Status */}
              {isMonitoring && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Monitoramento ativo!</strong> Capturando todos os logs do console.
                    {errors.length > 0 && ` ${errors.length} entradas capturadas.`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Lista de erros */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Logs Capturados</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredErrors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isMonitoring ? 'Nenhum log capturado ainda...' : 'Inicie o monitoramento para capturar logs'}
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {filteredErrors.map((error) => (
                          <div
                            key={error.id}
                            className={`p-3 rounded-lg border text-sm ${getErrorColor(error.type)}`}
                          >
                            <div className="flex items-start gap-3">
                              {getErrorIcon(error.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {error.type.toUpperCase()}
                                    </Badge>
                                    {error.source && (
                                      <Badge variant="secondary" className="text-xs">
                                        {error.source}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => copyErrorToClipboard(error)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                      {error.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="font-mono text-xs break-words mb-2">
                                  {error.message}
                                </div>
                                {error.url && (
                                  <div className="text-xs text-muted-foreground mb-1">
                                    <strong>URL:</strong> {error.url}
                                    {error.line && `:${error.line}`}
                                    {error.column && `:${error.column}`}
                                  </div>
                                )}
                                {error.stack && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-muted-foreground cursor-pointer">
                                      Stack Trace
                                    </summary>
                                    <div className="mt-1 text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                                      {error.stack}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <ConsoleErrorDemo />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Análise Inteligente de Erros
              </CardTitle>
              <CardDescription>
                Análise automática dos erros capturados com sugestões de solução
              </CardDescription>
            </CardHeader>
            <CardContent>
              {diagnosticReport ? (
                <div className="space-y-6">
                  {/* Resumo */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{diagnosticReport.summary.total}</div>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-500">{diagnosticReport.summary.critical}</div>
                        <p className="text-xs text-muted-foreground">Críticos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-500">{diagnosticReport.summary.high}</div>
                        <p className="text-xs text-muted-foreground">Altos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-500">{diagnosticReport.summary.medium}</div>
                        <p className="text-xs text-muted-foreground">Médios</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-500">{diagnosticReport.summary.low}</div>
                        <p className="text-xs text-muted-foreground">Baixos</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Análise detalhada */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Análise Detalhada</h3>
                    {diagnosticReport.analysis.map((analysis, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={analysis.severity === 'critical' ? 'destructive' : 
                                              analysis.severity === 'high' ? 'destructive' :
                                              analysis.severity === 'medium' ? 'default' : 'secondary'}>
                                  {analysis.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{analysis.type.toUpperCase()}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {analysis.count} ocorrência{analysis.count > 1 ? 's' : ''}
                                </span>
                              </div>
                              <h4 className="font-semibold">{analysis.description}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {analysis.solution}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Funcionalidades Afetadas:</h5>
                            <div className="flex flex-wrap gap-1">
                              {analysis.affectedFeatures.map((feature, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {analysis.examples.length > 0 && (
                            <details className="mt-4">
                              <summary className="text-sm font-medium cursor-pointer">
                                Exemplos de Erros ({analysis.examples.length})
                              </summary>
                              <div className="mt-2 space-y-2">
                                {analysis.examples.map((example, i) => (
                                  <div key={i} className="text-xs font-mono bg-muted p-2 rounded">
                                    {example}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recomendações */}
                  {diagnosticReport.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recomendações Prioritárias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {diagnosticReport.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum erro capturado ainda. Inicie o monitoramento para ver a análise.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Teste de Conectividade
              </CardTitle>
              <CardDescription>
                Verifica a conectividade com serviços essenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runConnectivityTest}
                disabled={isTestingConnectivity}
                className="flex items-center gap-2"
              >
                {isTestingConnectivity ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Executar Teste
                  </>
                )}
              </Button>

              {connectivityTest && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {connectivityTest.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Resultado do Teste
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status dos serviços */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(connectivityTest.details).map(([service, details]: [string, any]) => (
                        <Card key={service}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium capitalize">{service}</h4>
                              {details.ok ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Status: {details.status}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Erros encontrados */}
                    {connectivityTest.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Erros Encontrados:</h4>
                        {connectivityTest.errors.map((error: string, index: number) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Soluções Comuns
              </CardTitle>
              <CardDescription>
                Guia de soluções para os problemas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ConsoleErrorDetector.getCommonSolutions().map((solution, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {solution.title}
                        <Badge variant={solution.priority === 'high' ? 'destructive' : 
                                      solution.priority === 'medium' ? 'default' : 'secondary'}>
                          {solution.priority.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {solution.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsoleErrorDiagnosticPage;
