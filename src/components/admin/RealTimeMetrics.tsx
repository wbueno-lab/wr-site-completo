import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Eye, 
  Users, 
  ShoppingCart,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';

interface RealTimeMetricsProps {
  orders: any[];
  products: any[];
  contactMessages: any[];
}

const RealTimeMetrics = ({ orders, products, contactMessages }: RealTimeMetricsProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simular métricas em tempo real
  const realTimeData = {
    onlineUsers: Math.floor(Math.random() * 50) + 10,
    pageViews: Math.floor(Math.random() * 200) + 100,
    activeSessions: Math.floor(Math.random() * 20) + 5,
    conversionRate: (Math.random() * 5 + 1).toFixed(1),
    avgSessionTime: Math.floor(Math.random() * 300 + 120),
    bounceRate: (Math.random() * 30 + 20).toFixed(1)
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Métricas em Tempo Real
          <div className="flex items-center gap-2 ml-auto">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <Badge className={isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Status da Conexão */}
          <div className="flex items-center justify-between p-4 bg-brand-dark-lighter rounded-lg">
            <div>
              <p className="text-white font-medium">Status da Conexão</p>
              <p className="text-sm text-gray-400">
                {isOnline ? 'Conectado ao servidor' : 'Desconectado - Modo offline'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-lg">{formatTime(currentTime)}</p>
              <p className="text-xs text-gray-400">Hora atual</p>
            </div>
          </div>

          {/* Métricas de Tráfego */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-brand-dark-lighter rounded-lg">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{realTimeData.onlineUsers}</p>
              <p className="text-xs text-gray-400">Usuários Online</p>
            </div>

            <div className="text-center p-4 bg-brand-dark-lighter rounded-lg">
              <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{realTimeData.pageViews}</p>
              <p className="text-xs text-gray-400">Visualizações</p>
            </div>

            <div className="text-center p-4 bg-brand-dark-lighter rounded-lg">
              <ShoppingCart className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{realTimeData.activeSessions}</p>
              <p className="text-xs text-gray-400">Sessões Ativas</p>
            </div>
          </div>

          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-brand-dark-lighter rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Taxa de Conversão</p>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{realTimeData.conversionRate}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${parseFloat(realTimeData.conversionRate) * 20}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-brand-dark-lighter rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Tempo Médio de Sessão</p>
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{formatDuration(realTimeData.avgSessionTime)}</p>
              <p className="text-xs text-gray-400 mt-1">minutos</p>
            </div>

            <div className="p-4 bg-brand-dark-lighter rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Taxa de Rejeição</p>
                <TrendingUp className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{realTimeData.bounceRate}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${parseFloat(realTimeData.bounceRate) * 3}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Últimas Atividades */}
          <div>
            <h3 className="text-white font-semibold mb-3">Últimas Atividades</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-brand-dark-lighter rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Novo pedido recebido</p>
                  <p className="text-xs text-gray-400">Há 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-brand-dark-lighter rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Produto atualizado no estoque</p>
                  <p className="text-xs text-gray-400">Há 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-brand-dark-lighter rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Nova mensagem de contato</p>
                  <p className="text-xs text-gray-400">Há 8 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeMetrics;
