import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissionsCache } from './usePermissionsCache';
import { useToast } from './use-toast';
import { handlePermissionsError, getErrorMessage } from '@/utils/permissionsErrorHandler';
import { supabase } from '@/integrations/supabase/client';

interface AdminState {
  isAdmin: boolean;
  lastChecked: number;
  userId: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const CHECK_DEBOUNCE = 1000; // 1 segundo

export const useAdminPermissions = () => {
  const { user } = useAuth();
  const { getPermissions, invalidateCache } = usePermissionsCache();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Cache local para evitar verificações desnecessárias
  const adminStateRef = useRef<AdminState | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificação direta no perfil
  const checkAdminInProfile = useCallback(async (userId: string) => {
    try {
      console.log('Verificando admin diretamente no perfil:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data?.is_admin) {
        console.log('Usuário é admin (perfil):', data.email);
      }

      return data?.is_admin || false;
    } catch (error) {
      console.error('Erro ao verificar admin no perfil:', error);
      return false;
    }
  }, []);

  // Função principal de verificação
  const checkPermissions = useCallback(async () => {
    if (!user) {
      console.log('Sem usuário, resetando estado admin');
      setIsAdmin(false);
      setIsLoading(false);
      setError(null);
      adminStateRef.current = null;
      return;
    }

    // Verificar cache local
    if (adminStateRef.current && 
        adminStateRef.current.userId === user.id && 
        Date.now() - adminStateRef.current.lastChecked < CACHE_DURATION) {
      console.log('Usando cache local de permissões admin');
      setIsAdmin(adminStateRef.current.isAdmin);
      setIsLoading(false);
      return;
    }

    // Evitar múltiplas verificações simultâneas
    if (isLoading) {
      console.log('Aguardando verificação anterior...');
      return;
    }

    try {
      console.log('Verificando permissões de admin para usuário:', user.id);
      setIsLoading(true);
      setError(null);

      // Verificar primeiro no perfil
      const isAdminInProfile = await checkAdminInProfile(user.id);
      
      if (isAdminInProfile) {
        console.log('Usuário é admin (verificado no perfil)');
        setIsAdmin(true);
        adminStateRef.current = {
          isAdmin: true,
          lastChecked: Date.now(),
          userId: user.id
        };
        toast({
          title: "Acesso de administrador confirmado",
          description: "Suas permissões de administrador foram verificadas no perfil.",
          duration: 3000
        });
        return;
      }

      // Se não for admin no perfil, verificar nas permissões
      const permissions = await getPermissions(user.id);
      const hasAdminPermission = permissions.includes('admin');
      
      console.log('Permissões verificadas:', { 
        userId: user.id, 
        isAdmin: hasAdminPermission, 
        permissions,
        isAdminInProfile
      });

      setIsAdmin(hasAdminPermission);
      adminStateRef.current = {
        isAdmin: hasAdminPermission,
        lastChecked: Date.now(),
        userId: user.id
      };

      if (hasAdminPermission) {
        toast({
          title: "Acesso de administrador confirmado",
          description: "Suas permissões de administrador foram verificadas.",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      
      const permissionsError = handlePermissionsError(error);
      setError(permissionsError);

      // Se for um erro de timeout, manter o estado anterior
      if (error.message?.includes('Timeout') || error.message?.includes('timeout')) {
        toast({
          title: "Erro ao verificar permissões",
          description: "Mantendo permissões anteriores devido a problemas de conexão",
          variant: "warning",
          duration: 5000
        });

        // Usar cache local se disponível
        if (adminStateRef.current?.userId === user.id) {
          setIsAdmin(adminStateRef.current.isAdmin);
        }
      } else {
        // Tentar uma última verificação direta no perfil
        try {
          const isAdminInProfile = await checkAdminInProfile(user.id);
          if (isAdminInProfile) {
            setIsAdmin(true);
            adminStateRef.current = {
              isAdmin: true,
              lastChecked: Date.now(),
              userId: user.id
            };
            toast({
              title: "Acesso de administrador confirmado",
              description: "Suas permissões foram verificadas diretamente no perfil.",
              duration: 3000
            });
            return;
          }
        } catch (profileError) {
          console.error('Erro na verificação final do perfil:', profileError);
        }

        setIsAdmin(false);
        adminStateRef.current = {
          isAdmin: false,
          lastChecked: Date.now(),
          userId: user.id
        };
        toast({
          title: "Erro ao verificar permissões",
          description: getErrorMessage(permissionsError),
          variant: "destructive",
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, getPermissions, toast, checkAdminInProfile]);

  // Debounce para evitar múltiplas verificações
  const debouncedCheck = useCallback(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkPermissions();
    }, CHECK_DEBOUNCE);
  }, [checkPermissions]);

  // Verificar permissões quando o usuário mudar
  useEffect(() => {
    // Só executar se não estiver carregando e tiver usuário
    if (user && !isLoading) {
      debouncedCheck();
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [user?.id, debouncedCheck, isLoading]);

  // Função para forçar uma nova verificação
  const revalidatePermissions = useCallback(async () => {
    console.log('Revalidando permissões...');
    invalidateCache();
    adminStateRef.current = null;
    await checkPermissions();
  }, [invalidateCache, checkPermissions]);

  return { 
    isAdmin, 
    isLoading, 
    error,
    revalidatePermissions 
  };
};