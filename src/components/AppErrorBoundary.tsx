import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AppErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleNavigateHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado</h1>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
                <p className="text-sm font-mono whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>

              <p className="text-muted-foreground mb-6">
                Desculpe pelo inconveniente. Você pode tentar:
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={this.handleReload} className="flex-1">
                  🔄 Recarregar Página
                </Button>
                <Button variant="outline" onClick={this.handleNavigateHome} className="flex-1">
                  🏠 Ir para Página Inicial
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Detalhes técnicos
                  </summary>
                  <pre className="mt-2 text-xs bg-muted/50 p-4 rounded-lg overflow-auto max-h-60">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppErrorBoundary = (props: Props) => {
  return <AppErrorBoundaryClass {...props} />;
};

export default AppErrorBoundary;

