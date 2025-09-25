import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, waitForSupabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useConnectivity } from '@/hooks/useConnectivity';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: any;
  is_admin: boolean;
  preferences: any;
}

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [lastAuthEvent, setLastAuthEvent] = useState<string>('');
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);
  const [authEventQueue, setAuthEventQueue] = useState<Array<{ event: string; session: any; timestamp: number }>>([]);
  const { toast } = useToast();
  const { 
    executeWithRetry, 
    testSupabaseConnectivity,
    isOnline 
  } = useConnectivity();

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const loadProfile = async (userId: string) => {
      if (!mounted || !userId) return;
      
      setIsProfileLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('[Auth] Erro ao carregar perfil:', profileError);
          
          // Se perfil não existe, criar um básico
          if (profileError.code === 'PGRST116') {
            console.log('[Auth] Perfil não encontrado, criando perfil básico...');
            
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  email: user?.email || '',
                  full_name: user?.user_metadata?.full_name || '',
                  is_admin: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();
              
              if (createError) {
                console.error('[Auth] Erro ao criar perfil:', createError);
                if (mounted) {
                  setProfile(null);
                }
              } else {
                console.log('[Auth] Perfil criado com sucesso');
                if (mounted) {
                  setProfile(newProfile);
                }
              }
            } catch (createError) {
              console.error('[Auth] Erro inesperado ao criar perfil:', createError);
              if (mounted) {
                setProfile(null);
              }
            }
          } else {
            // Outros erros
            if (mounted) {
              setProfile(null);
            }
          }
          return;
        }

        if (mounted && profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[Auth] Erro inesperado ao carregar perfil:', error);
        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setIsProfileLoading(false);
        }
      }
    };

    const initialize = async () => {
      try {
        setIsLoading(true);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Erro ao obter sessão:', error);
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        if (session?.user && mounted) {
          console.log('[Auth] Sessão encontrada para:', session.user.email);
          setSession(session);
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          console.log('[Auth] Nenhuma sessão ativa encontrada');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const currentTime = Date.now();
      const eventKey = `${event}-${session?.user?.id || 'null'}`;
      
      // Debounce: ignorar eventos duplicados em menos de 500ms
      if (eventKey === lastAuthEvent && (currentTime - lastAuthTime) < 500) {
        console.log('[Auth] Ignorando evento duplicado (debounce)');
        return;
      }

      // Adicionar evento à fila para processamento
      setAuthEventQueue(prev => [...prev, { event, session, timestamp: currentTime }]);

      setLastAuthEvent(eventKey);
      setLastAuthTime(currentTime);

      console.log('[Auth] Estado alterado:', event, session?.user?.email || 'sem usuário');
      
      // Evitar processamento duplicado se o estado não mudou realmente
      const isStateUnchanged = (
        (event === 'TOKEN_REFRESHED' && session?.user?.id === user?.id) ||
        (event === 'SIGNED_IN' && session?.user?.id === user?.id)
      );
      
      if (isStateUnchanged) {
        console.log('[Auth] Ignorando evento duplicado (estado inalterado)');
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('[Auth] Processando logout via listener');
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Garantir limpeza adicional no logout
        try {
          localStorage.removeItem('wr-capacetes-auth');
          const authKeys = Object.keys(localStorage).filter(key => 
            key.includes('auth') || key.includes('supabase')
          );
          authKeys.forEach(key => localStorage.removeItem(key));
        } catch (e) {
          console.warn('[Auth] Erro ao limpar storage no listener:', e);
        }
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('[Auth] Processando login/refresh via listener');
        
        // Verificar se já temos os dados atualizados
        if (session?.user?.id === user?.id && profile?.id === user?.id) {
          console.log('[Auth] Dados já atualizados, ignorando');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      }
    });

    authSubscription = subscription;

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [toast]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('[Auth] Iniciando cadastro:', email);
      
      const redirectUrl = `${window.location.origin}/auth?tab=login`;
      console.log('[Auth] URL de redirecionamento:', redirectUrl);
      
      // Cadastro no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
            email: email
          }
        }
      });

      if (error) {
        console.error('[Auth] Erro no cadastro:', error);
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      console.log('[Auth] Resposta do cadastro:', data);
      
      // Verificar se o email já existe
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está em uso. Tente fazer login.",
          variant: "destructive"
        });
        return { error: new Error('Email já cadastrado') };
      }

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta. Se não receber, verifique a pasta de spam.",
        duration: 10000
      });

      return { error: null };
    } catch (error) {
      console.error('[Auth] Erro inesperado no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const getAuthErrorMessage = (error: any): string => {
    const message = error?.message || '';
    
    // Mapeamento de mensagens de erro
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada e a pasta de spam.',
      'Too many requests': 'Muitas tentativas. Por favor, aguarde alguns minutos.',
      'Invalid email': 'Email inválido. Verifique se digitou corretamente.',
      'Password should be': 'A senha deve ter pelo menos 6 caracteres.',
      'User already registered': 'Este email já está cadastrado. Tente fazer login.',
      'Network request failed': 'Erro de conexão. Verifique sua internet.',
      'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
      'Service unavailable': 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
      'Database connection error': 'Erro de conexão com o banco de dados. Tente novamente em alguns minutos.'
    };

    // Procurar por correspondências parciais
    for (const [key, value] of Object.entries(errorMap)) {
      if (message.includes(key)) {
        return value;
      }
    }

    // Mensagem genérica para erros não mapeados
    return 'Ocorreu um erro. Por favor, tente novamente.';
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[Auth] Tentando login:', email);
      
      // Validações básicas
      if (!email || !email.includes('@')) {
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido",
          variant: "destructive"
        });
        return { error: new Error('Email inválido') };
      }

      if (!password || password.length < 6) {
        toast({
          title: "Senha inválida",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive"
        });
        return { error: new Error('Senha inválida') };
      }

      // Verificar conectividade com Supabase
      if (!isOnline) {
        const { success, error: connectivityError } = await testSupabaseConnectivity();
        if (!success) {
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao servidor. Verifique sua internet.",
            variant: "destructive"
          });
          return { error: new Error(connectivityError || 'Erro de conectividade') };
        }
      }

      // Tentar login (sem retry automático)
      try {
        const { data, error } = await executeWithRetry(
          () => supabase.auth.signInWithPassword({ email, password }),
          {
            timeoutMs: 8000, // Reduzido para 8 segundos
            checkConnectivity: false
          }
        );

        if (error) {
          console.error('[Auth] Erro no login:', error);
          toast({
            title: "Erro no login",
            description: getAuthErrorMessage(error),
            variant: "destructive"
          });
          return { error };
        }

        console.log('[Auth] Login bem-sucedido para:', data.user?.email);
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!"
        });

        return { error: null };
      } catch (error) {
        // O executeWithRetry já lidou com as tentativas, então este é um erro final
        console.error('[Auth] Erro crítico no login:', error);
        toast({
          title: "Erro no login",
          description: getAuthErrorMessage(error),
          variant: "destructive"
        });
        return { error };
      }
    } catch (error) {
      console.error('[Auth] Erro inesperado no login:', error);
      toast({
        title: "Erro no login",
        description: getAuthErrorMessage(error),
        variant: "destructive"
      });
      return { error };
    }
  };

  const clearAuthStorage = () => {
    try {
      // Lista de chaves específicas para remover
      const keysToRemove = [
        'wr-capacetes-auth',
        'sb-fflomlvtgaqbzrjnvqaz-auth-token',
        'supabase.auth.token',
        'supabase.auth.refreshToken',
        'supabase.auth.user'
      ];
      
      // Limpar chaves específicas
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Limpar todas as chaves relacionadas à autenticação
      [localStorage, sessionStorage].forEach(storage => {
        for (let i = storage.length - 1; i >= 0; i--) {
          const key = storage.key(i);
          if (key && (
            key.includes('auth') || 
            key.includes('supabase') || 
            key.includes('sb-')
          )) {
            storage.removeItem(key);
          }
        }
      });
      
      console.log('[Auth] Storage limpo com sucesso');
    } catch (error) {
      console.warn('[Auth] Erro ao limpar storage:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Iniciando processo de logout');
      
      // Limpar estados imediatamente para UI responsiva
      setUser(null);
      setSession(null);
      setProfile(null);

      // Limpar storage antes do logout do Supabase
      clearAuthStorage();

      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      console.log('[Auth] Logout realizado com sucesso');
      
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });

      // Aguardar um momento para garantir que o toast seja exibido
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar reload completo da página
      window.location.replace('/');
      
    } catch (error) {
      console.error('[Auth] Erro no processo de logout:', error);
      
      // Garantir limpeza mesmo em caso de erro
      setUser(null);
      setSession(null);
      setProfile(null);
      clearAuthStorage();
      
      toast({
        title: "Erro no logout",
        description: "Sessão local limpa. A página será recarregada.",
        variant: "destructive",
        duration: 3000
      });
      
      // Aguardar o toast e forçar reload
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.replace('/');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') };
    }

    try {
      // Sanitizar dados e remover campos que não devem ser atualizados
      const sanitizedUpdates = Object.entries(updates).reduce<Record<string, unknown>>((acc, [key, value]) => {
        // Não permitir atualização de campos críticos
        if (['id', 'created_at'].includes(key)) {
          return acc;
        }
        
        if (typeof value === 'string') {
          // Remover caracteres perigosos e limitar tamanho
          const sanitized = value.trim().slice(0, 255).replace(/[<>]/g, '');
          if (sanitized.length > 0) {
            acc[key] = sanitized;
          }
        } else if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Verificar se há dados válidos para atualizar
      if (Object.keys(sanitizedUpdates).length === 0) {
        return { error: new Error('Nenhum dado válido para atualizar') };
      }

      // Adicionar metadados
      const updatesWithMeta = {
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatesWithMeta)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas."
      });

      return { error: null };
    } catch (error) {
      console.error('[Auth] Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Tente novamente",
        variant: "destructive"
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isProfileLoading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};