import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminProfileFix = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [fixStatus, setFixStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const forceProfileRefresh = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return;
    }

    setIsFixing(true);
    setFixStatus('idle');

    try {
      console.log('🔄 Forçando atualização do perfil para usuário admin...');
      
      // Primeiro, verificar se o usuário realmente é admin no banco
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: { is_admin: boolean } | null, error: any };

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        setFixStatus('error');
        toast({
          title: "Erro",
          description: `Erro ao buscar perfil: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Perfil encontrado no banco:', profileData);

      if (profileData.is_admin) {
        console.log('✅ Usuário é admin no banco, forçando atualização do contexto...');
        
        // Forçar atualização do contexto
        // Vamos recarregar a página para sincronizar o contexto
        toast({
          title: "Perfil Atualizado!",
          description: "Recarregando para sincronizar o contexto...",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        setFixStatus('success');
      } else {
        console.log('⚠️ Usuário não é admin no banco');
        setFixStatus('error');
        toast({
          title: "Aviso",
          description: "Usuário não tem permissões de administrador no banco de dados",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setFixStatus('error');
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar perfil",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  const clearAuthCache = async () => {
    try {
      console.log('🧹 Limpando cache de autenticação...');
      
      // Limpar localStorage
      // eslint-disable-next-line spellcheck/spell-checker
      const authKey = 'sb-fflomlvtgaqbzrjnvqaz-auth-token'; // ID do projeto Supabase
      localStorage.removeItem(authKey);
      
      // Fazer logout e login novamente
      await supabase.auth.signOut();
      
      toast({
        title: "Cache Limpo",
        description: "Faça login novamente para sincronizar o perfil",
      });
      
      // Redirecionar para login
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar cache de autenticação",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (fixStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getStatusMessage = () => {
    switch (fixStatus) {
      case 'success':
        return 'Perfil atualizado com sucesso!';
      case 'error':
        return 'Erro ao atualizar perfil';
      default:
        return 'Clique para forçar atualização do perfil';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Correção de Perfil Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Se você já é administrador mas não consegue acessar o painel, 
            o problema pode ser sincronização do perfil. Use as opções abaixo para corrigir.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button 
              onClick={forceProfileRefresh} 
              disabled={isFixing || !user}
              className="flex-1"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Forçar Atualização
                </>
              )}
            </Button>
          </div>

          <Button 
            onClick={clearAuthCache} 
            variant="outline"
            className="w-full"
          >
            Limpar Cache e Fazer Login Novamente
          </Button>
        </div>

        {fixStatus !== 'idle' && (
          <Alert>
            {getStatusIcon()}
            <AlertDescription>{getStatusMessage()}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Status atual:</strong></p>
          <p>• Usuário: {user ? user.email : 'Não logado'}</p>
          <p>• Perfil: {isProfileLoading ? 'Carregando...' : profile ? 'Carregado' : 'Não encontrado'}</p>
          <p>• Admin: {profile?.is_admin ? 'Sim' : 'Não'}</p>
          <p>• Loading: {isLoading ? 'Sim' : 'Não'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
