import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useAdminPermissionsRobust as useAdminPermissions } from '@/hooks/useAdminPermissionsRobust';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, UserCheck, Database, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
  action?: () => void;
}

export const AdminAccessDiagnosticPage: React.FC = () => {
  const { user, session, profile } = useAuth();
  const { isAdmin, isLoading: isPermissionLoading, revalidatePermissions } = useAdminPermissions();
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addDiagnostic = (result: DiagnosticResult) => {
    setDiagnostics(prev => [...prev, result]);
  };

  const clearDiagnostics = () => {
    setDiagnostics([]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    clearDiagnostics();

    try {
      // 1. Verificar autenticação
      addDiagnostic({
        step: 'Autenticação',
        status: 'loading',
        message: 'Verificando autenticação...'
      });

      if (!user || !session) {
        addDiagnostic({
          step: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado',
          details: 'Faça login primeiro para acessar o painel admin'
        });
        return;
      }

      addDiagnostic({
        step: 'Autenticação',
        status: 'success',
        message: `Usuário autenticado: ${user.email}`,
        details: `ID: ${user.id.slice(0, 8)}...`
      });

      // 2. Verificar perfil
      addDiagnostic({
        step: 'Perfil do Usuário',
        status: 'loading',
        message: 'Verificando perfil...'
      });

      if (!profile) {
        addDiagnostic({
          step: 'Perfil do Usuário',
          status: 'error',
          message: 'Perfil não encontrado',
          details: 'O perfil pode não ter sido criado automaticamente'
        });
        return;
      }

      addDiagnostic({
        step: 'Perfil do Usuário',
        status: 'success',
        message: `Perfil encontrado: ${profile.full_name || 'Sem nome'}`,
        details: `Email: ${profile.email}`
      });

      // 3. Verificar permissões de admin
      addDiagnostic({
        step: 'Permissões de Admin',
        status: 'loading',
        message: 'Verificando permissões de admin...'
      });

      if (profile.is_admin) {
        addDiagnostic({
          step: 'Permissões de Admin',
          status: 'success',
          message: 'Usuário tem permissões de admin no perfil',
          details: 'is_admin = true'
        });
      } else {
        addDiagnostic({
          step: 'Permissões de Admin',
          status: 'error',
          message: 'Usuário NÃO tem permissões de admin',
          details: 'is_admin = false',
          action: () => promoteToAdmin()
        });
      }

      // 4. Verificar hook de permissões
      addDiagnostic({
        step: 'Hook de Permissões',
        status: 'loading',
        message: 'Verificando hook de permissões...'
      });

      if (isPermissionLoading) {
        addDiagnostic({
          step: 'Hook de Permissões',
          status: 'warning',
          message: 'Ainda carregando permissões...',
          details: 'Aguarde alguns segundos'
        });
      } else if (isAdmin) {
        addDiagnostic({
          step: 'Hook de Permissões',
          status: 'success',
          message: 'Hook confirma permissões de admin',
          details: 'isAdmin = true'
        });
      } else {
        addDiagnostic({
          step: 'Hook de Permissões',
          status: 'error',
          message: 'Hook não confirma permissões de admin',
          details: 'isAdmin = false'
        });
      }

      // 5. Testar acesso ao banco
      addDiagnostic({
        step: 'Acesso ao Banco',
        status: 'loading',
        message: 'Testando acesso ao banco de dados...'
      });

      try {
        const { data: adminTest, error: adminTestError } = await supabase
          .from('profiles')
          .select('id, email, is_admin')
          .eq('is_admin', true)
          .limit(1);

        if (adminTestError) {
          addDiagnostic({
            step: 'Acesso ao Banco',
            status: 'error',
            message: 'Erro ao acessar banco de dados',
            details: adminTestError.message
          });
        } else {
          addDiagnostic({
            step: 'Acesso ao Banco',
            status: 'success',
            message: 'Acesso ao banco funcionando',
            details: `${adminTest.length} admin(s) encontrado(s)`
          });
        }
      } catch (error) {
        addDiagnostic({
          step: 'Acesso ao Banco',
          status: 'error',
          message: 'Erro inesperado ao acessar banco',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      // 6. Verificar políticas RLS
      addDiagnostic({
        step: 'Políticas RLS',
        status: 'loading',
        message: 'Verificando políticas de segurança...'
      });

      try {
        const { data: rlsTest, error: rlsError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (rlsError) {
          addDiagnostic({
            step: 'Políticas RLS',
            status: 'warning',
            message: 'Possível problema com políticas RLS',
            details: rlsError.message
          });
        } else {
          addDiagnostic({
            step: 'Políticas RLS',
            status: 'success',
            message: 'Políticas RLS funcionando',
            details: 'Acesso à tabela profiles permitido'
          });
        }
      } catch (error) {
        addDiagnostic({
          step: 'Políticas RLS',
          status: 'error',
          message: 'Erro ao verificar políticas RLS',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

    } catch (error) {
      addDiagnostic({
        step: 'Diagnóstico Geral',
        status: 'error',
        message: 'Erro durante diagnóstico',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro ao promover usuário",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Usuário promovido a administrador!",
        description: "Faça logout e login novamente para aplicar as mudanças.",
        duration: 5000
      });

      // Revalidar permissões
      await revalidatePermissions();
      
      // Executar diagnóstico novamente
      setTimeout(() => runDiagnostics(), 1000);

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível promover o usuário",
        variant: "destructive"
      });
    }
  };

  const clearCache = async () => {
    try {
      // Limpar cache local
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('supabase') || key.includes('admin'))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Revalidar permissões
      await revalidatePermissions();

      toast({
        title: "Cache limpo!",
        description: "Recarregue a página para aplicar as mudanças.",
        duration: 3000
      });

    } catch (error) {
      toast({
        title: "Erro ao limpar cache",
        description: "Tente recarregar a página manualmente",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Aviso</Badge>;
      case 'loading':
        return <Badge variant="outline">Carregando</Badge>;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (user && !isRunning) {
      runDiagnostics();
    }
  }, [user, isAdmin]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Diagnóstico de Acesso ao Painel Admin</h1>
          <p className="text-muted-foreground">
            Esta página ajuda a diagnosticar e resolver problemas de acesso ao painel administrativo.
          </p>
        </div>

        {/* Status atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm">Usuário:</span>
                <span className="font-medium">{user?.email || 'Não autenticado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Perfil Admin:</span>
                <Badge variant={profile?.is_admin ? "default" : "destructive"}>
                  {profile?.is_admin ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Hook Admin:</span>
                <Badge variant={isAdmin ? "default" : "destructive"}>
                  {isPermissionLoading ? 'Carregando...' : (isAdmin ? 'Sim' : 'Não')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Use estas ações para resolver problemas de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
              </Button>
              
              {profile && !profile.is_admin && (
                <Button 
                  onClick={promoteToAdmin}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Promover a Admin
                </Button>
              )}
              
              <Button 
                onClick={clearCache}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Limpar Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados do diagnóstico */}
        {diagnostics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados do Diagnóstico</CardTitle>
              <CardDescription>
                Verificação detalhada do sistema de permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostics.map((diagnostic, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(diagnostic.status)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{diagnostic.step}</h4>
                        {getStatusBadge(diagnostic.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {diagnostic.message}
                      </p>
                      {diagnostic.details && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {diagnostic.details}
                        </p>
                      )}
                      {diagnostic.action && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={diagnostic.action}
                        >
                          Executar Ação
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Se você é um administrador mas não consegue acessar o painel:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Verifique se o campo <code>is_admin</code> está como <code>true</code> no seu perfil</li>
                    <li>• Limpe o cache do navegador e faça logout/login novamente</li>
                    <li>• Verifique se a URL está correta: <code>/admin</code></li>
                    <li>• Aguarde alguns segundos para o sistema verificar as permissões</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Para promover um usuário a administrador:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Use o botão "Promover a Admin" acima</li>
                    <li>• Ou execute no SQL: <code>UPDATE profiles SET is_admin = true WHERE email = 'usuario@exemplo.com'</code></li>
                    <li>• Após promover, o usuário deve fazer logout e login novamente</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
