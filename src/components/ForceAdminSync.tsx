import { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, RefreshCw, CheckCircle } from 'lucide-react';

export const ForceAdminSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const forceAdminSync = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);

    try {
      console.log('🔄 Forçando sincronização de admin...');
      
      // Verificar se o usuário é admin no banco
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        toast({
          title: "Erro",
          description: `Erro ao buscar perfil: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Perfil encontrado:', profileData);

      if (profileData.is_admin) {
        // Usuário é admin, vamos forçar a sincronização
        console.log('✅ Usuário é admin, forçando sincronização...');
        
        // Limpar cache e recarregar
        const authKey = 'sb-fflomlvtgaqbzrjnvqaz-auth-token';
        localStorage.removeItem(authKey);
        
        toast({
          title: "Sincronização Iniciada",
          description: "Recarregando para sincronizar o perfil de admin...",
        });
        
        // Recarregar a página
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        // Usuário não é admin, vamos torná-lo admin
        console.log('⚠️ Usuário não é admin, tornando admin...');
        
        const { data, error: adminError } = await supabase.rpc('make_user_admin', {
          user_email: user.email
        });

        if (adminError) {
          console.error('❌ Erro ao tornar admin:', adminError);
          toast({
            title: "Erro",
            description: `Erro ao tornar admin: ${adminError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ Usuário configurado como admin');
          toast({
            title: "Sucesso!",
            description: "Usuário configurado como administrador. Recarregando...",
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado na sincronização",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sincronização de Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Se você já é administrador mas não consegue acessar o painel, 
            clique no botão abaixo para forçar a sincronização do seu perfil.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={forceAdminSync} 
          disabled={isSyncing || !user}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sincronizar Perfil Admin
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          <p>Usuário: {user ? user.email : 'Não logado'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
