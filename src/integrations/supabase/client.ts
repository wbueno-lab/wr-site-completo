import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { CustomStorage } from '@/lib/customStorage';
import { ENV } from '@/config/env';

// Configurações otimizadas para reduzir timeouts
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // 500ms
const TIMEOUT = 5000; // 5 segundos
const INIT_TIMEOUT = 8000; // 8 segundos para inicialização

// Instância do storage customizado
const customStorage = new CustomStorage();

// Validar variáveis de ambiente
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error("Variáveis de ambiente do Supabase não configuradas");
}

// Helpers
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withTimeout = <T>(promise: Promise<T>, ms: number, operation = 'Operação'): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${operation} excedeu o timeout de ${ms}ms`));
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  });
};

const withRetry = async <T>(
  operation: () => Promise<T>, 
  retries = MAX_RETRIES,
  delay = RETRY_DELAY,
  operationName = 'Operação'
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await withTimeout(operation(), TIMEOUT, operationName);
    } catch (error) {
      lastError = error as Error;
      console.error(`${operationName}: Tentativa ${i + 1}/${retries} falhou:`, error);
      
      if (i < retries - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        console.log(`${operationName}: Aguardando ${backoffDelay}ms antes da próxima tentativa...`);
        await sleep(backoffDelay);
      }
    }
  }
  
  throw lastError || new Error(`${operationName}: Todas as tentativas falharam`);
};

// Cliente Supabase otimizado
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  // Log apenas em desenvolvimento
  if (ENV.IS_DEVELOPMENT) {
    console.log('🔄 Inicializando cliente Supabase...');
  }
  
  try {
    const client = createClient<Database>(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ANON_KEY,
      {
        auth: {
          storage: customStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          debug: false // Desabilitar logs verbose de debug
        },
        global: {
          headers: {
            'x-client-info': 'wr-capacetes-web',
            'x-application-name': 'WR Capacetes'
          }
        },
        db: {
          schema: 'public'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );

    // Log apenas em desenvolvimento
    if (ENV.IS_DEVELOPMENT) {
      console.log('✅ Cliente Supabase inicializado com sucesso');
    }
    supabaseInstance = client;
    return client;
  } catch (error) {
    console.error('❌ Erro ao inicializar cliente Supabase:', error);
    throw error;
  }
};

// Configuração do Supabase
export const supabaseConfig = {
  url: ENV.SUPABASE_URL,
  anonKey: ENV.SUPABASE_ANON_KEY
} as const;

// Função para aguardar inicialização
export const waitForSupabase = async () => {
  try {
    if (supabaseInstance) return supabaseInstance;
    
    // Tentar criar cliente com timeout
    const client = await withTimeout(
      Promise.resolve(createSupabaseClient()), 
      INIT_TIMEOUT, 
      'Inicialização do Supabase'
    );
    
    return client;
  } catch (error) {
    console.error('❌ Falha crítica na inicialização do Supabase:', error);
    
    // Em caso de erro crítico, retornar cliente básico sem configurações avançadas
    console.log('🔄 Tentando cliente Supabase de fallback...');
    try {
      const fallbackClient = createClient<Database>(
        ENV.SUPABASE_URL,
        ENV.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
      
      console.log('✅ Cliente Supabase de fallback criado');
      return fallbackClient;
    } catch (fallbackError) {
      console.error('❌ Falha completa na inicialização do Supabase:', fallbackError);
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  }
};

// Exportar cliente diretamente
export const supabase = createSupabaseClient();