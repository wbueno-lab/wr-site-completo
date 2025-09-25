import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProfileErrorState {
  hasError: boolean;
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
}

export const useProfileError = () => {
  const { user, profile, revalidateProfile } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<ProfileErrorState>({
    hasError: false,
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      hasError: true,
      error,
      isRetrying: false
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0
    }));
  }, []);

  const retryProfileLoad = useCallback(async () => {
    if (!user) return false;
    
    setState(prev => ({
      ...prev,
      isRetrying: true
    }));

    try {
      // Tentar recarregar o perfil
      await revalidateProfile();
      
      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: prev.retryCount + 1
      }));

      toast({
        title: "Perfil recarregado",
        description: "Seu perfil foi carregado com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error);
      
      setState(prev => ({
        ...prev,
        hasError: true,
        error: 'Erro ao recarregar perfil',
        isRetrying: false,
        retryCount: prev.retryCount + 1
      }));

      toast({
        title: "Erro ao recarregar",
        description: "Não foi possível recarregar o perfil. Tente novamente.",
        variant: "destructive"
      });

      return false;
    }
  }, [user, revalidateProfile, toast]);

  const createProfile = useCallback(async () => {
    if (!user) return false;
    
    setState(prev => ({
      ...prev,
      isRetrying: true
    }));

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
      
      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        isRetrying: false
      }));

      toast({
        title: "Perfil criado!",
        description: "Seu perfil foi criado com sucesso.",
      });

      // Recarregar o perfil
      await revalidateProfile();
      
      return true;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      
      setState(prev => ({
        ...prev,
        hasError: true,
        error: 'Erro ao criar perfil',
        isRetrying: false
      }));

      toast({
        title: "Erro ao criar perfil",
        description: "Não foi possível criar seu perfil. Tente fazer logout e login novamente.",
        variant: "destructive"
      });

      return false;
    }
  }, [user, revalidateProfile, toast]);

  const forceProfileRefresh = useCallback(async () => {
    if (!user) return false;
    
    setState(prev => ({
      ...prev,
      isRetrying: true
    }));

    try {
      // Limpar cache e forçar nova busca
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        isRetrying: false
      }));

      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      setState(prev => ({
        ...prev,
        hasError: true,
        error: 'Erro ao atualizar perfil',
        isRetrying: false
      }));

      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });

      return false;
    }
  }, [user, toast]);

  return {
    ...state,
    setError,
    clearError,
    retryProfileLoad,
    createProfile,
    forceProfileRefresh,
    canRetry: state.retryCount < 3,
    shouldShowFallback: state.hasError && !state.isRetrying
  };
};

export default useProfileError;
