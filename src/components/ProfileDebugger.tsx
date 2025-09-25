import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProfileDebugger = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testProfileQuery = async () => {
    if (!user) {
      addLog('❌ Nenhum usuário logado');
      return;
    }

    addLog(`🧪 Testando query de perfil para usuário: ${user.id}`);
    
    try {
      addLog('🔄 Executando query SELECT...');
      
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (queryError) {
        addLog(`❌ Erro na query: ${queryError.message}`);
        addLog(`❌ Código do erro: ${queryError.code}`);
        addLog(`❌ Detalhes: ${queryError.details}`);
        addLog(`❌ Hint: ${queryError.hint}`);
        setError(queryError.message);
      } else {
        addLog('✅ Query executada com sucesso');
        addLog(`📊 Dados retornados: ${JSON.stringify(data, null, 2)}`);
        setProfileData(data);
        setError(null);
      }
    } catch (err) {
      addLog(`❌ Erro inesperado: ${err}`);
      setError(String(err));
    }
  };

  const testAuthUser = async () => {
    if (!user) {
      addLog('❌ Nenhum usuário logado');
      return;
    }

    addLog(`🧪 Testando auth.getUser() para: ${user.email}`);
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addLog(`❌ Erro no auth.getUser(): ${authError.message}`);
      } else {
        addLog(`✅ auth.getUser() executado com sucesso`);
        addLog(`📊 Usuário autenticado: ${JSON.stringify(authUser, null, 2)}`);
      }
    } catch (err) {
      addLog(`❌ Erro inesperado no auth.getUser(): ${err}`);
    }
  };

  const testSession = async () => {
    addLog('🧪 Testando auth.getSession()...');
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog(`❌ Erro no auth.getSession(): ${sessionError.message}`);
      } else {
        addLog(`✅ auth.getSession() executado com sucesso`);
        addLog(`📊 Sessão: ${session ? 'Ativa' : 'Inativa'}`);
        if (session) {
          addLog(`📊 Usuário da sessão: ${session.user.email}`);
          addLog(`📊 Token expira em: ${new Date(session.expires_at! * 1000).toLocaleString()}`);
        }
      }
    } catch (err) {
      addLog(`❌ Erro inesperado no auth.getSession(): ${err}`);
    }
  };

  const createTestProfile = async () => {
    if (!user) {
      addLog('❌ Nenhum usuário logado');
      return;
    }

    addLog(`🧪 Criando perfil de teste para: ${user.id}`);
    
    try {
      const testProfile = {
        id: user.id,
        email: user.email!,
        full_name: 'Usuário Teste',
        phone: null,
        avatar_url: null,
        address: null,
        is_admin: false,
        preferences: {}
      };

      const { data, error: insertError } = await supabase
        .from('profiles')
        .upsert(testProfile)
        .select()
        .single();

      if (insertError) {
        addLog(`❌ Erro ao criar perfil: ${insertError.message}`);
        addLog(`❌ Código: ${insertError.code}`);
      } else {
        addLog('✅ Perfil criado/atualizado com sucesso');
        addLog(`📊 Perfil criado: ${JSON.stringify(data, null, 2)}`);
        setProfileData(data);
      }
    } catch (err) {
      addLog(`❌ Erro inesperado ao criar perfil: ${err}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setError(null);
    setProfileData(null);
  };

  // Log automático das mudanças de estado
  useEffect(() => {
    addLog(`🔄 Estado do usuário mudou: ${user ? user.email : 'null'}`);
  }, [user]);

  useEffect(() => {
    addLog(`🔄 Estado do perfil mudou: ${profile ? 'carregado' : 'null'}`);
  }, [profile]);

  useEffect(() => {
    addLog(`🔄 Estado de loading mudou: isLoading=${isLoading}, isProfileLoading=${isProfileLoading}`);
  }, [isLoading, isProfileLoading]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Debug do Perfil
            <Badge variant={error ? "destructive" : "default"}>
              {error ? "Erro" : "OK"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Atual */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Estado Atual:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</p>
                <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
                <p><strong>Perfil:</strong> {profile ? 'Carregado' : 'Não carregado'}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}</p>
                <p><strong>Profile Loading:</strong> {isProfileLoading ? 'Sim' : 'Não'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Dados do Perfil:</h4>
              {profileData ? (
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> {profileData.full_name || 'N/A'}</p>
                  <p><strong>Admin:</strong> {profileData.is_admin ? 'Sim' : 'Não'}</p>
                  <p><strong>Criado:</strong> {new Date(profileData.created_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado carregado</p>
              )}
            </div>
          </div>

          {/* Botões de Teste */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testProfileQuery} variant="default" size="sm">
              Testar Query de Perfil
            </Button>
            <Button onClick={testAuthUser} variant="outline" size="sm">
              Testar Auth.getUser()
            </Button>
            <Button onClick={testSession} variant="outline" size="sm">
              Testar Auth.getSession()
            </Button>
            <Button onClick={createTestProfile} variant="secondary" size="sm">
              Criar Perfil de Teste
            </Button>
            <Button onClick={clearLogs} variant="ghost" size="sm">
              Limpar Logs
            </Button>
          </div>

          {/* Logs */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
            <div className="font-bold mb-2 text-white">Logs de Debug:</div>
            {logs.length === 0 ? (
              <div className="text-gray-500">Clique em um botão para iniciar os testes</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 break-all">{log}</div>
              ))
            )}
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-900 text-red-100 p-3 rounded-lg">
              <h4 className="font-semibold mb-2">Erro:</h4>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDebugger;
