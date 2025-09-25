// Sistema de monitoramento de performance
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: ((metric: PerformanceMetric) => void)[] = [];

  // Iniciar medição
  start(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
  }

  // Finalizar medição
  end(name: string): PerformanceMetric | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Métrica "${name}" não encontrada`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration
    };

    this.metrics.set(name, completedMetric);
    this.notifyObservers(completedMetric);

    // Log em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }

    return completedMetric;
  }

  // Obter métrica
  getMetric(name: string): PerformanceMetric | null {
    return this.metrics.get(name) || null;
  }

  // Obter todas as métricas
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Limpar métricas
  clear(): void {
    this.metrics.clear();
  }

  // Adicionar observador
  addObserver(callback: (metric: PerformanceMetric) => void): void {
    this.observers.push(callback);
  }

  // Remover observador
  removeObserver(callback: (metric: PerformanceMetric) => void): void {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // Notificar observadores
  private notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Erro no observador de performance:', error);
      }
    });
  }

  // Obter estatísticas
  getStats(): {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  } {
    const completedMetrics = this.getAllMetrics().filter(m => m.duration !== undefined);
    
    if (completedMetrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestMetric: null,
        fastestMetric: null
      };
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / completedMetrics.length;

    const slowestMetric = completedMetrics.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );

    const fastestMetric = completedMetrics.reduce((fastest, current) => 
      (current.duration || 0) < (fastest.duration || 0) ? current : fastest
    );

    return {
      totalMetrics: completedMetrics.length,
      averageDuration,
      slowestMetric,
      fastestMetric
    };
  }
}

// Instância singleton
export const performanceMonitor = new PerformanceMonitor();

// Hook para medir performance
export const usePerformance = () => {
  const start = (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.start(name, metadata);
  };

  const end = (name: string) => {
    return performanceMonitor.end(name);
  };

  const measure = async <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    start(name, metadata);
    try {
      const result = await fn();
      end(name);
      return result;
    } catch (error) {
      end(name);
      throw error;
    }
  };

  const measureSync = <T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T => {
    start(name, metadata);
    try {
      const result = fn();
      end(name);
      return result;
    } catch (error) {
      end(name);
      throw error;
    }
  };

  return {
    start,
    end,
    measure,
    measureSync,
    getStats: () => performanceMonitor.getStats(),
    clear: () => performanceMonitor.clear()
  };
};

// Decorator para medir performance de funções
export const measurePerformance = (name: string, metadata?: Record<string, any>) => {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(name, () => method.apply(this, args), metadata);
    };

    return descriptor;
  };
};

// Função para medir renderização de componentes
export const measureRender = (componentName: string) => {
  return (target: any) => {
    const originalRender = target.prototype.render;

    target.prototype.render = function () {
      const startTime = performance.now();
      const result = originalRender.call(this);
      const endTime = performance.now();
      
      if (import.meta.env.MODE === 'development') {
        console.log(`🎨 ${componentName} render: ${(endTime - startTime).toFixed(2)}ms`);
      }
      
      return result;
    };

    return target;
  };
};

// Função para medir carregamento de dados
export const measureDataLoading = async <T>(
  name: string,
  dataLoader: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await dataLoader();
    const endTime = performance.now();
    
    if (import.meta.env.MODE === 'development') {
      console.log(`📊 ${name} loaded: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    if (import.meta.env.MODE === 'development') {
      console.log(`❌ ${name} failed: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    throw error;
  }
};
