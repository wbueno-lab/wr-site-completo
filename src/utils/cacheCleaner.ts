/**
 * Utilitário para limpeza de cache e verificação de recursos
 */

/**
 * Limpa o cache do navegador programaticamente
 */
export function clearBrowserCache() {
  try {
    // Limpar cache do service worker se existir
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }

    // Limpar cache do IndexedDB se existir
    if ('indexedDB' in window) {
      // Lista de bancos de dados conhecidos para limpar
      const databases = ['imageCache', 'appCache', 'userData'];
      
      databases.forEach(dbName => {
        try {
          indexedDB.deleteDatabase(dbName);
        } catch (error) {
          console.warn(`Erro ao limpar database ${dbName}:`, error);
        }
      });
    }

    // Limpar localStorage e sessionStorage, mas preservar dados de autenticação
    try {
      // Preservar dados de autenticação do Supabase
      const authKey = 'sb-fflomlvtgaqbzrjnvqaz-auth-token';
      const authData = localStorage.getItem(authKey);
      
      // Limpar todo o localStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Restaurar dados de autenticação se existirem
      if (authData) {
        localStorage.setItem(authKey, authData);
        console.log('Dados de autenticação preservados durante limpeza de cache');
      }
    } catch (error) {
      console.warn('Erro ao limpar storage:', error);
    }

    // Limpar cache de imagens
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    console.log('Cache do navegador limpo com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return false;
  }
}

/**
 * Verifica se há recursos problemáticos sendo carregados
 */
export function checkProblematicResources() {
  const problematicDomains = [
    'static.hotjar.com',
    'bam.nr-data.net',
    'www.google-analytics.com',
    'www.googletagmanager.com',
    'connect.facebook.net',
    'hotjar.com',
    'nr-data.net',
    'newrelic.com'
  ];

  const scripts = document.querySelectorAll('script[src]');
  const links = document.querySelectorAll('link[href]');
  
  const problematicResources: string[] = [];

  // Verificar scripts
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      problematicDomains.forEach(domain => {
        if (src.includes(domain)) {
          problematicResources.push(`Script: ${src}`);
        }
      });
    }
  });

  // Verificar links
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      problematicDomains.forEach(domain => {
        if (href.includes(domain)) {
          problematicResources.push(`Link: ${href}`);
        }
      });
    }
  });

  return problematicResources;
}

/**
 * Remove recursos problemáticos do DOM
 */
export function removeProblematicResources() {
  const problematicDomains = [
    'static.hotjar.com',
    'bam.nr-data.net',
    'www.google-analytics.com',
    'www.googletagmanager.com',
    'connect.facebook.net',
    'hotjar.com',
    'nr-data.net',
    'newrelic.com'
  ];

  let removedCount = 0;

  // Remover scripts problemáticos
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      problematicDomains.forEach(domain => {
        if (src.includes(domain)) {
          script.remove();
          removedCount++;
        }
      });
    }
  });

  // Remover links problemáticos
  const links = document.querySelectorAll('link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      problematicDomains.forEach(domain => {
        if (href.includes(domain)) {
          link.remove();
          removedCount++;
        }
      });
    }
  });

  console.log(`${removedCount} recursos problemáticos removidos do DOM`);
  return removedCount;
}

/**
 * Verifica e limpa recursos problemáticos
 */
export function cleanupProblematicResources() {
  console.log('Iniciando limpeza de recursos problemáticos...');
  
  // Verificar recursos problemáticos
  const problematicResources = checkProblematicResources();
  
  if (problematicResources.length > 0) {
    console.warn('Recursos problemáticos encontrados:', problematicResources);
    
    // Remover recursos problemáticos
    const removedCount = removeProblematicResources();
    
    if (removedCount > 0) {
      console.log(`Removidos ${removedCount} recursos problemáticos`);
    }
  } else {
    console.log('Nenhum recurso problemático encontrado');
  }
  
  // Limpar cache
  clearBrowserCache();
  
  return {
    problematicResources,
    removedCount: removeProblematicResources()
  };
}

/**
 * Inicializa o sistema de limpeza de cache
 */
export function initializeCacheCleaner() {
  // Executar limpeza apenas uma vez na inicialização, não repetidamente
  // Remover a execução imediata para evitar remoção desnecessária de recursos
  console.log('Sistema de limpeza de cache inicializado (modo passivo)');
  
  // Opcional: executar limpeza apenas quando solicitado manualmente
  // ou em situações específicas, não automaticamente
}
