// Implementação robusta de storage com fallback e sincronização
export class CustomStorage implements Storage {
  private memoryStorage: Map<string, string>;
  private isLocalStorageAvailable: boolean;
  private readonly AUTH_KEY = 'wr-capacetes-auth';
  private readonly SYNC_INTERVAL = 1000; // 1 segundo
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.memoryStorage = new Map();
    this.isLocalStorageAvailable = this.checkLocalStorage();
    this.initializeStorage();
    this.startSyncInterval();
  }

  private checkLocalStorage(): boolean {
    try {
      // Verificar se localStorage está disponível
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('[Storage] localStorage não disponível');
        return false;
      }

      // Testar acesso ao localStorage
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (testValue !== testKey) {
        console.warn('[Storage] localStorage não está funcionando corretamente');
        return false;
      }

      return true;
    } catch (e) {
      console.warn('[Storage] Erro ao acessar localStorage:', e);
      return false;
    }
  }

  private initializeStorage(): void {
    if (this.isLocalStorageAvailable) {
      try {
        // Recuperar dados de autenticação existentes
        const existingAuth = localStorage.getItem(this.AUTH_KEY);
        if (existingAuth) {
          console.log('[Storage] Dados de autenticação encontrados');
          this.memoryStorage.set(this.AUTH_KEY, existingAuth);
        }

        // Sincronizar outros dados relevantes
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('supabase'))) {
            const value = localStorage.getItem(key);
            if (value) {
              this.memoryStorage.set(key, value);
            }
          }
        }
      } catch (e) {
        console.error('[Storage] Erro ao inicializar storage:', e);
      }
    }
  }

  private startSyncInterval(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.syncStorage();
    }, this.SYNC_INTERVAL);
  }

  private syncStorage(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      // Sincronizar da memória para localStorage
      this.memoryStorage.forEach((value, key) => {
        const localValue = localStorage.getItem(key);
        if (localValue !== value) {
          localStorage.setItem(key, value);
        }
      });

      // Sincronizar do localStorage para memória
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('supabase'))) {
          const localValue = localStorage.getItem(key);
          const memValue = this.memoryStorage.get(key);
          if (localValue && localValue !== memValue) {
            this.memoryStorage.set(key, localValue);
          }
        }
      }
    } catch (e) {
      console.warn('[Storage] Erro na sincronização:', e);
    }
  }

  getItem(key: string): string | null {
    try {
      // Primeiro tentar ler da memória
      let value = this.memoryStorage.get(key) || null;

      // Se não encontrou na memória, tentar do localStorage
      if (!value && this.isLocalStorageAvailable) {
        try {
          value = localStorage.getItem(key);
          if (value) {
            this.memoryStorage.set(key, value);
          }
        } catch (e) {
          console.warn(`[Storage] Erro ao ler ${key} do localStorage:`, e);
        }
      }

      return value;
    } catch (error) {
      console.error(`[Storage] Erro ao ler ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      // Salvar na memória
      this.memoryStorage.set(key, value);

      // Tentar salvar no localStorage
      if (this.isLocalStorageAvailable) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn(`[Storage] Erro ao salvar ${key} no localStorage:`, e);
        }
      }

      // Forçar sincronização imediata
      this.syncStorage();
    } catch (error) {
      console.error(`[Storage] Erro ao salvar ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      // Remover da memória
      this.memoryStorage.delete(key);

      // Remover do localStorage
      if (this.isLocalStorageAvailable) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`[Storage] Erro ao remover ${key} do localStorage:`, e);
        }
      }

      // Forçar sincronização imediata
      this.syncStorage();
    } catch (error) {
      console.error(`[Storage] Erro ao remover ${key}:`, error);
    }
  }

  clear(): void {
    try {
      // Limpar memória
      this.memoryStorage.clear();

      // Limpar localStorage
      if (this.isLocalStorageAvailable) {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('[Storage] Erro ao limpar localStorage:', e);
        }
      }
    } catch (error) {
      console.error('[Storage] Erro ao limpar storage:', error);
    }
  }

  key(index: number): string | null {
    try {
      if (this.isLocalStorageAvailable) {
        return localStorage.key(index);
      }
      return Array.from(this.memoryStorage.keys())[index] || null;
    } catch (error) {
      console.error('[Storage] Erro ao acessar key:', error);
      return null;
    }
  }

  get length(): number {
    try {
      if (this.isLocalStorageAvailable) {
        return localStorage.length;
      }
      return this.memoryStorage.size;
    } catch (error) {
      console.error('[Storage] Erro ao acessar length:', error);
      return 0;
    }
  }

  // Cleanup
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }
}