import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAdminPermissionsRobust as useAdminPermissions } from '@/hooks/useAdminPermissionsRobust';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, ShoppingBag, MessageSquare, AlertTriangle, RefreshCw, ShieldCheck, Shirt } from 'lucide-react';

// Componentes específicos do admin
import { AdminDashboard, ProductManager, OrderManager, MessageManager, JaquetasManager, VestuarioManager } from '@/components/admin';

const AdminPage = () => {
  const { user, profile } = useAuth();
  const { isAdmin, isLoading: isPermissionLoading, error: permissionError, revalidatePermissions } = useAdminPermissions();
  const { products, orders: rawOrders, categories, brands, contactMessages, isLoading: isRealtimeLoading, refreshData } = useRealtime();
  
  // UseMemo para preservar os order_items nos pedidos
  const orders = useMemo(() => {
    console.log('[AdminPage] useMemo - rawOrders:', rawOrders.map((o: any) => ({
      id: o.id,
      items_count: o.order_items?.length || 0,
      has_items: !!o.order_items
    })));
    
    // Preservar os dados completos dos pedidos
    return rawOrders.map((order: any) => ({
      ...order,
      order_items: order.order_items || []
    }));
  }, [rawOrders]);
  
  // Debug: Log dos pedidos após useMemo
  console.log('[AdminPage] Pedidos após useMemo:', orders.map((o: any) => ({
    id: o.id,
    items_count: o.order_items?.length || 0
  })));
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // Gerenciar estado de carregamento inicial
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const initialize = async () => {
      try {
        // Aguardar um tempo mínimo para evitar flash de loading
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!mounted) return;

        // Se as permissões já foram carregadas e o usuário é admin
        if (!isPermissionLoading && isAdmin) {
          console.log('AdminPage - Usuário é admin, carregando dados...');
          await refreshData();
        }

        // Timeout para forçar carregamento se demorar muito
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('AdminPage - Timeout de inicialização, forçando carregamento');
            setIsInitializing(false);
          }
        }, 10000);

      } catch (error) {
        console.error('AdminPage - Erro na inicialização:', error);
        if (mounted) {
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar todos os dados. Algumas funcionalidades podem estar indisponíveis.",
            variant: "destructive",
            duration: 5000,
          });
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAdmin, isPermissionLoading, refreshData, toast]);

  // Atualizar estado de inicialização quando os dados carregarem
  useEffect(() => {
    if (!isPermissionLoading && !isRealtimeLoading) {
      console.log('AdminPage - Dados carregados, finalizando inicialização');
      setIsInitializing(false);
    }
  }, [isPermissionLoading, isRealtimeLoading]);

  // Tela de carregamento
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando painel administrativo...</p>
          <p className="mt-2 text-sm text-gray-500">
            Permissões: {isPermissionLoading ? 'Carregando' : 'Carregado'} | 
            Dados: {isRealtimeLoading ? 'Carregando' : 'Carregado'}
          </p>
          <Button 
            onClick={() => {
              console.log('AdminPage - Forçando carregamento manualmente');
              setIsInitializing(false);
            }}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Forçar Carregamento
          </Button>
        </div>
      </div>
    );
  }

  // Verificar se houve erro na verificação de permissões
  if (permissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
        <Card className="w-full max-w-md bg-brand-dark-light border-red-500/20">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-400">Erro na Verificação</CardTitle>
            <CardDescription className="text-gray-400">
              Não foi possível verificar suas permissões. Por favor, tente novamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={() => {
                console.log('AdminPage - Revalidando permissões');
                revalidatePermissions();
              }}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se o usuário tem acesso de admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
        <Card className="w-full max-w-md bg-brand-dark-light border-red-500/20">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-400">Acesso Negado</CardTitle>
            <CardDescription className="text-gray-400">
              Você não tem permissão para acessar esta área. Apenas administradores podem acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={() => {
                console.log('AdminPage - Revalidando permissões após acesso negado');
                revalidatePermissions();
              }}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-green to-brand-green-dark shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
              <p className="text-green-100 text-lg">Gerencie sua loja de capacetes</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm">
                  Bem-vindo, <span className="font-semibold">{profile?.full_name || 'Admin'}</span>
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log('AdminPage - Recarregando dados');
                  refreshData();
                }}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sistema de abas */}
        <div className="mb-8 bg-brand-dark-light shadow-lg rounded-xl p-1 w-full max-w-6xl">
          <div className="flex gap-1 flex-wrap">
            <Button
              onClick={() => setActiveTab('dashboard')}
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className={`flex-1 min-w-[120px] ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </div>
            </Button>
            <Button
              onClick={() => setActiveTab('products')}
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              className={`flex-1 min-w-[120px] ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Capacetes</span>
              </div>
            </Button>
            <Button
              onClick={() => setActiveTab('jaquetas')}
              variant={activeTab === 'jaquetas' ? 'default' : 'ghost'}
              className={`flex-1 min-w-[120px] ${
                activeTab === 'jaquetas' 
                  ? 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Jaquetas</span>
              </div>
            </Button>
            <Button
              onClick={() => setActiveTab('vestuario')}
              variant={activeTab === 'vestuario' ? 'default' : 'ghost'}
              className={`flex-1 min-w-[120px] ${
                activeTab === 'vestuario' 
                  ? 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">Vestuário</span>
              </div>
            </Button>
            <Button
              onClick={() => setActiveTab('orders')}
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              className={`flex-1 min-w-[120px] ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </div>
            </Button>
            <Button
              onClick={() => setActiveTab('messages')}
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              className={`flex-1 min-w-[120px] ${
                activeTab === 'messages' 
                  ? 'bg-gradient-to-r from-brand-green to-brand-green-dark text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Mensagens</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'dashboard' && (
          <AdminDashboard 
            products={products}
            orders={orders}
            categories={categories}
            brands={brands}
            contactMessages={contactMessages}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager 
            products={products}
            categories={categories}
            brands={brands}
            toast={toast}
          />
        )}

        {activeTab === 'jaquetas' && (
          <JaquetasManager 
            products={products}
            categories={categories}
            brands={brands}
            toast={toast}
          />
        )}

        {activeTab === 'vestuario' && (
          <VestuarioManager 
            products={products}
            categories={categories}
            brands={brands}
            toast={toast}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManager 
            orders={orders}
            toast={toast}
          />
        )}

        {activeTab === 'messages' && (
          <MessageManager 
            messages={contactMessages}
            toast={toast}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;