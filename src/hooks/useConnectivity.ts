import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectivityState {
  isOnline: boolean;
  isSlowConnection: boolean;
  retryCount: number;
  lastError: string | null;
}

export const useConnectivity = () => {
  const [state, setState] = useState<ConnectivityState>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    retryCount: 0,
    lastError: null
  });

  // Monitorar status de conectividade
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, lastError: null }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Função simplificada para executar operações sem retry automático
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      timeoutMs?: number;
      checkConnectivity?: boolean;
    } = {}
  ): Promise<T> => {
    const {
      timeoutMs = 10000, // Reduzido de 15s para 10s
      checkConnectivity = false // Desabilitado por padrão para evitar loops
    } = options;

    // Verificar conectividade inicial se solicitado
    if (checkConnectivity && !state.isOnline) {
      const isConnected = await testConnectivity();
      if (!isConnected) {
        throw new Error('Sem conexão com a internet');
      }
    }

    const runWithTimeout = async (op: () => Promise<T>): Promise<T> => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout: Operação demorou mais de ${timeoutMs/1000}s`)), timeoutMs);
      });

      return Promise.race([op(), timeoutPromise]);
    };

    try {
      setState(prev => ({ ...prev, retryCount: 0, lastError: null }));
      const result = await runWithTimeout(operation);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Erro desconhecido';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      throw error;
    }
  }, []);

  // Função simplificada para verificar se um erro é recuperável
  const isRecoverableError = useCallback((error: Error): boolean => {
    // Com o sistema de retry removido, esta função é mantida apenas para compatibilidade
    // mas não será usada para decisões de retry
    return false;
  }, []);

  // Função para testar conectividade com múltiplos endpoints
  const testConnectivity = useCallback(async (): Promise<boolean> => {
    const endpoints = [
      'https://httpbin.org/get',
      'https://api.supabase.com/health'
    ];

    const testEndpoint = async (url: string): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return true;
      } catch (error) {
        return false;
      }
    };

    try {
      // Tenta todos os endpoints em paralelo
      const results = await Promise.all(endpoints.map(testEndpoint));
      const isConnected = results.some(result => result);

      setState(prev => ({ 
        ...prev, 
        isSlowConnection: !isConnected,
        isOnline: isConnected
      }));

      return isConnected;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isSlowConnection: true,
        isOnline: false
      }));
      return false;
    }
  }, []);

  // Função para testar conectividade específica do Supabase
  const testSupabaseConnectivity = useCallback(async (): Promise<{ success: boolean; duration: number; error?: string }> => {
    const startTime = Date.now();
    try {
      // Usar o cliente Supabase para testar conectividade
      const { data, error } = await supabase.auth.getSession();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return { success: false, duration, error: error.message };
      }
      
      return { success: true, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      return { success: false, duration, error: error.message };
    }
  }, []);

  // Função para testar DNS
  const testDNS = useCallback(async (): Promise<{ success: boolean; duration: number; error?: string }> => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.supabase.com/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        return { success: true, duration };
      } else {
        return { success: false, duration, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return { success: false, duration, error: error.message };
    }
  }, []);

  // Função para testar Mercado Pago
  const testMercadoPago = useCallback(async (): Promise<{ success: boolean; duration: number; error?: string }> => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.mercadopago.com/v1/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        return { success: true, duration };
      } else {
        return { success: false, duration, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return { success: false, duration, error: error.message };
    }
  }, []);

  return {
    ...state,
    executeWithRetry,
    testConnectivity,
    testSupabaseConnectivity,
    testDNS,
    testMercadoPago,
    isRecoverableError
  };
};

