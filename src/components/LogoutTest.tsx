import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { LogOut, User, CheckCircle, AlertCircle } from 'lucide-react';

export const LogoutTest = () => {
  const { user, session, profile, signOut, isLoading } = useAuth();

  const handleLogout = async () => {
    console.log('[LogoutTest] Iniciando teste de logout');
    try {
      await signOut();
      console.log('[LogoutTest] Logout concluído');
    } catch (error) {
      console.error('[LogoutTest] Erro no logout:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Teste de Logout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Autenticação */}
        <div className="space-y-2">
          <h3 className="font-medium">Status da Autenticação:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {user ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Usuário: {user ? user.email : 'Não logado'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {session ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Sessão: {session ? 'Ativa' : 'Inativa'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {profile ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Perfil: {profile ? profile.full_name || 'Carregado' : 'Não carregado'}</span>
            </div>
          </div>
        </div>

        {/* Botão de Logout */}
        {user ? (
          <Button 
            onClick={handleLogout} 
            variant="destructive" 
            className="w-full"
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoading ? 'Fazendo logout...' : 'Fazer Logout'}
          </Button>
        ) : (
          <div className="text-center text-muted-foreground">
            Faça login primeiro para testar o logout
          </div>
        )}

        {/* Informações de Debug */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <div>Loading: {isLoading ? 'Sim' : 'Não'}</div>
          <div>User ID: {user?.id?.slice(0, 8) || 'N/A'}</div>
          <div>Session válida: {session?.access_token ? 'Sim' : 'Não'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoutTest;

