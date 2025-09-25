import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { cleanupProblematicResources, checkProblematicResources } from '@/utils/cacheCleaner';

interface CacheStatusProps {
  className?: string;
}

const CacheStatus = ({ className = "" }: CacheStatusProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);
  const [problematicResources, setProblematicResources] = useState<string[]>([]);
  const [status, setStatus] = useState<'clean' | 'warning' | 'error'>('clean');

  const checkResources = () => {
    const resources = checkProblematicResources();
    setProblematicResources(resources);
    
    if (resources.length === 0) {
      setStatus('clean');
    } else if (resources.length <= 2) {
      setStatus('warning');
    } else {
      setStatus('error');
    }
  };

  const handleCleanup = async () => {
    setIsLoading(true);
    
    try {
      const result = cleanupProblematicResources();
      setLastCleanup(new Date());
      setProblematicResources(result.problematicResources);
      
      if (result.problematicResources.length === 0) {
        setStatus('clean');
      } else {
        setStatus('warning');
      }
    } catch (error) {
      console.error('Erro durante limpeza:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkResources();
    
    // Verificar recursos a cada 30 segundos
    const interval = setInterval(checkResources, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'clean':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'clean':
        return 'Cache limpo';
      case 'warning':
        return 'Recursos suspeitos detectados';
      case 'error':
        return 'Múltiplos recursos problemáticos';
      default:
        return 'Cache limpo';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'clean':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getStatusIcon()}
          Status do Cache
        </CardTitle>
        <CardDescription className="text-xs">
          Monitoramento de recursos e limpeza de cache
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={checkResources}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Recursos problemáticos */}
        {problematicResources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              Recursos suspeitos ({problematicResources.length}):
            </p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {problematicResources.map((resource, index) => (
                <div
                  key={index}
                  className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded truncate"
                >
                  {resource}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Última limpeza */}
        {lastCleanup && (
          <div className="text-xs text-gray-400">
            Última limpeza: {lastCleanup.toLocaleTimeString()}
          </div>
        )}

        {/* Botão de limpeza */}
        <Button
          onClick={handleCleanup}
          disabled={isLoading}
          size="sm"
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3 mr-2" />
          )}
          {isLoading ? 'Limpando...' : 'Limpar Cache'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CacheStatus;
