import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export const SimpleAdminDebug = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>({});

  const updateDebugInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        is_admin: profile.is_admin,
        full_name: profile.full_name
      } : null,
      loading: {
        isLoading,
        isProfileLoading
      },
      localStorage: {
        hasAuth: !!localStorage.getItem('sb-fflomlvtgaqbzrjnvqaz-auth-token')
      }
    };
    
    console.log('🐛 Debug Info:', info);
    setDebugInfo(info);
  };

  useEffect(() => {
    updateDebugInfo();
  }, [user, profile, isLoading, isProfileLoading]);

  const testDirectProfileQuery = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return;
    }

    console.log('🔍 Testando query direta do perfil...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('📊 Resultado da query:', { data, error });

      if (error) {
        toast({
          title: "Erro na Query",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Query Bem-sucedida",
          description: `Perfil encontrado: ${data.email}, Admin: ${data.is_admin}`,
        });
      }
    } catch (error) {
      console.error('❌ Erro na query:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado na query",
        variant: "destructive"
      });
    }
  };

  const makeAdminDirect = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    console.log('🔧 Tornando usuário admin diretamente...');
    
    try {
      const { data, error } = await supabase.rpc('make_user_admin', {
        user_email: user.email
      });

      console.log('🔧 Resultado make_user_admin:', { data, error });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso!",
          description: "Usuário configurado como admin. Recarregando...",
        });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Simples do Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={updateDebugInfo} variant="outline">
            Atualizar Info
          </Button>
          <Button onClick={testDirectProfileQuery} variant="outline">
            Testar Query do Perfil
          </Button>
          <Button onClick={makeAdminDirect} variant="outline">
            Tornar Admin
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Status Atual:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="text-sm space-y-2">
          <div>
            <strong>Usuário:</strong> {user ? user.email : 'Não logado'}
          </div>
          <div>
            <strong>Perfil:</strong> {isProfileLoading ? 'Carregando...' : profile ? 'Carregado' : 'Não encontrado'}
          </div>
          <div>
            <strong>Admin:</strong> {profile?.is_admin ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
