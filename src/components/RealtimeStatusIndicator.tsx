import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw, 
  Clock,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useConnectivity } from '@/hooks/useConnectivity';

interface ConnectionStatus {
  type: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  lastCheck?: Date;
  retryCount?: number;
}

const RealtimeStatusIndicator: React.FC = () => {
  const { isConnected, lastUpdate, isLoading } = useRealtime();
  const { isOnline, lastError, retryCount } = useConnectivity();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    type: 'pending',
    message: 'Verificando conexão...'
  });
  const [isChecking, setIsChecking] = useState(false);

  // Verificar status da conexão
  const checkConnectionStatus = async () => {
    setIsChecking(true);
    
    try {
      // Teste básico de conectividade
      const response = await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      if (isConnected && isOnline) {
        setConnectionStatus({
          type: 'success',
          message: 'Conectado em tempo real',
          lastCheck: new Date()
        });
      } else if (isOnline) {
        setConnectionStatus({
          type: 'warning',
          message: 'Conectado (modo polling)',
          lastCheck: new Date(),
          retryCount
        });
      } else {
        setConnectionStatus({
          type: 'error',
          message: 'Sem conexão com a internet',
          lastCheck: new Date()
        });
      }
    } catch (error) {
      setConnectionStatus({
        type: 'error',
        message: `Erro de conectividade: ${error.message}`,
        lastCheck: new Date(),
        retryCount
      });
    }
    
    setIsChecking(false);
  };

  // Verificar status periodicamente
  useEffect(() => {
    checkConnectionStatus();
    
    const interval = setInterval(checkConnectionStatus, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [isConnected, isOnline, lastUpdate]);

  // Atualizar status quando houver mudanças
  useEffect(() => {
    if (lastError) {
      setConnectionStatus({
        type: 'error',
        message: `Erro: ${lastError}`,
        lastCheck: new Date(),
        retryCount
      });
    } else if (isConnected && isOnline) {
      setConnectionStatus({
        type: 'success',
        message: 'Conectado em tempo real',
        lastCheck: new Date()
      });
    } else if (isOnline) {
      setConnectionStatus({
        type: 'warning',
        message: 'Conectado (modo polling)',
        lastCheck: new Date(),
        retryCount
      });
    }
  }, [isConnected, isOnline, lastError, retryCount]);

  const getStatusIcon = () => {
    switch (connectionStatus.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.type) {
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

  const getBadgeVariant = () => {
    switch (connectionStatus.type) {
      case 'success':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg border shadow-lg p-3 transition-all duration-300 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isChecking ? (
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              getStatusIcon()
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {connectionStatus.type === 'success' ? 'Tempo Real' : 
                   connectionStatus.type === 'warning' ? 'Polling' : 
                   'Offline'}
                </span>
                <Badge variant={getBadgeVariant()} className="text-xs">
                  {connectionStatus.type === 'success' ? 'Ativo' : 
                   connectionStatus.type === 'warning' ? 'Limitado' : 
                   'Erro'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {connectionStatus.message}
              </p>
              {connectionStatus.lastCheck && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {connectionStatus.lastCheck.toLocaleTimeString()}
                </div>
              )}
              {connectionStatus.retryCount && connectionStatus.retryCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  Tentativas: {connectionStatus.retryCount}
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={checkConnectionStatus}
            disabled={isChecking}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {lastUpdate && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Última atualização:</span>
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Carregando dados...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeStatusIndicator;


