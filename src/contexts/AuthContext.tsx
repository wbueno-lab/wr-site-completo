import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';


type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type ProfileUpdate = Tables['profiles']['Update'];
type ProfileHistory = Tables['profile_history']['Insert'];

type ProfileUpdateData = Partial<Omit<Profile, 'id' | 'created_at'>> & {
  updated_at?: string;
  last_modified_by?: string;
};

type SupabaseResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

type ProfileUpdatePayload = Tables['profiles']['Update'];
type ProfileHistoryPayload = Tables['profile_history']['Insert'];

type SupabaseProfileQuery = {
  select: () => SupabaseProfileQuery;
  eq: (column: string, value: string) => SupabaseProfileQuery;
  single: () => Promise<SupabaseProfileResponse>;
  update: (data: ProfileUpdatePayload) => SupabaseProfileQuery;
};

type SupabaseProfileHistoryQuery = {
  insert: (data: ProfileHistoryPayload) => Promise<SupabaseProfileHistoryResponse>;
};




type ProfileResponse = {
  data: Profile | null;
  error: PostgrestError | null;
};

type SupabaseProfileResponse = {
  data: Profile | null;
  error: PostgrestError | null;
};

type SupabaseProfileHistoryResponse = {
  data: ProfileHistoryPayload | null;
  error: PostgrestError | null;
};


interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { toast } = useToast();

  // Cache para perfil do usuário
  const profileCache = useRef<{
    id: string;
    data: Profile;
    timestamp: number;
  } | null>(null);

  // Tempo de expiração do cache (5 minutos)
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  useEffect(() => {
    let mounted = true;
    let initializationComplete = false;

    // Fetch user profile helper
  const fetchUserProfile = async (userId: string, retryCount = 0) => {
      if (!mounted) return;

      // Verificar cache
      if (profileCache.current && 
          profileCache.current.id === userId && 
          Date.now() - profileCache.current.timestamp < CACHE_EXPIRATION) {
        console.log('Using cached profile data');
        setProfile(profileCache.current.data);
        return;
      }
      
      setIsProfileLoading(true);
      try {
        console.log('Fetching profile for user:', userId.slice(0, 8) + '...', 'attempt:', retryCount + 1);
        const { data: profileData, error }: SupabaseProfileResponse = await (supabase
          .from('profiles') as unknown as SupabaseProfileQuery)
          .select()
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          if (error.code === 'PGRST116') {
            console.log('Profile not found for user:', userId);
            if (mounted) {
              setProfile(null);
            }
          } else if (retryCount < 3) {
            // Retry with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            console.log(`Retrying in ${delay}ms...`);
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(userId, retryCount + 1);
              }
            }, delay);
            return;
          } else {
            console.error('Max retries reached for profile fetch');
            if (mounted) {
              setProfile(null);
              toast({
                title: "Erro ao carregar perfil",
                description: "Não foi possível carregar seu perfil. Tente novamente mais tarde.",
                variant: "destructive"
              });
            }
          }
        } else {
          console.log('Profile loaded:', { id: profileData?.id?.slice(0, 8) + '...', is_admin: profileData?.is_admin });
          if (mounted && profileData) {
            // Atualizar cache
            profileCache.current = {
              id: userId,
              data: profileData as Profile,
              timestamp: Date.now()
            };
            setProfile(profileData as Profile);
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        if (retryCount < 3) {
          // Retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`Retrying in ${delay}ms...`);
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(userId, retryCount + 1);
            }
          }, delay);
          return;
        } else {
          console.error('Max retries reached for profile fetch');
          if (mounted) {
            setProfile(null);
            toast({
              title: "Erro ao carregar perfil",
              description: "Não foi possível carregar seu perfil. Tente novamente mais tarde.",
              variant: "destructive"
            });
          }
        }
      } finally {
        if (mounted && retryCount === 0) {
          setIsProfileLoading(false);
        }
      }
    };

    // Get initial session with retry logic
    const getInitialSession = async (retryCount = 0) => {
      try {
        console.log('Getting initial session... (attempt', retryCount + 1, ')');
        
        // First, check localStorage directly
        const authKey = 'wr-capacetes-auth';
        const storedAuth = localStorage.getItem(authKey);
        console.log('LocalStorage auth data:', storedAuth ? 'Present' : 'Not found');
        
        if (storedAuth) {
          try {
            const parsedAuth = JSON.parse(storedAuth);
            console.log('Parsed auth data:', parsedAuth);
            console.log('Current user in storage:', parsedAuth.current_user);
            console.log('Access token in storage:', parsedAuth.access_token ? 'Present' : 'Missing');
          } catch (e) {
            console.error('Error parsing stored auth:', e);
          }
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session:', session ? 'Found' : 'Not found');
          if (session?.user) {
            console.log('User from session:', session.user.email);
          }
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else if (storedAuth) {
            // If no session but we have stored auth data, try to refresh
            console.log('No session found but localStorage has data, attempting refresh...');
            try {
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError) {
                console.error('Error refreshing session:', refreshError);
              } else if (refreshedSession) {
                console.log('Session refreshed successfully:', refreshedSession.user?.email);
                setSession(refreshedSession);
                setUser(refreshedSession.user);
                if (refreshedSession.user) {
                  await fetchUserProfile(refreshedSession.user.id);
                }
              }
            } catch (refreshErr) {
              console.error('Error during session refresh:', refreshErr);
            }
          }
          
          // Add a small delay to ensure state is properly set
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
              initializationComplete = true;
              console.log('Auth initialization complete');
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          // If there's an error, retry once after a short delay
          if (retryCount < 1) {
            console.log('Retrying auth initialization...');
            setTimeout(() => getInitialSession(retryCount + 1), 500);
          } else {
            setIsLoading(false);
            initializationComplete = true;
          }
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
          
          // Only set loading to false if initialization is complete
          if (initializationComplete) {
            setIsLoading(false);
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error: any }> => {
    try {
      // Validações básicas
      if (!email || !email.includes('@')) {
        return { error: new Error('Email inválido') };
      }
      if (!password || password.length < 8) {
        return { error: new Error('A senha deve ter pelo menos 8 caracteres') };
      }

      const redirectUrl = `${window.location.origin}/auth?tab=login`;
      
      // Adicionar rate limiting
      const signupAttempts = JSON.parse(localStorage.getItem('signupAttempts') || '[]');
      const recentAttempts = signupAttempts.filter((timestamp: number) => 
        Date.now() - timestamp < 3600000 // 1 hora
      );
      
      if (recentAttempts.length >= 5) {
        return { error: new Error('Muitas tentativas de cadastro. Tente novamente mais tarde.') };
      }

      // Registrar tentativa
      localStorage.setItem('signupAttempts', JSON.stringify([...recentAttempts, Date.now()]));
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            signup_date: new Date().toISOString(),
            last_login: new Date().toISOString()
          }
        }
      });
      
      if (error) {
        console.error('Erro no cadastro:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Verificar se o email já está em uso
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
        description: "Um email de confirmação foi enviado para " + email + ". Por favor, verifique também sua pasta de spam. O link de confirmação expira em 24 horas.",
        duration: 10000 // Mostrar por 10 segundos
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: any }> => {
    try {
      // Validações básicas
      if (!email || !email.includes('@')) {
        return { error: new Error('Email inválido') };
      }
      if (!password) {
        return { error: new Error('Senha é obrigatória') };
      }

      // Rate limiting para tentativas de login
      const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
      const recentAttempts = loginAttempts.filter((attempt: { timestamp: number, email: string }) => 
        Date.now() - attempt.timestamp < 900000 // 15 minutos
      );
      
      const attemptsForEmail = recentAttempts.filter((attempt: { email: string }) => 
        attempt.email === email
      ).length;

      if (attemptsForEmail >= 5) {
        toast({
          title: "Conta bloqueada",
          description: "Muitas tentativas de login. Tente novamente em 15 minutos.",
          variant: "destructive"
        });
        return { error: new Error('Muitas tentativas de login. Tente novamente mais tarde.') };
      }

      // Registrar tentativa
      localStorage.setItem('loginAttempts', JSON.stringify([
        ...recentAttempts,
        { timestamp: Date.now(), email }
      ]));

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro no login:', error);
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      // Limpar tentativas de login após sucesso
      const remainingAttempts = recentAttempts.filter((attempt: { email: string }) => 
        attempt.email !== email
      );
      localStorage.setItem('loginAttempts', JSON.stringify(remainingAttempts));

      // Atualizar last_login no perfil
      if (data.user) {
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          
          const loginUpdate: ProfileUpdatePayload = {
            last_login_at: new Date().toISOString(),
            last_ip_address: ipData.ip || null
          };
          
          await (supabase
            .from('profiles') as unknown as SupabaseProfileQuery)
            .update(loginUpdate)
            .eq('id', data.user.id);
        } catch (error) {
          console.error('Erro ao atualizar IP do usuário:', error);
        }
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!"
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Limpar dados sensíveis do localStorage
      const keysToPreserve = ['theme', 'language', 'accessibility'];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      // Registrar último logout no perfil
      if (user) {
        try {
          const logoutUpdate: ProfileUpdatePayload = {
            last_logout_at: new Date().toISOString()
          };
          
          await (supabase
            .from('profiles') as unknown as SupabaseProfileQuery)
            .update(logoutUpdate)
            .eq('id', user.id);
        } catch (error) {
          console.error('Erro ao registrar logout:', error);
        }
      }

      // Fazer logout no Supabase
      await supabase.auth.signOut();
      
      // Limpar dados locais
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Limpar cookies relacionados à autenticação
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.includes('auth') || name.includes('session')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });

      toast({
        title: "Logout realizado",
        description: "Até logo! Volte sempre!"
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: ProfileUpdateData): Promise<{ error: any }> => {
    try {
      if (!user) {
        return { error: new Error('Usuário não autenticado') };
      }

      // Validar dados do perfil
      if (updates.email && !updates.email.includes('@')) {
        return { error: new Error('Email inválido') };
      }
      
      if (updates.phone && !/^\+?[\d\s-()]{10,}$/.test(updates.phone)) {
        return { error: new Error('Número de telefone inválido') };
      }

      // Sanitizar dados
      const sanitizedUpdates = Object.entries(updates).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (typeof value === 'string') {
          // Remover caracteres perigosos e limitar tamanho
          acc[key] = value.trim().slice(0, 255).replace(/[<>]/g, '');
        } else {
          acc[key] = value;
        }
        return acc;
      }, {}) as unknown as ProfileUpdatePayload;

      // Adicionar metadados
      const updatesWithMeta: ProfileUpdatePayload = {
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
        last_modified_by: user.id
      };

      // Fazer backup dos dados antigos
      const { data: oldProfile, error: fetchError }: SupabaseProfileResponse = await (supabase
        .from('profiles') as unknown as SupabaseProfileQuery)
        .select()
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar perfil antigo:', fetchError);
      } else if (oldProfile) {
        try {
          const historyEntry: ProfileHistoryPayload = {
            profile_id: user.id,
            previous_data: oldProfile,
            changed_by: user.id,
            change_type: 'update',
            created_at: new Date().toISOString()
          };
          
          await (supabase
            .from('profile_history') as unknown as SupabaseProfileHistoryQuery)
            .insert(historyEntry);
        } catch (error) {
          console.error('Erro ao salvar histórico:', error);
        }
      }

      // Atualizar perfil
      const { error, data }: SupabaseProfileResponse = await (supabase
        .from('profiles') as unknown as SupabaseProfileQuery)
        .update(updatesWithMeta)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Atualizar estado local
      if (data) {
        setProfile(prev => prev ? { ...prev, ...data as Profile } : null);
      }
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};