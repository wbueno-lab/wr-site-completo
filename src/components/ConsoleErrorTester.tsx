import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Copy
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CapturedError {
  id: string;
  type: 'error' | 'warn' | 'info' | 'log';
  message: string;
  timestamp: Date;
  stack?: string;
  source?: string;
}

const ConsoleErrorTester: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isMonitoring) return;

    // Salvar referências originais
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalLog = console.log;

    // Interceptar console.error
    console.error = (...args) => {
      const error = createError('error', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalError.apply(console, args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      const error = createError('warn', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalWarn.apply(console, args);
    };

    // Interceptar console.info
    console.info = (...args) => {
      const error = createError('info', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalInfo.apply(console, args);
    };

    // Interceptar console.log
    console.log = (...args) => {
      const error = createError('log', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalLog.apply(console, args);
    };

    // Interceptar erros não capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      const error: CapturedError = {
        id: `unhandled-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        source: 'Unhandled Error'
      };
      setErrors(prev => [error, ...prev.slice(0, 99)]);
    };

    // Interceptar promessas rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: CapturedError = {
        id: `rejection-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: event.reason?.toString() || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date(),
        source: 'Promise Rejection'
      };
      setErrors(prev => [error, ...prev.slice(0, 99)]);
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
      console.log = originalLog;
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isMonitoring]);

  const createError = (type: CapturedError['type'], args: any[]): CapturedError => {
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

  const getErrorIcon = (type: CapturedError['type']) => {
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

  const getErrorColor = (type: CapturedError['type']) => {
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

  const copyErrorToClipboard = (error: CapturedError) => {
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

  // Funções de teste
  const testJavaScriptError = () => {
    try {
      const obj: any = null;
      obj.nonExistentProperty.someMethod();
    } catch (error) {
      console.error('🧪 Teste JavaScript Error:', error);
    }
  };

  const testNetworkError = async () => {
    try {
      await fetch('/api/nonexistent-endpoint');
    } catch (error) {
      console.error('🧪 Teste Network Error:', error);
    }
  };

  const testWarning = () => {
    console.warn('🧪 Teste Warning: Esta é uma mensagem de aviso para teste');
  };

  const testInfo = () => {
    console.info('🧪 Teste Info: Esta é uma mensagem informativa para teste');
  };

  const testSupabaseError = async () => {
    try {
      await fetch('https://fflomlvtgaqbzrjnvqaz.supabase.co/rest/v1/nonexistent', {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'apikey': 'invalid-key'
        }
      });
    } catch (error) {
      console.error('🧪 Teste Supabase Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Testador de Erros de Console
          </CardTitle>
          <CardDescription>
            Ferramenta simplificada para testar a captura de erros do console
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
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Monitoramento ativo!</strong> Capturando todos os logs do console.
                {errors.length > 0 && ` ${errors.length} entradas capturadas.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de teste */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <Button onClick={testJavaScriptError} variant="outline" size="sm">
              JS Error
            </Button>
            <Button onClick={testNetworkError} variant="outline" size="sm">
              Network Error
            </Button>
            <Button onClick={testWarning} variant="outline" size="sm">
              Warning
            </Button>
            <Button onClick={testInfo} variant="outline" size="sm">
              Info
            </Button>
            <Button onClick={testSupabaseError} variant="outline" size="sm">
              Supabase Error
            </Button>
          </div>

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
                <ScrollArea className="h-64">
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
    </div>
  );
};

export default ConsoleErrorTester;
