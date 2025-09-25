import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, UserCheck, Database, ExternalLink, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useAdminPermissionsRobust as useAdminPermissions } from '@/hooks/useAdminPermissionsRobust';

interface AdminAccessFallbackProps {
  onRetry?: () => void;
}

export const AdminAccessFallback: React.FC<AdminAccessFallbackProps> = ({ onRetry }) => {
  const { user, profile } = useAuth();
  const { isAdmin, isLoading, revalidatePermissions } = useAdminPermissions();

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await revalidatePermissions();
    }
  };

  const handleDiagnostic = () => {
    window.open('/admin-diagnostic', '_blank');
  };

  const handleEmergencyAccess = () => {
    // Mostrar modal de acesso de emergência
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Acesso de Emergência</h3>
        <p class="text-sm text-gray-600 mb-4">
          Se você é um administrador mas não consegue acessar, use esta opção para forçar o acesso.
        </p>
        <div class="flex gap-3">
          <button id="force-access" class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Forçar Acesso
          </button>
          <button id="close-modal" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
            Cancelar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#force-access')?.addEventListener('click', () => {
      if (user) {
        localStorage.setItem(`admin_${user.id}`, 'true');
        window.location.reload();
      }
    });
    
    modal.querySelector('#close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const handlePromoteToAdmin = async () => {
    if (!user) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao promover usuário:', error);
        return;
      }

      // Revalidar permissões
      await revalidatePermissions();
      
      // Recarregar página após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Problema de Acesso ao Painel Admin</CardTitle>
          <CardDescription>
            Não foi possível verificar suas permissões de administrador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Usuário</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'Não autenticado'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Perfil Admin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {profile?.is_admin ? 'Sim' : 'Não'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Hook Admin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Carregando...' : (isAdmin ? 'Sim' : 'Não')}
              </p>
            </div>
          </div>

          {/* Diagnóstico */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Possíveis causas:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Timeout na verificação de permissões</li>
                <li>• Problemas de conectividade com o banco de dados</li>
                <li>• Cache desatualizado de permissões</li>
                <li>• Usuário não tem permissões de admin</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Ações */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleRetry}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
              
              <Button 
                onClick={handleDiagnostic}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Diagnóstico Completo
              </Button>
              
              <Button 
                onClick={handleEmergencyAccess}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Acesso de Emergência
              </Button>
            </div>

            {/* Promover a admin se necessário */}
            {user && profile && !profile.is_admin && (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Usuário não é administrador
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Seu usuário não tem permissões de administrador. 
                      Clique no botão abaixo para promover a administrador.
                    </p>
                    <Button 
                      onClick={handlePromoteToAdmin}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Promover a Administrador
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Se é admin mas não está funcionando */}
            {user && profile?.is_admin && !isAdmin && !isLoading && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 mb-2">
                      Usuário é administrador
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Seu perfil indica que você é administrador, mas o sistema não está reconhecendo.
                      Tente limpar o cache e fazer logout/login novamente.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          localStorage.clear();
                          window.location.href = '/auth';
                        }}
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-100"
                      >
                        Limpar Cache e Fazer Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Se o problema persistir, acesse{' '}
              <button 
                onClick={handleDiagnostic}
                className="text-primary hover:underline"
              >
                /admin-diagnostic
              </button>{' '}
              para um diagnóstico completo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
