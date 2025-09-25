import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useAdminPermissionsRobust as useAdminPermissions } from '@/hooks/useAdminPermissionsRobust';
import { AccessDenied } from './AccessDenied';
import { AuthFallback } from './AuthFallback';
import { AdminAccessFallback } from './AdminAccessFallback';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/' 
}: ProtectedRouteProps) => {
  const { user, isLoading, isProfileLoading } = useAuth();
  const { isAdmin, isLoading: isPermissionLoading } = useAdminPermissions();
  const [authChecked, setAuthChecked] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Verificar autenticação de forma segura
  const authKey = 'wr-capacetes-auth';
  const hasStoredAuth = !!localStorage.getItem(authKey);
  
  useEffect(() => {
    if (!isLoading && !isProfileLoading && !isPermissionLoading) {
      setAuthChecked(true);
    }
  }, [isLoading, isProfileLoading, isPermissionLoading]);

  // Timeout geral para evitar ficar preso no loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!authChecked) {
        console.warn('⚠️ Timeout geral na autenticação, forçando fallback');
        setAuthTimeout(true);
      }
    }, 30000); // Aumentado para 30 segundos para dar mais tempo

    return () => clearTimeout(timeout);
  }, [authChecked]);

  // Se não há usuário mas há dados no localStorage, aguarda sincronização
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!user && hasStoredAuth && !isLoading) {
      console.log('ProtectedRoute - No user but localStorage has data, waiting for sync...');
      
      // Aguarda um pouco para o contexto sincronizar
      timer = setTimeout(() => {
        console.log('ProtectedRoute - Sync timeout, redirecting to auth');
        // Limpa o localStorage e redireciona para login
        localStorage.removeItem(authKey);
        window.location.href = '/auth';
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, hasStoredAuth, isLoading]);

  // Se houve timeout, mostra fallback apropriado
  if (authTimeout) {
    if (requireAdmin) {
      return (
        <AdminAccessFallback 
          onRetry={() => {
            setAuthTimeout(false);
            setAuthChecked(false);
          }}
        />
      );
    }
    return (
      <AuthFallback 
        error="Timeout na verificação de autenticação"
        onRetry={() => {
          setAuthTimeout(false);
          setAuthChecked(false);
        }}
      />
    );
  }

  // Mostra loading apenas durante a verificação inicial
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Carregando...</p>
            <p className="text-sm text-muted-foreground">Verificando autenticação</p>
            <p className="text-xs text-muted-foreground">
              Auth: {isLoading ? 'Carregando' : 'OK'} | 
              Profile: {isProfileLoading ? 'Carregando' : 'OK'} | 
              Permissions: {isPermissionLoading ? 'Carregando' : 'OK'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Se requer admin, verifica permissões
  if (requireAdmin) {
    console.log('ProtectedRoute - Checking admin permissions for user:', user.id);
    
    // Se ainda está carregando as permissões, mostra loading
    if (isPermissionLoading) {
      console.log('ProtectedRoute - Permissions still loading for user:', user.id);
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Carregando...</p>
              <p className="text-sm text-muted-foreground">Verificando permissões de administrador</p>
            </div>
          </div>
        </div>
      );
    }

    // Se o usuário tem permissão de admin, permite acesso
    if (isAdmin) {
      console.log('ProtectedRoute - User has admin access, allowing access to:', user.email);
      return <>{children}</>;
    }

    // Se o usuário não tem permissão de admin, mostra página de acesso negado
    console.log('ProtectedRoute - User does not have admin access, showing access denied for:', user.email);
    return <AccessDenied />;
  }

  console.log('ProtectedRoute - Allowing access for user:', user.email);
  return <>{children}</>;
};