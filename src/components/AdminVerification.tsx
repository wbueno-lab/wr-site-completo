import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAdminPermissions } from '@/utils/adminUtils';

interface AdminVerificationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminVerification = ({ children, fallback }: AdminVerificationProps) => {
  const { user, profile, isProfileLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      if (profile?.is_admin !== undefined) {
        setIsAdmin(profile.is_admin);
        return;
      }

      // Se o perfil ainda não foi carregado, verificar diretamente no banco
      if (!isProfileLoading) {
        setIsVerifying(true);
        try {
          const result = await verifyAdminPermissions(user.id);
          setIsAdmin(result.isAdmin);
          
          if (result.error) {
            console.error('Admin verification error:', result.error);
          }
        } catch (error) {
          console.error('Error in admin verification:', error);
          setIsAdmin(false);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyAdminStatus();
  }, [user, profile, isProfileLoading]);

  // Mostra loading enquanto verifica
  if (isVerifying || (isProfileLoading && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Verificando...</p>
            <p className="text-sm text-muted-foreground">Confirmando permissões de administrador</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não é admin, mostra fallback ou acesso negado
  if (isAdmin === false) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissões de administrador.</p>
        </div>
      </div>
    );
  }

  // Se é admin, renderiza o conteúdo
  return <>{children}</>;
};
