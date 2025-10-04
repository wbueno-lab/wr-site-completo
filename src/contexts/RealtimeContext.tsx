import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, FC } from 'react';
import { supabase, supabaseConfig, waitForSupabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { 
  DatabaseResult, 
  DatabaseErrorDetails,
  RealtimePostgresChangesPayload,
  ChannelStatus,
  RealtimeChannel,
  CHANNEL_STATES,
  ChannelState,
  SubscriptionStatus,
  ExtendedRealtimeChannel
} from '@/integrations/supabase/database-types';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { fetch, RequestInit, Response } from '../lib/fetch';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import useAuthState from '@/hooks/useAuthState';

// Tipos para o fetch
type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

// Data Types
type Product = Tables<'products'>;
type BaseOrder = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;
type Category = Tables<'categories'>;
type Brand = Tables<'brands'>;
type ContactMessage = Tables<'contact_messages'>;

// Tipo estendido para OrderItem que inclui campos adicionais
interface ExtendedOrderItem extends OrderItem {
  selected_size?: number | string | null;
  product?: Product | null;
}

// Tipo estendido para Order que inclui order_items
interface Order extends BaseOrder {
  order_items?: ExtendedOrderItem[];
}

// Context Types
interface RealtimeContextType {
  products: Product[];
  orders: Order[];
  categories: Category[];
  brands: Brand[];
  contactMessages: ContactMessage[];
  isLoading: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  excludedDeliveredOrders: Set<string>;
  excludeDeliveredOrder: (orderId: string) => void;
  includeDeliveredOrder: (orderId: string) => void;
  refreshData: () => Promise<void>;
}

interface RealtimeProviderProps {
  children: ReactNode;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Função para criar marcas temporárias baseadas nos produtos
const createTemporaryBrands = (products: Product[]): Brand[] => {
  const brandMap = new Map<string, Brand>();
  
  // Marcas especificadas pelo usuário como fallback
  const popularBrands = [
    { name: 'AGV', country_of_origin: 'Itália', founded_year: 1947 },
    // eslint-disable-next-line spellcheck/spell-checker
    { name: 'BIEFFE', country_of_origin: 'Itália', founded_year: 1980 }, // Marca de capacete
    { name: 'FW3', country_of_origin: 'Itália', founded_year: 1995 },
    { name: 'KYT', country_of_origin: 'Itália', founded_year: 2000 },
    { name: 'PEELS', country_of_origin: 'Itália', founded_year: 2010 },
    { name: 'ASX', country_of_origin: 'Itália', founded_year: 2005 },
    { name: 'LS2', country_of_origin: 'Espanha', founded_year: 1990 },
    // eslint-disable-next-line spellcheck/spell-checker
    { name: 'NORISK', country_of_origin: 'Itália', founded_year: 2012 }, // Marca de capacete
    { name: 'RACE TECH', country_of_origin: 'Itália', founded_year: 2003 },
    // eslint-disable-next-line spellcheck/spell-checker
    { name: 'TEXX', country_of_origin: 'Itália', founded_year: 2015 } // Marca de capacete
  ];

  // Adicionar marcas populares
  popularBrands.forEach((brand, index) => {
    brandMap.set(brand.name, {
      id: `temp-brand-${index}`,
      name: brand.name,
      description: `Fabricante de capacetes ${brand.country_of_origin}`,
      logo_url: '',
      website_url: '',
      country_of_origin: brand.country_of_origin,
      founded_year: brand.founded_year,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });

  return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Função para fazer requisições diretas à API REST
const fetchFromSupabase = async <T extends unknown>(
  endpoint: string,
  options: FetchOptions = {},
  retries = 3
): Promise<DatabaseResult<T>> => {
  const timeout = 10000; // 10 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${supabaseConfig.url}/rest/v1/${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          let errorText = await response.text();
          let errorDetails = errorText;
          
          try {
            // Tenta fazer parse do erro como JSON
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              errorText = errorJson.message;
            }
            if (errorJson.details) {
              errorDetails = errorJson.details;
            }
          } catch (e) {
            // Se não for JSON, usa o texto como está
          }

          console.error(`Erro na requisição para ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            details: errorDetails
          });

          const error: DatabaseErrorDetails = {
            code: response.status.toString(),
            message: errorText,
            details: `HTTP ${response.status}: ${errorDetails}`
          };
          
          // Se for erro 400, adiciona mais contexto
          if (response.status === 400) {
            error.details += `\nEndpoint: ${endpoint}\nHeaders: ${JSON.stringify(options.headers)}\nQuery params: ${endpoint.split('?')[1] || 'none'}`;
          }

          return {
            data: null,
            error,
            status: response.status,
            statusText: response.statusText,
            count: null
          };
        }

        const data = await response.json();
        return {
          data,
          error: null,
          status: response.status,
          statusText: response.statusText,
          count: Array.isArray(data) ? data.length : null
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            const timeoutError: DatabaseErrorDetails = {
              code: 'TIMEOUT',
              message: `Timeout após ${timeout}ms`,
              details: error.message
            };
            return {
              data: null,
              error: timeoutError,
              status: 408,
              statusText: 'Request Timeout',
              count: null
            };
          }
          
          if (attempt === retries) {
            const finalError: DatabaseErrorDetails = {
              code: 'FETCH_ERROR',
              message: error.message,
              details: `Falha após ${retries} tentativas`
            };
            return {
              data: null,
              error: finalError,
              status: 500,
              statusText: 'Internal Server Error',
              count: null
            };
          }
          
          console.warn(`Tentativa ${attempt} falhou, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw error;
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    return {
      data: null,
      error: {
        code: 'MAX_RETRIES',
        message: `Falha após ${retries} tentativas`,
        details: 'Todas as tentativas de requisição falharam'
      },
      status: 500,
      statusText: 'Internal Server Error',
      count: null
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const RealtimeProvider: FC<RealtimeProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [excludedDeliveredOrders, setExcludedDeliveredOrders] = useState<Set<string>>(new Set());
  const [lastAuthState, setLastAuthState] = useState<{ user: any; isAuthenticated: boolean } | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Flag para controlar carregamento inicial
  const { toast } = useToast();
  const { profile } = useAuth();
  const { user, isAuthenticated } = useAuthState();

  // Função para carregar dados iniciais via API REST
  const loadInitialData = useCallback(async () => {
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      // Carregar produtos
      const productsResponse = await fetchFromSupabase<Product[]>('products?select=*&order=created_at.desc');
      if (productsResponse.data) {
        setProducts(productsResponse.data);
      } else {
        setProducts([]);
      }

      // Carregar categorias
      const categoriesResponse = await fetchFromSupabase<Category[]>('categories?select=*&order=name.asc');
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      } else {
        setCategories([]);
      }

      // Carregar marcas (usar temporárias se não houver no banco)
      const brandsResponse = await fetchFromSupabase<Brand[]>('brands?select=*&order=name.asc');
      if (brandsResponse.data && brandsResponse.data.length > 0) {
        setBrands(brandsResponse.data);
      } else {
        const tempBrands = createTemporaryBrands(products);
        setBrands(tempBrands);
      }

      // Carregar pedidos com order_items
      console.log('[RealtimeContext] Carregando pedidos...');
      const ordersResponse = await fetchFromSupabase<Order[]>('orders?select=*,order_items(id,quantity,unit_price,total_price,product_id,selected_size,product_snapshot,product:products(*))&order=created_at.desc');
      console.log('[RealtimeContext] Pedidos carregados:', ordersResponse.data?.length, 'pedidos');
      
      if (ordersResponse.data && ordersResponse.data.length > 0) {
        console.log('[RealtimeContext] Primeiro pedido (raw):', ordersResponse.data[0]);
        console.log('[RealtimeContext] Order_items do primeiro pedido (raw):', (ordersResponse.data[0] as any).order_items);
        
        // SEMPRE carregar order_items separadamente para garantir que temos os dados
        const ordersWithItems = await Promise.all(
          ordersResponse.data.map(async (order: any) => {
            console.log(`[RealtimeContext] Carregando itens do pedido ${order.id}...`);
            // Buscar order_items separadamente para TODOS os pedidos
            const itemsResponse = await fetchFromSupabase<any[]>(
              `order_items?select=id,quantity,unit_price,total_price,product_id,selected_size,product_snapshot,product:products(*)&order_id=eq.${order.id}`
            );
            console.log(`[RealtimeContext] ✅ Itens carregados para pedido ${order.id}:`, itemsResponse.data?.length || 0, 'itens');
            
            const orderWithItems = {
              ...order,
              order_items: itemsResponse.data || []
            };
            
            console.log(`[RealtimeContext] Pedido ${order.id} final com itens:`, orderWithItems.order_items?.length);
            return orderWithItems;
          })
        );
        
        console.log('[RealtimeContext] ✅ TODOS os pedidos processados com itens:', ordersWithItems.map((o: any) => ({ 
          id: o.id, 
          items_count: o.order_items?.length || 0 
        })));
        
        setOrders(ordersWithItems);
        setInitialDataLoaded(true); // Marca que os dados iniciais foram carregados completamente
        console.log('[RealtimeContext] ✅ Dados iniciais completamente carregados, ativando realtime...');
      } else {
        console.log('[RealtimeContext] Nenhum pedido encontrado');
        setOrders([]);
      }

      // Verificar autenticação e carregar mensagens apenas se necessário
      try {
        // Usar o estado de autenticação do hook personalizado
        if (!isAuthenticated || !user) {
          // Usuário não autenticado
          setContactMessages([]);
          return;
        }
        
        // Usuário autenticado

        // Verificar perfil do usuário com timeout
        const profilePromise = supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao verificar perfil')), 2000);
        });
        
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]);
          
        if (profileError) {
          console.error('❌ Erro ao carregar perfil:', profileError);
          setContactMessages([]);
          return;
        }
        
        if (!profileData) {
          // Perfil não encontrado
          setContactMessages([]);
          return;
        }
        
        // Perfil do usuário carregado

        // Carregar mensagens apenas se for admin
        if (!profileData.is_admin) {
          // Usuário não é admin
          setContactMessages([]);
          return;
        }
        
        // Carregando mensagens para usuário admin
        
        const { data: messages, error: messagesError } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        // Resposta da busca de mensagens processada

        if (messagesError) {
          console.error('❌ Erro ao carregar mensagens:', {
            message: messagesError.message,
            details: messagesError.details,
            hint: messagesError.hint
          });
          throw messagesError;
        }

        if (messages && messages.length > 0) {
          // Mensagens carregadas com sucesso
          setContactMessages(messages);
        } else {
          // Nenhuma mensagem encontrada
          setContactMessages([]);
        }
      } catch (error) {
        // Verificar se é um erro de sessão ausente para não mostrar toast desnecessário
        if (error instanceof Error && error.message.includes('Auth session missing')) {
          // Sessão de autenticação ausente
          setContactMessages([]);
        } else {
          console.error('❌ Erro ao carregar mensagens:', error);
          setContactMessages([]);
          toast({
            title: "Erro ao carregar mensagens",
            description: "Não foi possível carregar as mensagens. Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      }

      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  // Função para atualizar dados manualmente
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await loadInitialData();
  }, [loadInitialData]);

  // Funções para gerenciar pedidos excluídos
  const excludeDeliveredOrder = useCallback((orderId: string) => {
    setExcludedDeliveredOrders(prev => new Set([...prev, orderId]));
  }, []);

  const includeDeliveredOrder = useCallback((orderId: string) => {
    setExcludedDeliveredOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
  }, []);

  // Carregar dados iniciais apenas uma vez com tratamento de race condition
  useEffect(() => {
    let isMounted = true;
    let loadingPromise: Promise<void> | null = null;

    const initializeData = async () => {
      try {
        if (!loadingPromise) {
          loadingPromise = loadInitialData();
        }
        await loadingPromise;
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        if (isMounted) {
          setIsConnected(false);
          toast({
            title: 'Erro ao carregar dados',
            description: 'Não foi possível carregar os dados iniciais. Tentando novamente...',
            variant: 'destructive',
            duration: 5000,
          });
        }
      } finally {
        loadingPromise = null;
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [loadInitialData, toast]);

  // Debounce otimizado para mudanças de estado de autenticação
  useEffect(() => {
    const currentAuthState = { user, isAuthenticated };
    const authStateChanged = !lastAuthState || 
      lastAuthState.user?.id !== currentAuthState.user?.id ||
      lastAuthState.isAuthenticated !== currentAuthState.isAuthenticated;

    if (authStateChanged) {
      // Debounce mais longo para evitar loops
      const timeoutId = setTimeout(() => {
        setLastAuthState(currentAuthState);
        // Só recarregar se realmente necessário
        if (currentAuthState.isAuthenticated && currentAuthState.user) {
          loadInitialData();
        }
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timeoutId);
    }
  }, [user, isAuthenticated, lastAuthState, loadInitialData]);

  // SUPABASE REALTIME - atualiza apenas via eventos após o carregamento inicial
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let healthCheckInterval: NodeJS.Timeout;
    const MAX_RETRIES = 10; // Aumentado para 10 tentativas
    let retryCount = 0;
    let channels: ExtendedRealtimeChannel[] = [];

      const setupChannel = <T extends Product | Order | Category | ContactMessage>(
        channelName: string,
        table: string,
        updateFn: (payload: RealtimePostgresChangesPayload<T>) => void
      ): ExtendedRealtimeChannel => {
      // Adiciona timestamp para evitar conflitos de nome de canal
      const uniqueChannelName = `${channelName}-${Date.now()}`;
      let currentChannel = supabase.channel(uniqueChannelName) as ExtendedRealtimeChannel;
      channels.push(currentChannel);
      
      const setupChannelListeners = (channel: ExtendedRealtimeChannel) => {
        // Configura filtros específicos para cada tipo de evento
        channel.on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table,
          filter: table === 'orders' ? 'status=eq.pending' : undefined
        }, (payload) => {
          // Novo registro recebido
          updateFn(payload as RealtimePostgresChangesPayload<T>);
          setLastUpdate(new Date());
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table 
        }, (payload) => {
          // Registro atualizado
          updateFn(payload as RealtimePostgresChangesPayload<T>);
          setLastUpdate(new Date());
        })
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public', 
          table 
        }, (payload) => {
          // Registro excluído
          updateFn(payload as RealtimePostgresChangesPayload<T>);
          setLastUpdate(new Date());
        });

        // Adiciona listener para estado do canal
        channel.on('system', { event: '*' }, (status) => {
          console.log(`Canal ${channelName} - Status do sistema:`, status);
        });

        // Adiciona listener para erros
        channel.on('system', { event: 'error' }, (error) => {
          console.error(`Erro no canal ${channelName}:`, error);
          handleReconnect();
        });
      };

      const handleReconnect = async (force = false) => {
        // Verificando estado do canal
        const channelState = currentChannel.state as ChannelState;
        if (!force && channelState === CHANNEL_STATES.SUBSCRIBED) {
          return; // Evita reconexão desnecessária
        }

        try {
          // Remove o canal antigo
          await supabase.removeChannel(currentChannel);
          const index = channels.indexOf(currentChannel);
          if (index > -1) {
            channels.splice(index, 1);
          }

          // Cria um novo canal com um identificador único
          const timestamp = Date.now();
          const newChannel = supabase.channel(`${channelName}-${timestamp}`);
          setupChannelListeners(newChannel);
          channels.push(newChannel);
          currentChannel = newChannel;

          // Tenta se inscrever no novo canal
          const status = await newChannel.subscribe();
          
          console.log('🔄 Debug - Status da inscrição:', {
            channelName,
            status,
            expected: CHANNEL_STATES.SUBSCRIBED
          });
          const subscriptionStatus = status as unknown as ChannelState;
          if (subscriptionStatus === CHANNEL_STATES.SUBSCRIBED) {
            setIsConnected(true);
            retryCount = 0;
            toast({
              title: 'Conexão restabelecida',
              description: 'Atualizações em tempo real ativadas',
              duration: 3000,
            });
          }
        } catch (error) {
          console.error(`Erro ao reconectar canal ${channelName}:`, error);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            setTimeout(() => handleReconnect(true), delay);
          } else {
            setIsConnected(false);
            toast({
              title: 'Erro de conexão',
              description: 'Não foi possível estabelecer conexão em tempo real. Tentando novamente em 30 segundos...',
              duration: 5000,
              variant: 'destructive',
              action: <ToastAction altText="Tentar novamente" onClick={() => {
                retryCount = 0;
                handleReconnect(true);
              }}>Tentar agora</ToastAction>,
            });
            
            // Reseta o contador após 30 segundos
            setTimeout(() => {
              retryCount = 0;
              handleReconnect(true);
            }, 30000);
          }
        }
      };

      const handleSubscribe = async () => {
        setupChannelListeners(currentChannel);
        
        try {
          const status = await currentChannel.subscribe();
          
          console.log('🔄 Debug - Status da inscrição inicial:', {
            channelName,
            status,
            expected: CHANNEL_STATES.SUBSCRIBED
          });
          const subscriptionStatus = status as unknown as ChannelState;
          if (subscriptionStatus === CHANNEL_STATES.SUBSCRIBED) {
            setIsConnected(true);
            retryCount = 0;
            toast({
              title: 'Conexão estabelecida',
              description: 'Atualizações em tempo real ativadas',
              duration: 3000,
            });
          } else {
            handleReconnect(true);
          }
        } catch (error) {
          console.error(`Erro na inscrição inicial do canal ${channelName}:`, error);
          handleReconnect(true);
        }
      };

      handleSubscribe();
      return currentChannel;
    };

    // Sistema de fallback e verificação periódica da conexão
    let fallbackInterval: NodeJS.Timeout;
    let lastFallbackUpdate = 0;
    const FALLBACK_INTERVAL = 30000; // 30 segundos
    const MIN_FALLBACK_INTERVAL = 10000; // 10 segundos

    const checkAndUpdateData = async () => {
      const now = Date.now();
      if (now - lastFallbackUpdate < MIN_FALLBACK_INTERVAL) {
        return; // Evita atualizações muito frequentes
      }

      try {
        if (!isConnected) {
          // Realizando atualização via fallback
          await loadInitialData();
          lastFallbackUpdate = now;
        }
      } catch (error) {
        console.error('❌ Erro na atualização via fallback:', error);
      }
    };

    healthCheckInterval = setInterval(() => {
      if (!isConnected && retryCount < MAX_RETRIES) {
        channels.forEach(channel => {
          const channelState = channel.state as ChannelState;
          if (channelState !== CHANNEL_STATES.SUBSCRIBED) {
            channel.subscribe();
          }
        });
      }
    }, 10000); // Verifica a cada 10 segundos

    // Inicia o sistema de fallback
    fallbackInterval = setInterval(checkAndUpdateData, FALLBACK_INTERVAL);

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(healthCheckInterval);
      clearInterval(fallbackInterval);
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channels = [];
    };

    // Products
    const productsChannel = setupChannel<Product>('realtime-products', 'products', (payload) => {
      setProducts((prev) => {
        if (payload.eventType === 'INSERT') {
          return [payload.new, ...prev];
        } else if (payload.eventType === 'UPDATE') {
          return prev.map((p) => p.id === payload.new.id ? { ...p, ...payload.new } : p);
        } else if (payload.eventType === 'DELETE') {
          return prev.filter((p) => p.id !== payload.old.id);
        }
        return prev;
      });
    });

    // Orders
    const ordersChannel = setupChannel<Order>('realtime-orders', 'orders', async (payload) => {
      // IMPORTANTE: Ignorar eventos realtime até que os dados iniciais estejam carregados
      if (!initialDataLoaded) {
        console.log('[RealtimeContext] ⚠️ Ignorando evento realtime até dados iniciais carregarem:', payload.eventType);
        return;
      }
      
      console.log('[RealtimeContext] 📡 Evento realtime recebido:', payload.eventType, 'para pedido:', (payload.new as any)?.id || (payload.old as any)?.id);
      
      setOrders((prev) => {
        if (payload.eventType === 'INSERT') {
          // Para novos pedidos, precisamos carregar os order_items
          const newOrder = payload.new as any;
          
          console.log('[RealtimeContext] ➕ Novo pedido inserido, carregando itens...');
          
          // Carregar order_items do novo pedido em background
          (async () => {
            const itemsResponse = await fetchFromSupabase<any[]>(
              `order_items?select=id,quantity,unit_price,total_price,product_id,selected_size,product_snapshot,product:products(*)&order_id=eq.${newOrder.id}`
            );
            console.log('[RealtimeContext] ✅ Itens do novo pedido carregados:', itemsResponse.data?.length || 0);
            if (itemsResponse.data) {
              setOrders((prevOrders) => 
                prevOrders.map((o: any) => 
                  o.id === newOrder.id ? { ...o, order_items: itemsResponse.data } : o
                )
              );
            }
          })();
          
          return [{ ...newOrder, order_items: [] }, ...prev];
        } else if (payload.eventType === 'UPDATE') {
          // IMPORTANTE: Manter os order_items existentes ao atualizar
          console.log('[RealtimeContext] 🔄 Atualizando pedido, preservando order_items');
          return prev.map((o: any) => {
            if (o.id === payload.new.id) {
              const itemsCount = o.order_items?.length || 0;
              const updated = { 
                ...o, 
                ...payload.new,
                order_items: o.order_items // Manter order_items existentes
              };
              console.log('[RealtimeContext] ✅ Pedido atualizado, order_items preservados:', itemsCount, 'itens');
              return updated;
            }
            return o;
          });
        } else if (payload.eventType === 'DELETE') {
          console.log('[RealtimeContext] 🗑️ Pedido excluído');
          return prev.filter((o) => o.id !== payload.old.id);
        }
        return prev;
      });
    });

    // Categories
    const categoriesChannel = setupChannel<Category>('realtime-categories', 'categories', (payload) => {
      setCategories((prev) => {
        if (payload.eventType === 'INSERT') {
          return [payload.new, ...prev];
        } else if (payload.eventType === 'UPDATE') {
          return prev.map((c) => c.id === payload.new.id ? { ...c, ...payload.new } : c);
        } else if (payload.eventType === 'DELETE') {
          return prev.filter((c) => c.id !== payload.old.id);
        }
        return prev;
      });
    });

    // Contact Messages
    const messagesChannel = setupChannel<ContactMessage>('realtime-messages', 'contact_messages', (payload) => {
      console.log('📨 Evento realtime recebido:', {
        type: payload.eventType,
        table: payload.table,
        new: payload.new,
        old: payload.old
      });

      setContactMessages((prev) => {
        if (payload.eventType === 'INSERT') {
          console.log('➕ Nova mensagem recebida');
          return [payload.new, ...prev];
        } else if (payload.eventType === 'UPDATE') {
          // Mensagem atualizada
          return prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } : m);
        } else if (payload.eventType === 'DELETE') {
          // Mensagem excluída
          return prev.filter((m) => m.id !== payload.old.id);
        }
        return prev;
      });

      // Notificar usuário sobre novas mensagens
      if (payload.eventType === 'INSERT') {
        toast({
          title: "Nova mensagem recebida",
          description: `Nova mensagem de ${payload.new.name}`,
        });
      }
    });

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(healthCheckInterval);
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channels = [];
    };
  }, []);

  // Debug: Log dos pedidos antes de criar o value
  if (orders.length > 0) {
    console.log('[RealtimeContext] orders state antes do value:', orders.map((o: any) => ({
      id: o.id,
      items_count: o.order_items?.length || 0,
      order_items_exists: !!o.order_items,
      order_items_raw: o.order_items
    })));
  }

  const value: RealtimeContextType = {
    products,
    orders: orders as Order[], // Força o tipo correto
    categories,
    brands,
    contactMessages,
    isLoading,
    isConnected,
    lastUpdate,
    excludedDeliveredOrders,
    excludeDeliveredOrder,
    includeDeliveredOrder,
    refreshData,
  };

  // Debug: Log do value completo
  if (value.orders.length > 0) {
    console.log('[RealtimeContext] value.orders após criação:', value.orders.map((o: any) => ({
      id: o.id,
      items_count: o.order_items?.length || 0,
      order_items_exists: !!o.order_items,
      order_items_raw: o.order_items
    })));
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime deve ser usado dentro de um RealtimeProvider');
  }
  
  // Debug: Log do que está sendo retornado pelo hook
  if (context.orders && context.orders.length > 0) {
    console.log('[useRealtime] Hook retornando orders:', context.orders.map((o: any) => ({
      id: o.id,
      items_count: o.order_items?.length || 0,
      order_items_exists: !!o.order_items
    })));
  }
  
  return context;
};