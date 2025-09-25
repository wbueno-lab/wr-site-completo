import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminState {
  isAdmin: boolean;
  lastChecked: number;
  userId: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useAdminPermissionsFixed = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Sempre declarar todos os hooks no topo, sem condicionais
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache local para evitar verificações desnecessárias
  const adminStateRef = useRef<AdminState | null>(null);
  const hasCheckedRef = useRef(false);

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

      // Se não for admin no perfil
      console.log('Usuário não é admin no perfil');
      setIsAdmin(false);
      adminStateRef.current = {
        isAdmin: false,
        lastChecked: Date.now(),
        userId: user.id
      };

    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setError(error as Error);
      setIsAdmin(false);
      adminStateRef.current = {
        isAdmin: false,
        lastChecked: Date.now(),
        userId: user.id
      };
      toast({
        title: "Erro ao verificar permissões",
        description: "Não foi possível verificar suas permissões de administrador.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, checkAdminInProfile]);

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

    // Usar perfil do contexto se disponível e ainda não foi verificado
    if (profile && !hasCheckedRef.current) {
      console.log('Usando perfil do contexto para verificação admin');
      const isAdminFromProfile = profile.is_admin || false;
      setIsAdmin(isAdminFromProfile);
      setIsLoading(false);
      hasCheckedRef.current = true;
      
      adminStateRef.current = {
        isAdmin: isAdminFromProfile,
        lastChecked: Date.now(),
        userId: user.id
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

    // Se não há perfil mas há usuário, verificar diretamente
    if (user && !hasCheckedRef.current) {
      checkPermissions();
    }
  }, [user?.id, profile, checkPermissions, toast]);

  // Função para forçar uma nova verificação
  const revalidatePermissions = useCallback(async () => {
    console.log('Revalidando permissões...');
    adminStateRef.current = null;
    hasCheckedRef.current = false;
    await checkPermissions();
  }, [checkPermissions]);

  return { 
    isAdmin, 
    isLoading, 
    error,
    revalidatePermissions 
  };
};
