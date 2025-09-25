import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminState {
  isAdmin: boolean;
  lastChecked: number;
  userId: string;
  source: 'profile' | 'database' | 'fallback';
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useAdminPermissionsRobust = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const adminStateRef = useRef<AdminState | null>(null);
  const hasCheckedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificação com timeout
  const checkAdminWithTimeout = useCallback(async (userId: string, timeoutMs = 3000): Promise<boolean> => {
    return new Promise(async (resolve) => {
      const timeout = setTimeout(() => {
        console.log('Timeout na verificação de admin, usando fallback');
        resolve(false);
      }, timeoutMs);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin, email')
          .eq('id', userId)
          .single();

        clearTimeout(timeout);

        if (error) {
          console.error('Erro ao verificar admin:', error);
          resolve(false);
          return;
        }

        if (data?.is_admin) {
          console.log('Usuário é admin (banco):', data.email);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('Erro inesperado na verificação:', error);
        resolve(false);
      }
    });
  }, []);

  // Verificação principal
  const checkPermissions = useCallback(async () => {
    if (!user) {
      console.log('Sem usuário, resetando estado admin');
      setIsAdmin(false);
      setIsLoading(false);
      setError(null);
      adminStateRef.current = null;
      hasCheckedRef.current = false;
      return;
    }

    // Verificar cache local
    if (adminStateRef.current && 
        adminStateRef.current.userId === user.id && 
        Date.now() - adminStateRef.current.lastChecked < CACHE_DURATION) {
      console.log('Usando cache local de permissões admin');
      setIsAdmin(adminStateRef.current.isAdmin);
      setIsLoading(false);
      hasCheckedRef.current = true;
      return;
    }

    // Evitar múltiplas verificações
    if (hasCheckedRef.current) {
      console.log('Verificação já realizada, usando resultado anterior');
      return;
    }

    try {
      console.log('Verificando permissões de admin para usuário:', user.id);
      setIsLoading(true);
      setError(null);
      hasCheckedRef.current = true;

      // 1. Primeiro, tentar usar o perfil do contexto (mais rápido)
      if (profile) {
        console.log('Usando perfil do contexto para verificação admin');
        const isAdminFromProfile = profile.is_admin || false;
        setIsAdmin(isAdminFromProfile);
        setIsLoading(false);
        
        adminStateRef.current = {
          isAdmin: isAdminFromProfile,
          lastChecked: Date.now(),
          userId: user.id,
          source: 'profile'
        };

        if (isAdminFromProfile) {
          toast({
            title: "Acesso de administrador confirmado",
            description: "Suas permissões foram verificadas através do perfil.",
            duration: 3000
          });
        }
        return;
      }

      // 2. Se não há perfil, tentar verificação no banco com timeout
      console.log('Perfil não disponível, verificando no banco...');
      const isAdminInDatabase = await checkAdminWithTimeout(user.id, 5000);
      
      if (isAdminInDatabase) {
        console.log('Usuário é admin (verificado no banco)');
        setIsAdmin(true);
        adminStateRef.current = {
          isAdmin: true,
          lastChecked: Date.now(),
          userId: user.id,
          source: 'database'
        };
        toast({
          title: "Acesso de administrador confirmado",
          description: "Suas permissões de administrador foram verificadas no banco.",
          duration: 3000
        });
        return;
      }

      // 3. Se não conseguiu verificar, usar fallback baseado em localStorage
      console.log('Usando verificação de fallback...');
      const fallbackAdmin = localStorage.getItem(`admin_${user.id}`) === 'true';
      
      setIsAdmin(fallbackAdmin);
      adminStateRef.current = {
        isAdmin: fallbackAdmin,
        lastChecked: Date.now(),
        userId: user.id,
        source: 'fallback'
      };

      if (fallbackAdmin) {
        toast({
          title: "Acesso de administrador (modo offline)",
          description: "Usando permissões em cache devido a problemas de conectividade.",
          variant: "warning",
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setError(error as Error);
      
      // Em caso de erro, tentar fallback
      const fallbackAdmin = localStorage.getItem(`admin_${user.id}`) === 'true';
      setIsAdmin(fallbackAdmin);
      
      adminStateRef.current = {
        isAdmin: fallbackAdmin,
        lastChecked: Date.now(),
        userId: user.id,
        source: 'fallback'
      };

      if (fallbackAdmin) {
        toast({
          title: "Acesso de administrador (modo offline)",
          description: "Usando permissões em cache devido a problemas de conectividade.",
          variant: "warning",
          duration: 5000
        });
      } else {
        toast({
          title: "Erro ao verificar permissões",
          description: "Não foi possível verificar suas permissões de administrador.",
          variant: "destructive",
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, toast, checkAdminWithTimeout]);

  // Verificar permissões quando o usuário mudar
  useEffect(() => {
    // Reset quando não há usuário
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      setError(null);
      adminStateRef.current = null;
      hasCheckedRef.current = false;
      return;
    }

    // Se não foi verificado ainda, verificar
    if (!hasCheckedRef.current) {
      checkPermissions();
    }
  }, [user?.id, checkPermissions]);

  // Função para forçar uma nova verificação
  const revalidatePermissions = useCallback(async () => {
    console.log('Revalidando permissões...');
    adminStateRef.current = null;
    hasCheckedRef.current = false;
    await checkPermissions();
  }, [checkPermissions]);

  // Função para definir admin manualmente (para casos de emergência)
  const setAdminManually = useCallback((isAdminValue: boolean) => {
    if (!user) return;
    
    console.log('Definindo permissões de admin manualmente:', isAdminValue);
    setIsAdmin(isAdminValue);
    localStorage.setItem(`admin_${user.id}`, isAdminValue.toString());
    
    adminStateRef.current = {
      isAdmin: isAdminValue,
      lastChecked: Date.now(),
      userId: user.id,
      source: 'fallback'
    };

    toast({
      title: isAdminValue ? "Permissões de admin definidas" : "Permissões de admin removidas",
      description: "As permissões foram definidas manualmente.",
      duration: 3000
    });
  }, [user, toast]);

  return { 
    isAdmin, 
    isLoading, 
    error,
    revalidatePermissions,
    setAdminManually
  };
};
