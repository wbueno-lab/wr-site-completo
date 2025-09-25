import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, AlertTriangle, Database, User, Settings } from 'lucide-react';

interface DebugInfo {
  timestamp: string;
  user: any;
  profile: any;
  loading: {
    isLoading: boolean;
    isProfileLoading: boolean;
  };
  localStorage: {
    hasAuth: boolean;
    authData?: any;
  };
  database: {
    profileExists: boolean;
    profileData?: any;
    error?: string;
  };
}

export const AdminDebugAdvanced = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runDebug = async () => {
    setIsDebugging(true);
    
    try {
      console.log('🔍 Iniciando debug avançado...');
      
      const debugData: DebugInfo = {
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
          hasAuth: false,
          authData: null
        },
        database: {
          profileExists: false,
          profileData: null,
          error: undefined
        }
      };

      // Verificar localStorage
      const authKey = 'sb-fflomlvtgaqbzrjnvqaz-auth-token';
      const storedAuth = localStorage.getItem(authKey);
      if (storedAuth) {
        debugData.localStorage.hasAuth = true;
        try {
          debugData.localStorage.authData = JSON.parse(storedAuth);
        } catch (e) {
          debugData.localStorage.authData = { error: 'Invalid JSON' };
        }
      }

      // Verificar banco de dados
      if (user) {
        try {
          console.log('🔍 Verificando perfil no banco de dados...');
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            debugData.database.error = error.message;
            console.error('❌ Erro ao buscar perfil:', error);
          } else {
            debugData.database.profileExists = true;
            debugData.database.profileData = profileData;
            console.log('✅ Perfil encontrado no banco:', profileData);
          }
        } catch (error) {
          debugData.database.error = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('❌ Erro inesperado:', error);
        }
      }

      setDebugInfo(debugData);
      console.log('📊 Debug concluído:', debugData);
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      toast({
        title: "Erro no Debug",
        description: "Erro ao executar diagnóstico",
        variant: "destructive"
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const fixProfile = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔧 Tentando corrigir perfil...');
      
      // Verificar se o perfil existe no banco
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Perfil não existe, criar um
        console.log('📝 Criando novo perfil...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            is_admin: true, // Tornar admin por padrão
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar perfil:', createError);
          toast({
            title: "Erro",
            description: `Erro ao criar perfil: ${createError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ Perfil criado com sucesso:', newProfile);
          toast({
            title: "Sucesso!",
            description: "Perfil criado e configurado como admin. Recarregando...",
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else if (existingProfile) {
        // Perfil existe, atualizar para admin
        console.log('🔄 Atualizando perfil existente...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true,
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar perfil:', updateError);
          toast({
            title: "Erro",
            description: `Erro ao atualizar perfil: ${updateError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('✅ Perfil atualizado com sucesso');
          toast({
            title: "Sucesso!",
            description: "Perfil atualizado para admin. Recarregando...",
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
        description: "Erro inesperado ao corrigir perfil",
        variant: "destructive"
      });
    }
  };

  const clearCacheAndReload = async () => {
    try {
      console.log('🧹 Limpando cache e recarregando...');
      
      // Limpar localStorage
      const authKey = 'sb-fflomlvtgaqbzrjnvqaz-auth-token';
      localStorage.removeItem(authKey);
      
      toast({
        title: "Cache Limpo",
        description: "Recarregando aplicação...",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  };

  useEffect(() => {
    // Executar debug automaticamente quando o componente monta
    runDebug();
  }, [user, profile, isLoading, isProfileLoading]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Debug Avançado do Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDebug} 
              disabled={isDebugging}
              className="flex-1"
            >
              {isDebugging ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Debugando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Debug
                </>
              )}
            </Button>
            
            <Button 
              onClick={fixProfile} 
              variant="outline"
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Corrigir Perfil
            </Button>
            
            <Button 
              onClick={clearCacheAndReload} 
              variant="destructive"
              className="flex-1"
            >
              <Database className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Atual:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 p-4 rounded-lg text-sm font-mono text-green-400 overflow-auto max-h-96">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span><strong>Usuário:</strong> {debugInfo.user?.email || 'Não logado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span><strong>Perfil:</strong> {debugInfo.isProfileLoading ? 'Carregando...' : debugInfo.profile ? 'Carregado' : 'Não encontrado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span><strong>Admin:</strong> {debugInfo.profile?.is_admin ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span><strong>Loading:</strong> {debugInfo.loading.isLoading ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span><strong>Banco:</strong> {debugInfo.database.profileExists ? 'Perfil existe' : 'Perfil não existe'}</span>
              </div>
              {debugInfo.database.error && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span><strong>Erro:</strong> {debugInfo.database.error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
