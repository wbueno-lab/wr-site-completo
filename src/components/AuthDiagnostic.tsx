import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ENV } from '@/config/env';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export const AuthDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      loading: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    
    return (
      <Badge className={`${variants[status]} border`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const updateResult = (name: string, updates: Partial<DiagnosticResult>) => {
    setResults(prev => prev.map(result => 
      result.name === name 
        ? { ...result, ...updates }
        : result
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    // Inicializar resultados
    const initialResults: DiagnosticResult[] = [
      { name: 'Variáveis de Ambiente', status: 'loading', message: 'Verificando...' },
      { name: 'Conectividade Supabase', status: 'loading', message: 'Testando...' },
      { name: 'Autenticação Supabase', status: 'loading', message: 'Verificando...' },
      { name: 'Storage Local', status: 'loading', message: 'Analisando...' },
      { name: 'Sessão Atual', status: 'loading', message: 'Verificando...' }
    ];
    
    setResults(initialResults);

    try {
      // 1. Verificar variáveis de ambiente
      if (ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY) {
        updateResult('Variáveis de Ambiente', {
          status: 'success',
          message: 'Configuradas corretamente',
          details: `URL: ${ENV.SUPABASE_URL.slice(0, 30)}...`
        });
      } else {
        updateResult('Variáveis de Ambiente', {
          status: 'error',
          message: 'Variáveis não configuradas',
          details: 'SUPABASE_URL ou SUPABASE_ANON_KEY ausentes'
        });
      }

      // 2. Testar conectividade com Supabase
      try {
        const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': ENV.SUPABASE_ANON_KEY
          }
        });
        
        if (response.ok) {
          updateResult('Conectividade Supabase', {
            status: 'success',
            message: 'Conexão estabelecida',
            details: `Status: ${response.status}`
          });
        } else {
          updateResult('Conectividade Supabase', {
            status: 'error',
            message: 'Erro de conexão',
            details: `Status: ${response.status} - ${response.statusText}`
          });
        }
      } catch (error) {
        updateResult('Conectividade Supabase', {
          status: 'error',
          message: 'Falha na conexão',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      // 3. Testar autenticação Supabase
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          updateResult('Autenticação Supabase', {
            status: 'error',
            message: 'Erro no sistema de auth',
            details: error.message
          });
        } else {
          updateResult('Autenticação Supabase', {
            status: 'success',
            message: data.session ? 'Usuário logado' : 'Sistema funcionando',
            details: data.session ? `User: ${data.session.user.email}` : 'Nenhuma sessão ativa'
          });
        }
      } catch (error) {
        updateResult('Autenticação Supabase', {
          status: 'error',
          message: 'Falha no sistema de auth',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      // 4. Verificar storage local
      try {
        const authData = localStorage.getItem('wr-capacetes-auth');
        const supabaseData = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth')
        );
        
        updateResult('Storage Local', {
          status: 'success',
          message: 'Acessível',
          details: `Chaves encontradas: ${supabaseData.length} | Auth data: ${authData ? 'Presente' : 'Ausente'}`
        });
      } catch (error) {
        updateResult('Storage Local', {
          status: 'error',
          message: 'Erro no localStorage',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      // 5. Verificar sessão atual
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          updateResult('Sessão Atual', {
            status: 'success',
            message: 'Sessão ativa',
            details: `Expira em: ${new Date(sessionData.session.expires_at || 0).toLocaleString()}`
          });
        } else {
          updateResult('Sessão Atual', {
            status: 'warning',
            message: 'Nenhuma sessão ativa',
            details: 'Usuário não está logado'
          });
        }
      } catch (error) {
        updateResult('Sessão Atual', {
          status: 'error',
          message: 'Erro ao verificar sessão',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

    } catch (error) {
      console.error('Erro no diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <CardTitle>Diagnóstico de Autenticação</CardTitle>
        </div>
        <CardDescription>
          Verificação do sistema de login e conectividade
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Resultados dos Testes</h3>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Executar Novamente
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{result.name}</span>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.message}
                </p>
                {result.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {result.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">Próximos Passos:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Se houver erros de conectividade, verifique sua conexão de internet</li>
            <li>• Para erros de autenticação, tente limpar o cache do navegador</li>
            <li>• Se persistir, verifique as configurações do Supabase</li>
            <li>• Contate o suporte se todos os testes falharem</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

