import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Home, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const AuthFallback = ({ error, onRetry, showRetry = true }: AuthFallbackProps) => {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Problema de Autenticação</CardTitle>
          <CardDescription className="mt-2">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              "Não foi possível verificar suas credenciais. Isso pode ser um problema temporário."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Possíveis soluções:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Verifique sua conexão com a internet</li>
                <li>Tente recarregar a página</li>
                <li>Faça logout e login novamente</li>
                <li>Limpe o cache do navegador</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            {showRetry && onRetry && (
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="flex-1"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Tentando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Início
            </Button>
            
            <Button 
              onClick={handleGoToLogin} 
              variant="outline" 
              className="flex-1"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="ghost" 
              size="sm"
            >
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

