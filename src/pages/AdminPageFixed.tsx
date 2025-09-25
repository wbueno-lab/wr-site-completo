import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminPageFixed = () => {
  const { user, profile } = useAuth();
  const { products, orders, categories, brands, contactMessages, isLoading } = useRealtime();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Estados para produtos
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    category_id: '',
    brand_id: '',
    is_promo: false,
    is_new: false,
    is_active: true,
    image_url: '',
    specifications: ''
  });

  // Verificar se o usuário é admin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-lighter to-brand-dark">
        <Card className="w-full max-w-md bg-brand-dark-light border-red-500/20">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-400">Acesso Negado</CardTitle>
            <CardDescription className="text-gray-400">
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Funções de produto
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
          original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
          category_id: productForm.category_id || null,
          brand_id: productForm.brand_id || null,
          is_promo: productForm.is_promo,
          is_new: productForm.is_new,
          is_active: productForm.is_active,
          image_url: productForm.image_url || null,
          specifications: productForm.specifications.trim() || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso!",
      });

      // Limpar formulário
      setProductForm({
        name: '',
        description: '',
        price: '',
        original_price: '',
        stock_quantity: '',
        category_id: '',
        brand_id: '',
        is_promo: false,
        is_new: false,
        is_active: true,
        image_url: '',
        specifications: ''
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

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price ? product.original_price.toString() : '',
      stock_quantity: product.stock_quantity?.toString() || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      is_promo: product.is_promo || false,
      is_new: product.is_new || false,
      is_active: product.is_active !== false,
      image_url: product.image_url || '',
      specifications: product.specifications || ''
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productForm.name.trim(),
          description: productForm.description.trim() || null,
          price: parseFloat(productForm.price) || 0,
          original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
          category_id: productForm.category_id || null,
          brand_id: productForm.brand_id || null,
          is_promo: productForm.is_promo,
          is_new: productForm.is_new,
          is_active: productForm.is_active,
          image_url: productForm.image_url || null,
          specifications: productForm.specifications.trim() || null
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso!",
      });

      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        original_price: '',
        stock_quantity: '',
        category_id: '',
        brand_id: '',
        is_promo: false,
        is_new: false,
        is_active: true,
        image_url: '',
        specifications: ''
      });

    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro!",
        description: error.message || "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
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

    } catch (error: any) {
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

  // Filtrar produtos
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

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
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-brand-dark-light shadow-lg rounded-xl p-1 w-full max-w-4xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green-dark data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Mensagens</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400">Produtos</p>
                        <p className="text-3xl font-bold text-white">{products?.length || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl flex items-center justify-center">
                        <Package className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400">Pedidos</p>
                        <p className="text-3xl font-bold text-white">{orders?.length || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400">Categorias</p>
                        <p className="text-3xl font-bold text-white">{categories?.length || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-400">Mensagens</p>
                        <p className="text-3xl font-bold text-white">{contactMessages?.length || 0}</p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
                  <CardTitle className="text-xl font-bold text-white">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setActiveTab('products')}
                      className="h-auto p-4 bg-transparent hover:bg-brand-dark-lighter border-2 border-gray-600 hover:border-brand-green/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-xl flex items-center justify-center">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="text-white font-semibold text-sm">Gerenciar Produtos</h3>
                          <p className="text-gray-400 text-xs mt-1">{products?.length || 0} produtos cadastrados</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setActiveTab('orders')}
                      className="h-auto p-4 bg-transparent hover:bg-brand-dark-lighter border-2 border-gray-600 hover:border-brand-green/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="text-white font-semibold text-sm">Gerenciar Pedidos</h3>
                          <p className="text-gray-400 text-xs mt-1">{orders?.length || 0} pedidos totais</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setActiveTab('messages')}
                      className="h-auto p-4 bg-transparent hover:bg-brand-dark-lighter border-2 border-gray-600 hover:border-brand-green/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="text-white font-semibold text-sm">Central de Mensagens</h3>
                          <p className="text-gray-400 text-xs mt-1">{contactMessages?.length || 0} mensagens</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">Gerenciamento de Produtos</h2>
                  <p className="text-gray-400 mt-2">Gerencie seu catálogo de capacetes</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-2">
                    {filteredProducts.length} Produtos
                  </Badge>
                </div>
              </div>

              {/* Filtros */}
              <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-400">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Nome ou descrição..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-gray-600 bg-brand-dark-lighter text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-400">Categoria</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="border-gray-600 bg-brand-dark-lighter text-white">
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário de Produto */}
              <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6">
                  <CardTitle className="text-xl font-bold text-white">
                    {editingProduct ? 'Editar Produto' : 'Criar Novo Produto'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-white">Nome do Produto *</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
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
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm font-semibold text-white">Estoque *</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          required
                          className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-semibold text-white">Categoria</Label>
                        <Select value={productForm.category_id} onValueChange={(value) => 
                          setProductForm({ ...productForm, category_id: value })
                        }>
                          <SelectTrigger className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-white">Descrição</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="min-h-[100px] border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                        placeholder="Descreva o produto..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specifications" className="text-sm font-semibold text-white">Especificações Técnicas</Label>
                      <Textarea
                        id="specifications"
                        value={productForm.specifications}
                        onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                        className="min-h-[100px] border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                        placeholder="Especificações técnicas do produto..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-brand-green to-brand-green-dark hover:from-brand-green-dark hover:to-brand-green text-white font-semibold py-3 rounded-xl"
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
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: '',
                              description: '',
                              price: '',
                              original_price: '',
                              stock_quantity: '',
                              category_id: '',
                              brand_id: '',
                              is_promo: false,
                              is_new: false,
                              is_active: true,
                              image_url: '',
                              specifications: ''
                            });
                          }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                      <CardContent className="p-12 text-center">
                        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto encontrado</h3>
                        <p className="text-gray-400">Comece criando seu primeiro produto ou ajuste os filtros.</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-400">
                              {categories?.find(c => c.id === product.category_id)?.name || 'Sem categoria'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xl font-bold text-brand-green">{formatPrice(product.price)}</p>
                              {product.original_price && (
                                <p className="text-sm text-gray-400 line-through">
                                  {formatPrice(product.original_price)}
                                </p>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              Estoque: {product.stock_quantity || 0}
                            </p>
                          </div>

                          {product.specifications && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Especificações:</p>
                              <p className="text-xs text-gray-300 line-clamp-2">{product.specifications}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 border-brand-green/50 text-brand-green hover:bg-brand-green/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingProduct(product)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Gerenciamento de Pedidos</h2>
                <p className="text-gray-400">Gerencie todos os pedidos da loja</p>
              </div>

              {orders?.length === 0 ? (
                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhum pedido encontrado</h3>
                    <p className="text-gray-400">Os pedidos aparecerão aqui quando os clientes fizerem compras.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Pedido #{order.order_number}</h3>
                            <p className="text-sm text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge className={`px-3 py-1 rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {order.status === 'pending' ? 'Pendente' :
                             order.status === 'confirmed' ? 'Confirmado' :
                             order.status === 'shipped' ? 'Enviado' :
                             order.status === 'delivered' ? 'Entregue' :
                             'Cancelado'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Cliente</h4>
                            <p className="text-white">{order.customer_name || 'Nome não informado'}</p>
                            <p className="text-sm text-gray-400">{order.customer_email || 'Email não informado'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Total</h4>
                            <p className="text-xl font-bold text-brand-green">{formatPrice(order.total_amount || 0)}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Ações</h4>
                            <div className="flex gap-2">
                              <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                                <SelectTrigger className="w-full border-gray-600 bg-brand-dark-lighter text-white">
                                  <SelectValue />
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Central de Mensagens</h2>
                <p className="text-gray-400">Gerencie mensagens de clientes e suporte</p>
              </div>

              {contactMessages?.length === 0 ? (
                <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhuma mensagem encontrada</h3>
                    <p className="text-gray-400">As mensagens de contato aparecerão aqui.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contactMessages.map((message) => (
                    <Card key={message.id} className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                            <p className="text-sm text-gray-400">
                              {message.name} - {message.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge className={`px-3 py-1 rounded-full ${
                            message.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                            message.status === 'read' ? 'bg-green-500/20 text-green-400' :
                            message.status === 'replied' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {message.status === 'new' ? 'Nova' :
                             message.status === 'read' ? 'Lida' :
                             message.status === 'replied' ? 'Respondida' :
                             'Desconhecido'}
                          </Badge>
                        </div>
                        <p className="text-gray-300">{message.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deletingProduct && (
        <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
          <DialogContent className="bg-brand-dark-light border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tem certeza que deseja excluir o produto <strong>"{deletingProduct.name}"</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteProduct}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPageFixed;