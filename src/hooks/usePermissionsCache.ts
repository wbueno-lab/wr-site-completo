import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handlePermissionsError } from '@/utils/permissionsErrorHandler';
import { useToast } from './use-toast';

interface PermissionsCache {
  userId: string;
  permissions: string[];
  isAdmin: boolean;
  timestamp: number;
  retryCount: number;
}

const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_RETRIES = 3;

export const usePermissionsCache = () => {
  const cache = useRef<PermissionsCache | null>(null);
  const { toast } = useToast();

  const fetchPermissions = useCallback(async (userId: string, signal?: AbortSignal): Promise<{ permissions: string[], isAdmin: boolean }> => {
    console.log('Buscando permissões para usuário:', userId);

    try {
      // Primeiro, verificar se o usuário é admin no perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', userId)
        .single()
        .abortSignal(signal);

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      console.log('Dados do perfil:', profileData);

      // Se o usuário é admin no perfil
      if (profileData?.is_admin) {
        console.log('Usuário é admin (perfil):', profileData.email);
        return { permissions: ['admin'], isAdmin: true };
      }

      // Verificar na tabela de permissões
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId)
        .abortSignal(signal);

      if (permissionsError) {
        console.error('Erro ao buscar permissões:', permissionsError);
        throw permissionsError;
      }

      const permissions = permissionsData?.map(p => p.permission) || [];
      const isAdmin = permissions.includes('admin');

      console.log('Permissões encontradas:', {
        userId,
        email: profileData?.email,
        permissions,
        isAdmin
      });

      return { permissions, isAdmin };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout ao buscar permissões');
      }
      console.error('Erro ao buscar permissões:', error);
      throw error;
    }
  }, []);

  const getPermissions = useCallback(async (userId: string): Promise<string[]> => {
    console.log('Obtendo permissões para usuário:', userId);

    // Verificar cache
    if (
      cache.current &&
      cache.current.userId === userId &&
      Date.now() - cache.current.timestamp < CACHE_EXPIRATION
    ) {
      console.log('Usando permissões em cache:', {
        userId,
        isAdmin: cache.current.isAdmin,
        permissions: cache.current.permissions
      });
      return cache.current.permissions;
    }

    try {
      console.log('Cache expirado ou não encontrado, buscando permissões...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout

      try {
        const result = await fetchPermissions(userId, controller.signal);

        // Atualizar cache
        cache.current = {
          userId,
          permissions: result.permissions,
          isAdmin: result.isAdmin,
          timestamp: Date.now(),
          retryCount: 0
        };

        console.log('Permissões atualizadas no cache:', {
          userId,
          isAdmin: result.isAdmin,
          permissions: result.permissions
        });

        // Se o usuário é admin, mostrar toast de confirmação
        if (result.isAdmin) {
          toast({
            title: "Permissões de administrador verificadas",
            description: "Você tem acesso de administrador.",
            duration: 3000
          });
        }

        return result.permissions;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);

      // Se for um erro de timeout, tentar usar o cache mesmo expirado
      if (error.message === 'Timeout ao buscar permissões') {
        if (cache.current?.userId === userId) {
          // Incrementar contador de retries do cache
          cache.current.retryCount = (cache.current.retryCount || 0) + 1;

          // Se ainda não excedeu o limite de retries do cache
          if (cache.current.retryCount <= MAX_CACHE_RETRIES) {
            console.log(`Usando cache expirado após falha (retry ${cache.current.retryCount}/${MAX_CACHE_RETRIES})`);
            
            toast({
              title: "Aviso",
              description: "Usando dados em cache devido a problemas de conexão",
              variant: "warning",
              duration: 5000
            });

            return cache.current.permissions;
          }
        }
      }

      // Se não puder usar o cache, tratar o erro
      const permissionsError = handlePermissionsError(error);
      
      toast({
        title: "Erro ao verificar permissões",
        description: "Não foi possível verificar suas permissões. Por favor, tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000
      });
      
      throw permissionsError;
    }
  }, [fetchPermissions, toast]);

  const invalidateCache = useCallback(() => {
    console.log('Invalidando cache de permissões');
    cache.current = null;
  }, []);

  return {
    getPermissions,
    invalidateCache
  };
};