import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session, PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useAuthState } from '@/hooks/useAuthState';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type ProfileUpdate = Tables['profiles']['Update'];

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
  revalidateProfile: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { toast } = useToast();
  const { executeWithRetry, isOnline } = useConnectivity();
  const { user, session, isAuthenticated, isLoading, isInitialized } = useAuthState();

  // Cache para perfil do usuário
  const profileCache = useRef<{
    id: string;
    data: Profile;
    timestamp: number;
  } | null>(null);

  // Tempo de expiração do cache (5 minutos)
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  // Função robusta para buscar perfil do usuário com fallbacks
  const fetchUserProfile = async (userId: string): Promise<void> => {
    // Verificar cache primeiro
    if (profileCache.current && 
        profileCache.current.id === userId && 
        Date.now() - profileCache.current.timestamp < CACHE_EXPIRATION) {
      // Usando cache do perfil
      setProfile(profileCache.current.data);
      return;
    }
    
    setIsProfileLoading(true);
    
    try {
      // Buscando perfil para usuário
      
      // Primeiro, verificar se há múltiplos perfis (o que causaria o erro PGRST301)
      const { data: profilesData, error: countError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId);
      
      if (countError) {
        console.error('[Auth] Erro ao verificar perfis:', countError);
        throw countError;
      }
      
      // Se não há perfis, criar um
      if (!profilesData || profilesData.length === 0) {
        // Perfil não encontrado, criando perfil básico
        
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
          setProfile(null);
          toast({
            title: "Erro ao criar perfil",
            description: "Não foi possível criar seu perfil. Tente fazer logout e login novamente.",
            variant: "destructive"
          });
          return;
        }
        
        // Perfil criado com sucesso
        setProfile(newProfile as Profile);
        profileCache.current = {
          id: userId,
          data: newProfile as Profile,
          timestamp: Date.now()
        };
        return;
      }
      
      // Se há múltiplos perfis, usar o primeiro e reportar o problema
      if (profilesData.length > 1) {
        console.warn('[Auth] Múltiplos perfis encontrados para o usuário:', userId.slice(0, 8) + '...', 'Count:', profilesData.length);
        toast({
          title: "Múltiplos perfis detectados",
          description: "Detectamos múltiplos perfis para sua conta. Usando o primeiro encontrado. Contate o suporte se necessário.",
          variant: "destructive"
        });
      }
      
      // Buscar o perfil completo (usar primeiro se houver múltiplos)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .single();
      
      if (error) {
        console.error('[Auth] Erro ao buscar perfil completo:', error);
        const errorMessage = getProfileErrorMessage(error);
        setProfile(null);
        toast({
          title: "Erro ao carregar perfil",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      if (profileData) {
        // Perfil carregado com sucesso
        
        // Atualizar cache
        profileCache.current = {
          id: userId,
          data: profileData as Profile,
          timestamp: Date.now()
        };
        setProfile(profileData as Profile);
      }
      
    } catch (error) {
      console.error('[Auth] Erro inesperado ao buscar perfil:', error);
      setProfile(null);
      
      // Não mostrar toast para erros de rede temporários
      if (!error.message?.includes('timeout') && !error.message?.includes('network')) {
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seu perfil. Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Função para obter mensagens de erro mais específicas
  const getProfileErrorMessage = (error: any): string => {
    if (error.code === 'PGRST301') {
      return 'Múltiplos perfis encontrados. Contate o suporte.';
    }
    if (error.code === 'PGRST116') {
      return 'Perfil não encontrado. Será criado automaticamente.';
    }
    if (error.message?.includes('timeout')) {
      return 'Conexão lenta. Tente novamente em alguns segundos.';
    }
    if (error.message?.includes('network')) {
      return 'Problema de conexão. Verifique sua internet.';
    }
    return 'Não foi possível carregar seu perfil. Tente novamente mais tarde.';
  };

  // Função para revalidar perfil
  const revalidateProfile = async (): Promise<void> => {
    if (user) {
      profileCache.current = null; // Limpar cache
      await fetchUserProfile(user.id);
    }
  };

  // Carregar perfil quando o usuário mudar
  useEffect(() => {
    if (isInitialized && user) {
      fetchUserProfile(user.id).catch(error => {
        console.error('[Auth] Erro ao carregar perfil:', error);
      });
    } else if (isInitialized && !user) {
      setProfile(null);
      profileCache.current = null;
    }
  }, [user, isInitialized]);

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error: any }> => {
    try {
      // Validações básicas
      if (!email || !email.includes('@')) {
        return { error: new Error('Email inválido') };
      }
      if (!password || password.length < 6) {
        return { error: new Error('A senha deve ter pelo menos 6 caracteres') };
      }

      const redirectUrl = `${window.location.origin}/auth?tab=login`;
      
      // Rate limiting
      const signupAttempts = JSON.parse(localStorage.getItem('signupAttempts') || '[]');
      const recentAttempts = signupAttempts.filter((timestamp: number) => 
        Date.now() - timestamp < 3600000 // 1 hora
      );
      
      if (recentAttempts.length >= 5) {
        return { error: new Error('Muitas tentativas de cadastro. Tente novamente mais tarde.') };
      }

      // Registrar tentativa
      localStorage.setItem('signupAttempts', JSON.stringify([...recentAttempts, Date.now()]));
      
      const { error, data } = await executeWithRetry(
        () => supabase.auth.signUp({
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
        }),
        {
          timeoutMs: 8000, // Reduzido para 8 segundos
          checkConnectivity: false
        }
      );
      
      if (error) {
        console.error('[Auth] Erro no cadastro:', error);
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
        duration: 10000
      });
      
      return { error: null };
    } catch (error) {
      console.error('[Auth] Erro inesperado no cadastro:', error);
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

      const { error, data } = await executeWithRetry(
        () => supabase.auth.signInWithPassword({
          email,
          password
        }),
        {
          timeoutMs: 8000, // Reduzido para 8 segundos
          checkConnectivity: false
        }
      );
      
      if (error) {
        console.error('[Auth] Erro no login:', error);
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e pasta de spam.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Conexão lenta. Tente novamente em alguns segundos.';
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
          const loginUpdate = {
            last_login_at: new Date().toISOString()
          };
          
          await supabase
            .from('profiles')
            .update({
              ...loginUpdate,
              updated_at: new Date().toISOString(),
              last_modified_by: data.user.id
            })
            .eq('id', data.user.id);
        } catch (error) {
          console.error('[Auth] Erro ao atualizar login do usuário:', error);
        }
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!"
      });
      
      return { error: null };
    } catch (error) {
      console.error('[Auth] Erro inesperado no login:', error);
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
      // Iniciando processo de logout
      
      // Limpar estados imediatamente para UI responsiva
      setProfile(null);
      profileCache.current = null;

      // Limpar dados sensíveis do localStorage
      const keysToPreserve = ['theme', 'language', 'accessibility'];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      // Limpar dados locais primeiro
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Limpar cookies relacionados à autenticação
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.includes('auth') || name.includes('session')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });

      // Registrar último logout no perfil ANTES do logout (se ainda houver usuário)
      if (user) {
        try {
          const logoutUpdate = {
            last_logout_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
          };
          
          await supabase
            .from('profiles')
            .update(logoutUpdate)
            .eq('id', user.id);
        } catch (error) {
          console.warn('[Auth] Erro ao registrar logout no perfil (não crítico):', error);
        }
      }

      // Fazer logout no Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.warn('[Auth] Erro no signOut do Supabase (continuando com limpeza local):', signOutError);
        // Não lançar erro, continuar com limpeza local
      }

      // Logout realizado com sucesso
      
      toast({
        title: "Logout realizado",
        description: "Até logo! Volte sempre!"
      });

      // Aguardar um momento para garantir que o toast seja exibido
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forçar reload completo da página
      window.location.replace('/');
      
    } catch (error) {
      console.error('[Auth] Erro no processo de logout:', error);
      
      // Garantir limpeza mesmo em caso de erro
      setProfile(null);
      profileCache.current = null;
      
      // Limpar storage mesmo com erro
      try {
        const keysToPreserve = ['theme', 'language', 'accessibility'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && !keysToPreserve.includes(key)) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('[Auth] Erro ao limpar storage:', e);
      }
      
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

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: any }> => {
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
      }, {}) as ProfileUpdate;

      // Verificar se há dados válidos para atualizar
      if (Object.keys(sanitizedUpdates).length === 0) {
        return { error: new Error('Nenhum dado válido para atualizar') };
      }

      // Adicionar metadados
      const updatesWithMeta: ProfileUpdate = {
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
        last_modified_by: user.id
      };

      // Atualizar perfil
      const { error, data } = await executeWithRetry(
        () => supabase
          .from('profiles')
          .update(updatesWithMeta)
          .eq('id', user.id)
          .select()
          .single(),
        {
          timeoutMs: 5000, // Reduzido para 5 segundos
          checkConnectivity: false
        }
      );
      
      if (error) {
        console.error('[Auth] Erro ao atualizar perfil:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Atualizar estado local e cache
      if (data) {
        setProfile(prev => prev ? { ...prev, ...data as Profile } : null);
        if (profileCache.current) {
          profileCache.current.data = { ...profileCache.current.data, ...data as Profile };
        }
      }
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
      
      return { error: null };
    } catch (error) {
      console.error('[Auth] Erro inesperado ao atualizar perfil:', error);
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
    updateProfile,
    revalidateProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
