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
  EyeOff
} from 'lucide-react';

interface ConsoleError {
  id: string;
  type: 'error' | 'warn' | 'info' | 'log';
  message: string;
  stack?: string;
  timestamp: Date;
  source?: string;
}

const ConsoleErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

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
      setErrors(prev => [error, ...prev.slice(0, 99)]); // Manter apenas os últimos 100
      originalError.apply(console, args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      const error = createConsoleError('warn', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalWarn.apply(console, args);
    };

    // Interceptar console.info
    console.info = (...args) => {
      const error = createConsoleError('info', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalInfo.apply(console, args);
    };

    // Interceptar console.log (opcional)
    console.log = (...args) => {
      const error = createConsoleError('log', args);
      setErrors(prev => [error, ...prev.slice(0, 99)]);
      originalLog.apply(console, args);
    };

    // Interceptar erros não capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      const error: ConsoleError = {
        id: `unhandled-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: event.message,
        stack: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
        timestamp: new Date(),
        source: 'Unhandled Error'
      };
      setErrors(prev => [error, ...prev.slice(0, 99)]);
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
      setErrors(prev => [error, ...prev.slice(0, 99)]);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Monitor de Erros do Console
          </CardTitle>
          <CardDescription>
            Captura e exibe erros, avisos e logs do console em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles */}
          <div className="flex items-center justify-between">
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

            <div className="flex items-center gap-4">
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
          </div>

          {/* Status */}
          {isMonitoring && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Monitoramento ativo!</strong> Capturando erros, avisos e logs do console em tempo real.
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
                              <Badge variant="outline" className="text-xs">
                                {error.type.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {error.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="font-mono text-xs break-words">
                              {error.message}
                            </div>
                            {error.stack && (
                              <div className="mt-2 text-xs text-muted-foreground font-mono">
                                <strong>Stack:</strong> {error.stack}
                              </div>
                            )}
                            {error.source && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                <strong>Fonte:</strong> {error.source}
                              </div>
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

          {/* Informações úteis */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Este monitor captura todos os logs do console, incluindo erros não tratados.
              Use-o para identificar problemas de JavaScript, CSP, CORS e outras questões de conectividade.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsoleErrorMonitor;
