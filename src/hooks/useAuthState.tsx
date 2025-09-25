import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false
  });

  const mountedRef = useRef(true);
  const initializationRef = useRef(false);

  // Função para atualizar o estado de forma segura
  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Função para obter sessão inicial de forma otimizada
  const getInitialSession = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      console.log('[AuthState] Obtendo sessão inicial...');
      
      // Timeout otimizado para evitar travamentos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Sessão demorou mais de 5s')), 5000);
      });
      
      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]);
      
      if (error) {
        console.error('[AuthState] Erro ao obter sessão:', error);
        updateState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });
        return;
      }

      const isAuthenticated = !!session?.user;
      
      updateState({
        user: session?.user ?? null,
        session,
        isAuthenticated,
        isLoading: false,
        isInitialized: true
      });

      console.log('[AuthState] Sessão inicial:', isAuthenticated ? 'Encontrada' : 'Não encontrada');
      
    } catch (error) {
      console.error('[AuthState] Erro na inicialização:', error);
      updateState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
      });
    }
  }, [updateState]);

  // Configurar listener de mudança de estado
  useEffect(() => {
    let subscription: any = null;

    const setupAuthListener = async () => {
      // Obter sessão inicial
      await getInitialSession();

      // Configurar listener apenas após inicialização
      subscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mountedRef.current) return;

          console.log('[AuthState] Estado alterado:', event, session?.user?.email || 'sem usuário');
          
          const isAuthenticated = !!session?.user;
          
          updateState({
            user: session?.user ?? null,
            session,
            isAuthenticated,
            isLoading: false
          });
        }
      );
    };

    setupAuthListener();

    return () => {
      mountedRef.current = false;
      if (subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, [getInitialSession, updateState]);

  // Função para forçar atualização do estado
  const refreshAuthState = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthState] Erro ao atualizar sessão:', error);
        return false;
      }

      const isAuthenticated = !!session?.user;
      
      updateState({
        user: session?.user ?? null,
        session,
        isAuthenticated,
        isLoading: false
      });

      return true;
    } catch (error) {
      console.error('[AuthState] Erro ao atualizar estado:', error);
      return false;
    }
  }, [updateState]);

  // Função para fazer logout
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      updateState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('[AuthState] Erro ao fazer logout:', error);
    }
  }, [updateState]);

  return {
    ...state,
    refreshAuthState,
    signOut
  };
};

export default useAuthState;