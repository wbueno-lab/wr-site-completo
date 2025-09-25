import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, ShoppingBag, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ContactMessagesManager from '@/components/ContactMessagesManager';

const AdminPageFixedSimple = () => {
  console.log('🚀 AdminPageFixedSimple - Iniciando renderização...');
  
  const { user, profile } = useAuth();
  const { products, orders, contactMessages, isLoading } = useRealtime();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  // Estados para produtos
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    is_promo: false,
    is_new: false,
    image_url: ''
  });


  console.log('🔍 AdminPageFixedSimple - Dados carregados:');
  console.log('👤 User:', user);
  console.log('👤 Profile:', profile);
  console.log('👤 Is Admin:', profile?.is_admin);
  console.log('📦 Products:', products?.length || 0);
  console.log('📋 Orders:', orders?.length || 0);
  console.log('⏳ IsLoading:', isLoading);

  // Função de criação de produtos
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name.trim()) {
      toast({
        title: "Erro!",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast({
        title: "Erro!",
        description: "Preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.stock_quantity || parseInt(newProduct.stock_quantity) < 0) {
      toast({
        title: "Erro!",
        description: "Quantidade em estoque deve ser maior ou igual a zero.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('🔄 Criando produto com dados:', newProduct);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name.trim(),
          description: newProduct.description.trim() || null,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity),
          is_promo: newProduct.is_promo,
          is_new: newProduct.is_new,
          image_url: newProduct.image_url || null,
          is_active: true
        }])
        .select();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Produto criado com sucesso:', data);

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso!",
      });

      // Limpar formulário
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_promo: false,
        is_new: false,
        image_url: ''
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar produto:', error);
      
      let errorMessage = "Erro ao criar produto. Tente novamente.";
      
      if (error?.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = "Já existe um produto com este nome.";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Categoria ou marca selecionada não é válida.";
        } else if (error.message.includes('not-null')) {
          errorMessage = "Todos os campos obrigatórios devem ser preenchidos.";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      is_promo: product.is_promo || false,
      is_new: product.is_new || false,
      image_url: product.image_url || ''
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    if (!newProduct.name.trim()) {
      toast({
        title: "Erro!",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast({
        title: "Erro!",
        description: "Preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.stock_quantity || parseInt(newProduct.stock_quantity) < 0) {
      toast({
        title: "Erro!",
        description: "Quantidade em estoque deve ser maior ou igual a zero.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 Atualizando produto com dados:', newProduct);

      const { error } = await supabase
        .from('products')
        .update({
          name: newProduct.name.trim(),
          description: newProduct.description.trim() || null,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity),
          is_promo: newProduct.is_promo,
          is_new: newProduct.is_new,
          image_url: newProduct.image_url || null,
        })
        .eq('id', editingProduct.id);

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Produto atualizado com sucesso');

      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso!",
      });

      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_promo: false,
        is_new: false,
        image_url: ''
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar produto:', error);
      
      let errorMessage = "Erro ao atualizar produto. Tente novamente.";
      
      if (error?.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = "Já existe um produto com este nome.";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Categoria ou marca selecionada não é válida.";
        } else if (error.message.includes('not-null')) {
          errorMessage = "Todos os campos obrigatórios devem ser preenchidos.";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      is_promo: false,
      is_new: false,
      image_url: ''
    });
  };

  const confirmDeleteProduct = (product: any) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso!",
      });

      setDeletingProduct(null);

    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro!",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Status do pedido atualizado para ${newStatus}`,
      });

    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast({
        title: "Erro!",
        description: "Erro ao atualizar status do pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (isLoading) {
    console.log('⏳ AdminPageFixedSimple - Carregando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 AdminPageFixedSimple - Renderizando interface...');

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-green to-brand-green-dark shadow-xl">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
              <p className="text-green-100 text-lg">Gerencie produtos, pedidos e muito mais</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-background/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm">Bem-vindo, {profile?.full_name || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('🔄 Mudando aba para:', value);
          setActiveTab(value);
        }}>
          <TabsList className="mb-8 bg-brand-dark-light shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200 text-foreground hover:text-white"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200 text-foreground hover:text-white"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produtos
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200 text-foreground hover:text-white"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Pedidos
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200 text-foreground hover:text-white"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagens
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-8">
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Produtos Ativos</p>
                        <p className="text-3xl font-bold text-white">{products?.length || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-brand-green" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Pedidos Hoje</p>
                        <p className="text-3xl font-bold text-white">
                          {orders?.filter(order => {
                            const today = new Date().toDateString();
                            const orderDate = new Date(order.created_at).toDateString();
                            return today === orderDate;
                          }).length || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Receita Total</p>
                        <p className="text-3xl font-bold text-white">
                          {formatPrice(orders?.reduce((total, order) => total + (order.total_amount || 0), 0) || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Estoque Baixo</p>
                        <p className="text-3xl font-bold text-white">
                          {products?.filter(product => product.stock_quantity < 10).length || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-8">
              {/* Formulário de Produtos */}
              <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {editingProduct ? 'Editar Produto' : 'Criar Novo Produto'}
                  </CardTitle>
                  <CardDescription className="text-green-100 text-lg">
                    {editingProduct ? 'Atualize as informações do produto' : 'Adicione um novo produto ao catálogo'}
                  </CardDescription>
                </div>
                <CardContent className="p-8">
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-white">Nome do Produto *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                        className="h-12 border-2 border-gray-600 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 rounded-xl transition-all duration-200 bg-brand-dark-lighter text-white placeholder-gray-400"
                        placeholder="Digite o nome do produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold text-white">Preço *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                        className="h-12 border-2 border-gray-600 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 rounded-xl transition-all duration-200 bg-brand-dark-lighter text-white placeholder-gray-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity" className="text-sm font-semibold text-white">Quantidade em Estoque *</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={newProduct.stock_quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                        required
                        className="h-12 border-2 border-gray-600 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 rounded-xl transition-all duration-200 bg-brand-dark-lighter text-white placeholder-gray-400"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-white">Descrição</Label>
                      <textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full min-h-[100px] border-2 border-gray-600 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 rounded-xl transition-all duration-200 bg-brand-dark-lighter text-white placeholder-gray-400 p-3"
                        placeholder="Descreva o produto..."
                      />
                    </div>

                    {/* Botões de Ação */}
                    <div className="md:col-span-2 flex gap-4 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-brand-green to-brand-green-dark hover:from-brand-green-dark hover:to-brand-green text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {editingProduct ? (
                          <>
                            <Edit className="h-5 w-5 mr-2" />
                            Atualizar Produto
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5 mr-2" />
                            Criar Produto
                          </>
                        )}
                      </Button>
                      
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          className="px-6 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Lista de Produtos */}
              <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
                  <CardTitle className="text-2xl font-bold text-white">Produtos Cadastrados</CardTitle>
                  <p className="text-green-100 mt-1">Gerencie todos os produtos do catálogo</p>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {!products || products.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Nenhum produto encontrado</h3>
                        <p className="text-gray-400">Comece criando seu primeiro produto.</p>
                      </div>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="bg-brand-dark-lighter rounded-xl p-4 border border-gray-700 hover:border-brand-green/50 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={product.image_url || '/placeholder.svg'}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                              />
                              <div>
                                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                <p className="text-sm text-gray-400">Produto</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-brand-green font-bold">{formatPrice(product.price)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="border-brand-green/50 text-brand-green hover:bg-brand-green/10"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmDeleteProduct(product)}
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">Gerenciamento de Pedidos</h2>
                  <p className="text-gray-400 mt-2">Gerencie todos os pedidos da loja</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-2">
                    {orders?.length || 0} Pedidos
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                {orders?.length === 0 ? (
                  <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="p-12 text-center">
                      <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Nenhum pedido encontrado</h3>
                      <p className="text-gray-400">Os pedidos aparecerão aqui quando os clientes fizerem compras.</p>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white">Pedido #{order.id.slice(-8)}</h3>
                                <p className="text-sm text-gray-400">
                                  {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <Badge 
                                className={`px-3 py-1 ${
                                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                  order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                  order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                  order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}
                              >
                                {order.status === 'pending' ? 'Pendente' :
                                 order.status === 'confirmed' ? 'Confirmado' :
                                 order.status === 'shipped' ? 'Enviado' :
                                 order.status === 'delivered' ? 'Entregue' :
                                 'Cancelado'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Cliente</h4>
                                <p className="text-white">{order.customer_name || 'Nome não informado'}</p>
                                <p className="text-sm text-gray-400">{order.customer_email || 'Email não informado'}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Total</h4>
                                <p className="text-2xl font-bold text-brand-green">{formatPrice(order.total_amount || 0)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 lg:w-48">
                            <Select 
                              value={order.status} 
                              onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Alterar status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregue</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">Central de Mensagens</h2>
                  <p className="text-gray-400 mt-2">Gerencie mensagens de clientes e suporte</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-2">
                    {contactMessages?.length || 0} Mensagens
                  </Badge>
                </div>
              </div>

              <ContactMessagesManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-dark-light rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja excluir o produto <strong>"{deletingProduct.name}"</strong>?
                <br />
                <span className="text-red-400 text-sm">Esta ação não pode ser desfeita.</span>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPageFixedSimple;
