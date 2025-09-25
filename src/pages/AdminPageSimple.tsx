import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';

const AdminPageSimple = () => {
  const { user, profile } = useAuth();
  const { products, orders, categories, brands, contactMessages, isLoading } = useRealtime();
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('🔍 AdminPageSimple renderizada!', {
    user: !!user,
    profile: !!profile,
    isAdmin: profile?.is_admin,
    isLoading,
    productsCount: products?.length || 0
  });

  // Verificar se o usuário é admin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <h1 className="text-red-400 text-xl mb-4">Acesso Negado</h1>
          <p className="text-gray-400">
            Você não tem permissão para acessar esta área.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            User: {user ? 'Logado' : 'Não logado'} | 
            Admin: {profile?.is_admin ? 'Sim' : 'Não'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Painel Administrativo Simplificado</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Status dos Dados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-green-400">Produtos</h3>
            <p className="text-2xl font-bold">{products?.length || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-blue-400">Pedidos</h3>
            <p className="text-2xl font-bold">{orders?.length || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-purple-400">Categorias</h3>
            <p className="text-2xl font-bold">{categories?.length || 0}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-yellow-400">Marcas</h3>
            <p className="text-2xl font-bold">{brands?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Teste de Abas</h2>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded ${
              activeTab === 'dashboard' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded ${
              activeTab === 'products' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded ${
              activeTab === 'orders' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pedidos
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded">
          {activeTab === 'dashboard' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Dashboard</h3>
              <p className="text-gray-400">Conteúdo do dashboard funcionando!</p>
            </div>
          )}
          
          {activeTab === 'products' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Produtos</h3>
              <p className="text-green-400 mb-4">✅ Aba de produtos funcionando!</p>
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div key={product.id} className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-green-400">R$ {product.price}</p>
                      <p className="text-gray-400 text-sm">Estoque: {product.stock_quantity || 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Nenhum produto encontrado</p>
              )}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Pedidos</h3>
              <p className="text-gray-400">Conteúdo dos pedidos funcionando!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <pre className="text-sm text-gray-300 overflow-auto">
          {JSON.stringify({
            user: user ? 'Logado' : 'Não logado',
            profile: profile ? 'Carregado' : 'Não carregado',
            isAdmin: profile?.is_admin,
            isLoading,
            activeTab,
            dataCounts: {
              products: products?.length || 0,
              orders: orders?.length || 0,
              categories: categories?.length || 0,
              brands: brands?.length || 0,
              messages: contactMessages?.length || 0
            }
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AdminPageSimple;