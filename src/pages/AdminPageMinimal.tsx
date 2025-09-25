import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminPageMinimal = () => {
  const { user, profile } = useAuth();
  const { products, orders, categories, brands, contactMessages, isLoading } = useRealtime();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    brand_id: ''
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name.trim()) {
      toast({
        title: "Erro!",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productForm.name.trim(),
          description: productForm.description.trim() || null,
          price: parseFloat(productForm.price) || 0,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
          category_id: productForm.category_id || null,
          brand_id: productForm.brand_id || null,
          is_active: true
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso!",
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        brand_id: ''
      });

    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro!",
        description: error.message || "Erro ao criar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 shadow-2xl">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-green-100 text-lg">Gerencie sua loja de capacetes</p>
          </div>
          
          {/* Mensagem de boas-vindas */}
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <p className="text-white text-lg font-semibold mb-1">
                👋 Bem-vindo, {profile?.full_name || 'Administrador'}!
              </p>
              <p className="text-green-100 text-sm">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="mb-8">
          <div className="flex gap-2 mb-8 bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl shadow-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'messages' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              Mensagens
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                  <p className="text-gray-400">Visão geral da sua loja</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm p-6 rounded-2xl border border-green-500/30 shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-500/20 rounded-xl">
                        <span className="text-2xl">🛍️</span>
                      </div>
                      <span className="text-green-400 text-sm font-medium">+12%</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Total de Produtos</h3>
                    <p className="text-4xl font-bold text-green-400">{products?.length || 0}</p>
                    <p className="text-green-300/70 text-sm mt-2">Produtos cadastrados</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl">
                        <span className="text-2xl">📦</span>
                      </div>
                      <span className="text-blue-400 text-sm font-medium">+8%</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Total de Pedidos</h3>
                    <p className="text-4xl font-bold text-blue-400">{orders?.length || 0}</p>
                    <p className="text-blue-300/70 text-sm mt-2">Pedidos realizados</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl">
                        <span className="text-2xl">🏷️</span>
                      </div>
                      <span className="text-purple-400 text-sm font-medium">+5%</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Categorias</h3>
                    <p className="text-4xl font-bold text-purple-400">{categories?.length || 0}</p>
                    <p className="text-purple-300/70 text-sm mt-2">Categorias ativas</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/30 shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-yellow-500/20 rounded-xl">
                        <span className="text-2xl">💬</span>
                      </div>
                      <span className="text-yellow-400 text-sm font-medium">+15%</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Mensagens</h3>
                    <p className="text-4xl font-bold text-yellow-400">{contactMessages?.length || 0}</p>
                    <p className="text-yellow-300/70 text-sm mt-2">Mensagens recebidas</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'products' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Gerenciamento de Produtos</h2>
                  <p className="text-gray-400">Crie e gerencie seus produtos</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-600/30 shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-green-500/20 rounded-xl mr-4">
                      <span className="text-2xl">➕</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Criar Novo Produto</h3>
                  </div>
                  
                  <form onSubmit={handleCreateProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Nome do Produto *</label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Digite o nome do produto"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Preço *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            required
                            className="w-full pl-8 pr-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Estoque *</label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Categoria</label>
                        <select
                          value={productForm.category_id}
                          onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">Descrição</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Descreva o produto..."
                      />
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                      >
                        Criar Produto
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForm({
                          name: '',
                          description: '',
                          price: '',
                          stock_quantity: '',
                          category_id: '',
                          brand_id: ''
                        })}
                        className="px-8 py-3 bg-gray-600/50 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/50"
                      >
                        Limpar
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-600/30 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                        <span className="text-2xl">📦</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Produtos Cadastrados</h3>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-semibold">
                      {products?.length || 0} produtos
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products && products.length > 0 ? (
                      products.map((product) => (
                        <div key={product.id} className="bg-gradient-to-br from-gray-600/30 to-gray-700/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-500/30 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-bold text-white text-lg line-clamp-2">{product.name}</h4>
                            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                              R$ {product.price}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-300">
                              <span className="text-sm">📦</span>
                              <span className="ml-2 text-sm">Estoque: <strong>{product.stock_quantity || 0}</strong></span>
                            </div>
                            {product.description && (
                              <p className="text-gray-300 text-sm line-clamp-2">{product.description}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all duration-300">
                              Editar
                            </button>
                            <button className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-300">
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-400 text-xl">Nenhum produto cadastrado</p>
                        <p className="text-gray-500 text-sm mt-2">Crie seu primeiro produto usando o formulário acima</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Pedidos</h2>
                  <p className="text-gray-400">Gerencie os pedidos da sua loja</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-600/30 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                        <span className="text-2xl">📦</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Pedidos Recebidos</h3>
                    </div>
                    <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full font-semibold">
                      {orders?.length || 0} pedidos
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <div key={order.id} className="bg-gradient-to-br from-gray-600/30 to-gray-700/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-500/30 hover:border-blue-500/50 transition-all duration-300 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white text-lg">Pedido #{order.id}</h4>
                            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-semibold">
                              R$ {order.total_amount}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-300">
                              <span className="text-sm mr-2">📊</span>
                              <span className="text-sm">Status: <strong className="text-white">{order.status}</strong></span>
                            </div>
                            <div className="flex gap-2">
                              <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all duration-300">
                                Ver Detalhes
                              </button>
                              <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-all duration-300">
                                Atualizar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-400 text-xl">Nenhum pedido encontrado</p>
                        <p className="text-gray-500 text-sm mt-2">Os pedidos aparecerão aqui quando forem realizados</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Mensagens</h2>
                  <p className="text-gray-400">Gerencie as mensagens de contato</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-600/30 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-500/20 rounded-xl mr-4">
                        <span className="text-2xl">💬</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Mensagens de Contato</h3>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full font-semibold">
                      {contactMessages?.length || 0} mensagens
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {contactMessages && contactMessages.length > 0 ? (
                      contactMessages.map((message) => (
                        <div key={message.id} className="bg-gradient-to-br from-gray-600/30 to-gray-700/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-500/30 hover:border-yellow-500/50 transition-all duration-300 shadow-lg">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-white text-lg mb-2">{message.name}</h4>
                              <p className="text-gray-400 text-sm">{message.email}</p>
                            </div>
                            <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                              {message.subject || 'Sem assunto'}
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4 line-clamp-3">{message.message}</p>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all duration-300">
                              Ler
                            </button>
                            <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-all duration-300">
                              Responder
                            </button>
                            <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-300">
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">💬</div>
                        <p className="text-gray-400 text-xl">Nenhuma mensagem encontrada</p>
                        <p className="text-gray-500 text-sm mt-2">As mensagens de contato aparecerão aqui</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageMinimal;
