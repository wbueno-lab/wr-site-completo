import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, User, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const AdminDiagnostic = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    console.log('🔍 Iniciando diagnóstico...');
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Verificar se usuário está logado
    console.log('🔍 Teste 1: Verificando autenticação...', { user: !!user, userEmail: user?.email });
    if (!user) {
      results.push({
        test: 'Autenticação',
        status: 'error',
        message: 'Usuário não está logado',
        details: { user: null }
      });
    } else {
      results.push({
        test: 'Autenticação',
        status: 'success',
        message: `Usuário logado: ${user.email}`,
        details: { userId: user.id, email: user.email }
      });
    }

    // Test 2: Verificar se perfil foi carregado
    console.log('🔍 Teste 2: Verificando perfil...', { 
      isProfileLoading, 
      profile: !!profile, 
      profileEmail: profile?.email,
      isAdmin: profile?.is_admin 
    });
    
    if (isProfileLoading) {
      results.push({
        test: 'Carregamento do Perfil',
        status: 'warning',
        message: 'Perfil ainda está carregando...',
        details: { isLoading: isProfileLoading }
      });
    } else if (!profile) {
      results.push({
        test: 'Perfil do Usuário',
        status: 'error',
        message: 'Perfil não foi encontrado no banco de dados',
        details: { profile: null }
      });
    } else {
      results.push({
        test: 'Perfil do Usuário',
        status: 'success',
        message: `Perfil carregado: ${profile.email}`,
        details: { 
          profileId: profile.id, 
          email: profile.email, 
          isAdmin: profile.is_admin,
          fullName: profile.full_name 
        }
      });
    }

    // Test 3: Verificar status de admin
    if (profile) {
      if (profile.is_admin) {
        results.push({
          test: 'Status de Administrador',
          status: 'success',
          message: 'Usuário tem permissões de administrador',
          details: { isAdmin: true }
        });
      } else {
        results.push({
          test: 'Status de Administrador',
          status: 'warning',
          message: 'Usuário NÃO tem permissões de administrador',
          details: { isAdmin: false }
        });
      }
    }

    // Test 4: Verificar função make_user_admin
    if (user?.email) {
      try {
        const { data, error } = await supabase.rpc('make_user_admin', {
          user_email: user.email
        });
        
        if (error) {
          results.push({
            test: 'Função make_user_admin',
            status: 'error',
            message: `Erro ao testar função: ${error.message}`,
            details: { error: error.message }
          });
        } else {
          results.push({
            test: 'Função make_user_admin',
            status: 'success',
            message: 'Função está disponível e funcionando',
            details: { result: data }
          });
        }
      } catch (error) {
        results.push({
          test: 'Função make_user_admin',
          status: 'error',
          message: `Erro inesperado: ${error}`,
          details: { error }
        });
      }
    }

    // Test 5: Verificar tabela profiles
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, is_admin')
        .eq('id', user?.id || '')
        .single();

      if (profilesError) {
        results.push({
          test: 'Acesso à Tabela Profiles',
          status: 'error',
          message: `Erro ao acessar tabela profiles: ${profilesError.message}`,
          details: { error: profilesError }
        });
      } else {
        results.push({
          test: 'Acesso à Tabela Profiles',
          status: 'success',
          message: 'Acesso à tabela profiles funcionando',
          details: { profileData: profilesData }
        });
      }
    } catch (error) {
      results.push({
        test: 'Acesso à Tabela Profiles',
        status: 'error',
        message: `Erro inesperado: ${error}`,
        details: { error }
      });
    }

    console.log('🔍 Diagnóstico concluído:', results);
    setDiagnostics(results);
    setIsRunning(false);
  };

  const forceLoadProfile = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return;
    }

    console.log('🔄 Forçando carregamento do perfil para:', user.id);
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        toast({
          title: "Erro",
          description: `Erro ao carregar perfil: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('✅ Perfil carregado com sucesso:', profileData);
        toast({
          title: "Sucesso",
          description: "Perfil recarregado com sucesso!",
        });
        // Recarregar a página para atualizar o contexto
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar perfil",
        variant: "destructive"
      });
    }
  };

  const makeUserAdmin = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('make_user_admin', {
        user_email: user.email
      });

      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao tornar usuário admin: ${error.message}`,
          variant: "destructive"
        });
      } else if (data) {
        toast({
          title: "Sucesso!",
          description: "Usuário configurado como administrador. Recarregue a página.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Aviso",
          description: "Usuário não encontrado no banco de dados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao configurar admin",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Aviso</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Diagnóstico do Sistema de Admin
          </CardTitle>
          <CardDescription>
            Verifique o status do sistema de autenticação e permissões de administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runDiagnostics} disabled={isRunning}>
              {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
            </Button>
            {user && isProfileLoading && (
              <Button onClick={forceLoadProfile} variant="outline">
                Forçar Carregamento do Perfil
              </Button>
            )}
            {user && !profile?.is_admin && (
              <Button onClick={makeUserAdmin} variant="outline">
                Tornar Admin
              </Button>
            )}
          </div>

          {diagnostics.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Resultados do Diagnóstico:</h4>
              {diagnostics.map((diagnostic, index) => (
                <Alert key={index}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(diagnostic.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{diagnostic.test}</span>
                        {getStatusBadge(diagnostic.status)}
                      </div>
                      <AlertDescription>{diagnostic.message}</AlertDescription>
                      {diagnostic.details && (
                        <details className="mt-2">
                          <summary className="text-sm text-muted-foreground cursor-pointer">
                            Ver detalhes
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(diagnostic.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Status Atual:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Usuário:</span>
                <p className="text-muted-foreground">
                  {user ? user.email : 'Não logado'}
                </p>
              </div>
              <div>
                <span className="font-medium">Perfil:</span>
                <p className="text-muted-foreground">
                  {isProfileLoading ? 'Carregando...' : profile ? 'Carregado' : 'Não encontrado'}
                </p>
              </div>
              <div>
                <span className="font-medium">Admin:</span>
                <p className="text-muted-foreground">
                  {profile?.is_admin ? 'Sim' : 'Não'}
                </p>
              </div>
              <div>
                <span className="font-medium">Loading:</span>
                <p className="text-muted-foreground">
                  {isLoading ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

