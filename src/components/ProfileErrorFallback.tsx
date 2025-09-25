import React, { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  UserPlus,
  LogOut,
  Home
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ProfileErrorFallback = ({ 
  error, 
  onRetry, 
  showRetry = true 
}: ProfileErrorFallbackProps) => {
  const { user, profile, revalidateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [retryStatus, setRetryStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    setRetryStatus('idle');
    
    try {
      await onRetry();
      setRetryStatus('success');
      toast({
        title: "Perfil recarregado",
        description: "Seu perfil foi carregado com sucesso!",
      });
    } catch (error) {
      setRetryStatus('error');
      toast({
        title: "Erro ao recarregar",
        description: "Não foi possível recarregar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!user) return;
    
    setIsCreating(true);
    
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso.",
      });
      
      // Recarregar o perfil
      await revalidateProfile();
      
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast({
        title: "Erro ao criar perfil",
        description: "Não foi possível criar seu perfil. Tente fazer logout e login novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getStatusIcon = () => {
    switch (retryStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (retryStatus) {
      case 'success':
        return 'Perfil carregado com sucesso!';
      case 'error':
        return 'Erro ao recarregar perfil. Tente novamente.';
      default:
        return error || 'Não foi possível carregar seu perfil.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Problema com Perfil</CardTitle>
          <CardDescription className="mt-2">
            Não foi possível carregar seu perfil. Isso pode ser um problema temporário.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status do usuário */}
          {user && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Usuário Logado</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Email: {user.email}</div>
                <div>ID: {user.id.slice(0, 8)}...</div>
              </div>
            </div>
          )}

          {/* Status do perfil */}
          {profile ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Perfil Carregado</span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                <div>Nome: {profile.full_name || 'Não informado'}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span>Admin:</span>
                  <Badge variant={profile.is_admin ? 'default' : 'secondary'}>
                    {profile.is_admin ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">Perfil Não Encontrado</span>
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Seu perfil não foi encontrado no banco de dados.
              </div>
            </div>
          )}

          {/* Status da operação */}
          {retryStatus !== 'idle' && (
            <Alert>
              {getStatusIcon()}
              <AlertDescription>{getStatusMessage()}</AlertDescription>
            </Alert>
          )}

          {/* Ações */}
          <div className="space-y-3">
            {showRetry && (
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Recarregando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </>
                )}
              </Button>
            )}

            {!profile && (
              <Button 
                onClick={handleCreateProfile} 
                disabled={isCreating}
                variant="outline"
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <UserPlus className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Perfil
                  </>
                )}
              </Button>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleGoHome} 
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Página Inicial
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Fazer Logout
              </Button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Se o problema persistir, tente:</p>
            <ul className="mt-1 space-y-1">
              <li>• Fazer logout e login novamente</li>
              <li>• Limpar o cache do navegador</li>
              <li>• Verificar sua conexão com a internet</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileErrorFallback;
