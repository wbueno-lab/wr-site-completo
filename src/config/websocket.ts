// Configuração de WebSocket para resolver problemas de conexão
export const WEBSOCKET_CONFIG = {
  // Configurações de reconexão
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  
  // Configurações de heartbeat
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  
  // Configurações de timeout
  connectionTimeout: 20000,
  messageTimeout: 10000,
  
  // URLs permitidas
  allowedOrigins: [
    'ws://localhost:8080',
    'wss://localhost:8080',
    'http://localhost:8080',
    'https://localhost:8080',
    'http://localhost:8888',
    'https://localhost:8888',
    'wss://fflomlvtgaqbzrjnvqaz.supabase.co',
    'https://fflomlvtgaqbzrjnvqaz.supabase.co'
  ]
};

// Função para verificar se uma URL é permitida
export const isAllowedOrigin = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return WEBSOCKET_CONFIG.allowedOrigins.some(origin => {
      if (origin.startsWith('ws://') || origin.startsWith('wss://')) {
        return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
      }
      return urlObj.origin === origin;
    });
  } catch {
    return false;
  }
};

// Função para criar um WebSocket com configurações otimizadas
export const createOptimizedWebSocket = (url: string): WebSocket => {
  if (!isAllowedOrigin(url)) {
    throw new Error(`URL não permitida: ${url}`);
  }
  
  const ws = new WebSocket(url);
  
  // Configurar timeouts
  let connectionTimeout: NodeJS.Timeout;
  let heartbeatInterval: NodeJS.Timeout;
  
  ws.addEventListener('open', () => {
    console.log('🔌 WebSocket conectado:', url);
    
    // Limpar timeout de conexão
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    
    // Iniciar heartbeat
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, WEBSOCKET_CONFIG.heartbeatInterval);
  });
  
  ws.addEventListener('close', (event) => {
    console.log('🔌 WebSocket desconectado:', event.code, event.reason);
    
    // Limpar intervalos
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  });
  
  ws.addEventListener('error', (error) => {
    console.error('🔌 Erro no WebSocket:', error);
    
    // Limpar intervalos
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  });
  
  // Timeout de conexão
  connectionTimeout = setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      console.warn('🔌 Timeout de conexão WebSocket');
      ws.close();
    }
  }, WEBSOCKET_CONFIG.connectionTimeout);
  
  return ws;
};

// Função para reconectar WebSocket automaticamente
export const createReconnectingWebSocket = (
  url: string,
  onMessage?: (event: MessageEvent) => void,
  onOpen?: (event: Event) => void,
  onClose?: (event: CloseEvent) => void,
  onError?: (event: Event) => void
): WebSocket => {
  let ws: WebSocket;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout;
  
  const connect = () => {
    try {
      ws = createOptimizedWebSocket(url);
      
      ws.addEventListener('open', (event) => {
        console.log('🔌 WebSocket reconectado após', reconnectAttempts, 'tentativas');
        reconnectAttempts = 0;
        onOpen?.(event);
      });
      
      ws.addEventListener('message', (event) => {
        onMessage?.(event);
      });
      
      ws.addEventListener('close', (event) => {
        onClose?.(event);
        
        // Tentar reconectar se não foi fechado intencionalmente
        if (event.code !== 1000 && reconnectAttempts < WEBSOCKET_CONFIG.reconnectAttempts) {
          const delay = Math.min(
            WEBSOCKET_CONFIG.reconnectDelay * Math.pow(2, reconnectAttempts),
            WEBSOCKET_CONFIG.maxReconnectDelay
          );
          
          console.log(`🔌 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts + 1})`);
          
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        }
      });
      
      ws.addEventListener('error', (event) => {
        onError?.(event);
      });
      
    } catch (error) {
      console.error('🔌 Erro ao criar WebSocket:', error);
    }
  };
  
  connect();
  
  return ws;
};

