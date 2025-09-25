// Sistema de cache para imagens
interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

class ImageCache {
  private cache = new Map<string, CachedImage>();
  private maxSize = 50 * 1024 * 1024; // 50MB
  private maxAge = 24 * 60 * 60 * 1000; // 24 horas
  private currentSize = 0;

  // Adicionar imagem ao cache
  async cacheImage(url: string): Promise<string> {
    // Verificar se já está em cache
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      if (this.isValid(cached)) {
        return URL.createObjectURL(cached.blob);
      } else {
        this.removeFromCache(url);
      }
    }

    try {
      // Baixar imagem
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const size = blob.size;

      // Verificar se cabe no cache
      if (size > this.maxSize) {
        return url; // Retornar URL original se muito grande
      }

      // Limpar cache se necessário
      this.cleanup();

      // Adicionar ao cache
      const cached: CachedImage = {
        url,
        blob,
        timestamp: Date.now(),
        size
      };

      this.cache.set(url, cached);
      this.currentSize += size;

      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('Erro ao fazer cache da imagem:', error);
      return url; // Retornar URL original em caso de erro
    }
  }

  // Verificar se imagem está em cache
  hasImage(url: string): boolean {
    const cached = this.cache.get(url);
    return cached ? this.isValid(cached) : false;
  }

  // Obter URL da imagem em cache
  getCachedImage(url: string): string | null {
    const cached = this.cache.get(url);
    if (cached && this.isValid(cached)) {
      return URL.createObjectURL(cached.blob);
    }
    return null;
  }

  // Remover imagem do cache
  removeFromCache(url: string): void {
    const cached = this.cache.get(url);
    if (cached) {
      URL.revokeObjectURL(URL.createObjectURL(cached.blob));
      this.currentSize -= cached.size;
      this.cache.delete(url);
    }
  }

  // Verificar se cache é válido
  private isValid(cached: CachedImage): boolean {
    return Date.now() - cached.timestamp < this.maxAge;
  }

  // Limpar cache
  private cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    // Remover itens expirados
    for (const [url, cached] of this.cache.entries()) {
      if (!this.isValid(cached)) {
        toRemove.push(url);
      }
    }

    toRemove.forEach(url => this.removeFromCache(url));

    // Se ainda estiver muito grande, remover os mais antigos
    if (this.currentSize > this.maxSize) {
      const sorted = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      for (const [url] of sorted) {
        this.removeFromCache(url);
        if (this.currentSize <= this.maxSize * 0.8) break; // Parar em 80% do limite
      }
    }
  }

  // Limpar todo o cache
  clear(): void {
    for (const [url] of this.cache.entries()) {
      this.removeFromCache(url);
    }
    this.cache.clear();
    this.currentSize = 0;
  }

  // Obter estatísticas do cache
  getStats() {
    return {
      size: this.currentSize,
      count: this.cache.size,
      maxSize: this.maxSize,
      usage: (this.currentSize / this.maxSize) * 100
    };
  }
}

// Instância singleton
export const imageCache = new ImageCache();

// Função para iniciar limpeza automática
export const startCacheCleanup = () => {
  // Limpar cache a cada hora
  setInterval(() => {
    imageCache.clear();
  }, 60 * 60 * 1000);

  // Limpar cache quando a página for fechada
  window.addEventListener('beforeunload', () => {
    imageCache.clear();
  });
};

// Hook para usar o cache de imagens
export const useImageCache = () => {
  const cacheImage = async (url: string): Promise<string> => {
    return imageCache.cacheImage(url);
  };

  const getCachedImage = (url: string): string | null => {
    return imageCache.getCachedImage(url);
  };

  const hasImage = (url: string): boolean => {
    return imageCache.hasImage(url);
  };

  const clearCache = () => {
    imageCache.clear();
  };

  const getStats = () => {
    return imageCache.getStats();
  };

  return {
    cacheImage,
    getCachedImage,
    hasImage,
    clearCache,
    getStats
  };
};