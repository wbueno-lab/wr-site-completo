import { useState, useEffect } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RealtimeNotification = () => {
  const { products, orders } = useRealtime();
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simular verificação de conexão
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  useEffect(() => {
    // Atualizar timestamp quando os dados mudarem
    setLastUpdate(new Date());
  }, [products, orders]);

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-5 w-5 text-red-500" />
            <div>
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">
                Conexão Perdida
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300">
                Verificando conexão...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2">
          <Wifi className="h-5 w-5 text-green-500" />
          <div>
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
              Conectado em Tempo Real
            </h4>
            <p className="text-xs text-green-700 dark:text-green-300">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeNotification;
