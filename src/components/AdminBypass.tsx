import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminBypass = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdminInDB, setIsAdminInDB] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAdminStatus = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Erro ao verificar status de admin:', error);
        setIsAdminInDB(false);
      } else {
        setIsAdminInDB(profileData.is_admin);
        console.log('Status de admin no banco:', profileData.is_admin);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setIsAdminInDB(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkAdminStatus();
    }
  }, [user?.email]);

  const getStatusIcon = () => {
    if (isAdminInDB === null) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (isAdminInDB) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (isAdminInDB === null) return 'Verificando status de administrador...';
    if (isAdminInDB) return 'Você é administrador no banco de dados!';
    return 'Você não é administrador no banco de dados.';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verificação de Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          {getStatusIcon()}
          <AlertDescription>{getStatusMessage()}</AlertDescription>
        </Alert>

        {isAdminInDB && (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Você tem permissões de administrador no banco de dados. 
                O problema pode ser sincronização do perfil.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Tentar Acessar Admin
                </Link>
              </Button>
            </div>
          </div>
        )}

        {isAdminInDB === false && (
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription>
                Você não tem permissões de administrador no banco de dados.
              </AlertDescription>
            </Alert>
            
            <Button asChild className="w-full">
              <Link to="/admin-diagnostic">
                <Shield className="h-4 w-4 mr-2" />
                Configurar como Admin
              </Link>
            </Button>
          </div>
        )}

        <Button 
          onClick={checkAdminStatus} 
          disabled={isChecking}
          variant="outline"
          className="w-full"
        >
          {isChecking ? 'Verificando...' : 'Verificar Status'}
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          <p>Usuário: {user ? user.email : 'Não logado'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
