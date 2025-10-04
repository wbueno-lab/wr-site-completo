import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderManagerProps {
  orders: any[];
  toast: any;
}

const OrderManager = ({ orders, toast }: OrderManagerProps) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Debug: Log dos pedidos recebidos
  console.log('[OrderManager] Pedidos recebidos:', orders?.length, 'pedidos');
  if (orders && orders.length > 0) {
    console.log('[OrderManager] Primeiro pedido:', orders[0]);
    console.log('[OrderManager] Order_items do primeiro pedido:', (orders[0] as any).order_items);
  }

  // Carregar order_items quando um pedido é selecionado
  useEffect(() => {
    const loadOrderItems = async () => {
      if (!selectedOrder) {
        setOrderItems([]);
        return;
      }

      setLoadingItems(true);
      console.log('[OrderManager] Carregando itens do pedido:', selectedOrder.id);
      console.log('[OrderManager] Pedido completo selecionado:', selectedOrder);

      try {
        // Primeiro, vamos verificar se existem itens para este pedido
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', selectedOrder.id);

        console.log('[OrderManager] Query executada - Resposta:', { itemsData, itemsError });

        if (itemsError) {
          console.error('[OrderManager] Erro ao carregar itens:', itemsError);
          toast({
            title: 'Erro ao carregar itens',
            description: itemsError.message,
            variant: 'destructive'
          });
          setOrderItems([]);
        } else if (!itemsData || itemsData.length === 0) {
          console.warn('[OrderManager] Nenhum item encontrado no banco para o pedido:', selectedOrder.id);
          
          // Tentar usar os itens que vieram com o pedido, se existirem
          if (selectedOrder.order_items && selectedOrder.order_items.length > 0) {
            console.log('[OrderManager] Usando order_items do pedido selecionado:', selectedOrder.order_items);
            setOrderItems(selectedOrder.order_items);
          } else {
            console.log('[OrderManager] Pedido não tem order_items no objeto');
            setOrderItems([]);
          }
        } else {
          console.log('[OrderManager] Itens carregados do banco:', itemsData.length, 'itens');
          
          // Agora buscar os dados dos produtos
          const { data: itemsWithProducts, error: productsError } = await supabase
            .from('order_items')
            .select(`
              *,
              product:products(*)
            `)
            .eq('order_id', selectedOrder.id);
          
          if (productsError) {
            console.error('[OrderManager] Erro ao carregar produtos:', productsError);
            // Usar apenas os itens sem produtos
            setOrderItems(itemsData);
          } else {
            console.log('[OrderManager] Itens com produtos carregados:', itemsWithProducts);
            setOrderItems(itemsWithProducts || itemsData);
          }
        }
      } catch (error) {
        console.error('[OrderManager] Erro:', error);
      } finally {
        setLoadingItems(false);
      }
    };

    loadOrderItems();
  }, [selectedOrder, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar pedidos
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const orderDate = new Date(order.created_at);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          return orderDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Status do pedido atualizado para ${getStatusLabel(newStatus)}`,
      });

    } catch (error: any) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast({
        title: "Erro!",
        description: "Erro ao atualizar status do pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async () => {
    if (!deletingOrder) return;

    try {
      // Primeiro, excluir os itens do pedido
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', deletingOrder.id);

      if (itemsError) throw itemsError;

      // Depois, excluir o pedido
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', deletingOrder.id);

      if (orderError) throw orderError;

      toast({
        title: "Sucesso!",
        description: "Pedido excluído com sucesso!",
      });

      setDeletingOrder(null);

    } catch (error: any) {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: "Erro!",
        description: "Erro ao excluir pedido. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      confirmed: <Package className="h-4 w-4" />,
      shipped: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getPaymentStatusLabel = (status: string) => {
    const statuses = {
      pending: 'Pendente',
      paid: 'Pago',
      failed: 'Falhou'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  // Estatísticas
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    totalRevenue: orders?.reduce((total, order) => total + (order.total_amount || 0), 0) || 0,
    todayOrders: orders?.filter(order => {
      const today = new Date().toDateString();
      const orderDate = new Date(order.created_at).toDateString();
      return today === orderDate;
    }).length || 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Gerenciamento de Pedidos</h2>
          <p className="text-gray-400 mt-2">Gerencie todos os pedidos da sua loja</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-2">
            {filteredOrders.length} Pedidos
          </Badge>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-gray-400">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.confirmed}</p>
            <p className="text-xs text-gray-400">Confirmados</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.shipped}</p>
            <p className="text-xs text-gray-400">Enviados</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.delivered}</p>
            <p className="text-xs text-gray-400">Entregues</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-brand-green">{stats.todayOrders}</p>
            <p className="text-xs text-gray-400">Hoje</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark-light shadow-xl border-0 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-400">Receita</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="order-search"
                  name="order-search"
                  placeholder="Cliente, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  className="pl-10 border-gray-600 bg-brand-dark-lighter text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="border-gray-600 bg-brand-dark-lighter text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="shipped">Enviados</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="border-gray-600 bg-brand-dark-lighter text-white">
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-400">Ajuste os filtros ou aguarde novos pedidos.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Informações do Pedido */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Pedido #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Badge className={`px-3 py-1 ${getStatusColor(order.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </Badge>
                    </div>

                    {/* Informações do Cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{order.customer_name || 'Nome não informado'}</p>
                          <p className="text-sm text-gray-400">{order.customer_email || 'Email não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{getPaymentMethodLabel(order.payment_method)}</p>
                          {order.payment_status && (
                            <p className="text-sm text-gray-400">{getPaymentStatusLabel(order.payment_status)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Endereço de Entrega */}
                    {(order as any).shipping_address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-white font-medium">Endereço de Entrega</p>
                          <p className="text-sm text-gray-400">
                            {(order as any).shipping_address.street}, {(order as any).shipping_address.number}<br />
                            {(order as any).shipping_address.neighborhood} - {(order as any).shipping_address.city}<br />
                            {(order as any).shipping_address.state} - CEP: {(order as any).shipping_address.zip_code}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Itens do Pedido */}
                    <div>
                      <p className="text-white font-medium mb-2">Itens do Pedido</p>
                      <div className="space-y-2">
                        {(order as any).order_items?.slice(0, 3).map((item: any, index: number) => {
                          const product = item.product_snapshot || item.product;
                          const productName = product?.name || `Produto ID: ${item.product_id}`;
                          return (
                            <div key={index} className="flex items-center justify-between p-2 bg-brand-dark-lighter rounded-lg">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product?.image_url || '/placeholder.svg'}
                                  alt={productName}
                                  className="w-8 h-8 object-cover rounded border border-gray-600"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                                <div>
                                  <p className="text-white text-sm font-medium">{productName}</p>
                                  <p className="text-xs text-gray-400">Qtd: {item.quantity}</p>
                                  {/* Tamanho Selecionado - Resumo */}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.helmet_size ? (
                                      <span className="text-xs bg-brand-green/20 text-brand-green px-2 py-0.5 rounded">
                                        {item.helmet_size}cm
                                      </span>
                                    ) : item.helmet_sizes && item.helmet_sizes.length > 0 ? (
                                      <>
                                        {item.helmet_sizes.map((size: number, sizeIndex: number) => (
                                          <span key={sizeIndex} className="text-xs bg-brand-green/20 text-brand-green px-2 py-0.5 rounded">
                                            {size}cm
                                          </span>
                                        ))}
                                      </>
                                    ) : (
                                      <span className="text-xs text-gray-500 italic">
                                        Sem tamanho
                                      </span>
                                    )}
                                  </div>
                                  {/* Compatibilidade com campo antigo */}
                                  {item.helmet_number && !item.helmet_size && !item.helmet_sizes && !product?.helmet_numbers && (
                                    <span className="text-xs bg-brand-green/20 text-brand-green px-2 py-0.5 rounded">
                                      {item.helmet_number}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-brand-green font-semibold text-sm">
                                {formatPrice((item.unit_price || item.price) * item.quantity)}
                              </p>
                            </div>
                          );
                        }) || (
                          <p className="text-gray-400 text-sm">Itens não disponíveis</p>
                        )}
                        {(order as any).order_items?.length > 3 && (
                          <p className="text-gray-400 text-sm">+{(order as any).order_items.length - 3} itens adicionais</p>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <p className="text-lg font-semibold text-white">Total do Pedido</p>
                      <p className="text-2xl font-bold text-brand-green">{formatPrice(order.total_amount || 0)}</p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-3 lg:w-48">
                    <Select 
                      value={order.status} 
                      onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                    >
                      <SelectTrigger className="w-full border-gray-600 bg-brand-dark-lighter text-white">
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
                    
                    <Button
                      variant="outline"
                      className="w-full border-brand-green/50 text-brand-green hover:bg-brand-green/10"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeletingOrder(order)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedOrder && (() => {
        // Debug: Log do pedido selecionado
        console.log('[OrderManager] Pedido selecionado:', selectedOrder);
        console.log('[OrderManager] Order_items do pedido selecionado:', selectedOrder.order_items);
        return (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-brand-dark-light border-gray-700" aria-describedby="order-detail-admin-description">
            <DialogHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-white text-2xl">Detalhes do Pedido #{selectedOrder.id.slice(-8)}</DialogTitle>
                  <DialogDescription id="order-detail-admin-description" className="text-gray-400 mt-2">
                    Informações completas do pedido e dados do cliente
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`px-4 py-2 text-sm ${getStatusColor(selectedOrder.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusLabel(selectedOrder.status)}
                    </div>
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-8">
              {/* Informações do Cliente - Seção Expandida */}
              <Card className="bg-brand-dark-lighter border-gray-600 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-brand-green" />
                    <CardTitle className="text-white text-xl">Informações do Cliente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">Nome Completo</span>
                        <p className="text-white text-lg font-semibold">{selectedOrder.customer_name || 'Não informado'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">Email</span>
                        <p className="text-white">{selectedOrder.customer_email || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">Telefone</span>
                        <p className="text-white">{selectedOrder.customer_phone || 'Não informado'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">CPF</span>
                        <p className="text-white">{(selectedOrder as any).customer_cpf || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">ID do Cliente</span>
                        <p className="text-white font-mono text-sm">{selectedOrder.user_id || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações do Pedido - Seção Expandida */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-brand-dark-lighter border-gray-600 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-6 w-6 text-brand-green" />
                      <CardTitle className="text-white text-xl">Detalhes do Pedido</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">Data do Pedido</span>
                        <p className="text-white">{formatDate(selectedOrder.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">ID Completo</span>
                        <p className="text-white font-mono text-sm">{selectedOrder.id}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400 block mb-1">Método de Pagamento</span>
                      <p className="text-white text-lg font-semibold">{getPaymentMethodLabel(selectedOrder.payment_method)}</p>
                    </div>
                    {selectedOrder.payment_status && (
                      <div>
                        <span className="text-sm font-medium text-gray-400 block mb-1">Status do Pagamento</span>
                        <Badge className={`px-3 py-1 ${selectedOrder.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                          {getPaymentStatusLabel(selectedOrder.payment_status)}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-brand-dark-lighter border-gray-600 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-brand-green" />
                      <CardTitle className="text-white text-xl">Valores</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-white">{formatPrice((selectedOrder as any).subtotal || selectedOrder.total_amount || 0)}</span>
                      </div>
                      {(selectedOrder as any).shipping_cost && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Frete:</span>
                          <span className="text-white">{formatPrice((selectedOrder as any).shipping_cost)}</span>
                        </div>
                      )}
                      {(selectedOrder as any).discount && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Desconto:</span>
                          <span className="text-red-400">-{formatPrice((selectedOrder as any).discount)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-white">Total:</span>
                          <span className="text-2xl font-bold text-brand-green">{formatPrice(selectedOrder.total_amount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Itens do Pedido - Seção Melhorada */}
              <Card className="bg-brand-dark-lighter border-gray-600 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-6 w-6 text-brand-green" />
                      <CardTitle className="text-white text-xl">Itens do Pedido</CardTitle>
                    </div>
                    <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
                      {orderItems.length} {orderItems.length === 1 ? 'item' : 'itens'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingItems ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
                      <span className="ml-3 text-gray-400">Carregando itens...</span>
                    </div>
                  ) : orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum item encontrado para este pedido</p>
                    </div>
                  ) : (
                  <div className="space-y-4">
                    {orderItems.map((item: any, index: number) => {
                      const product = item.product_snapshot || item.product;
                      const productName = product?.name || `Produto ID: ${item.product_id}`;
                      const categoryName = product?.categories?.name || 'N/A';
                      const brandName = product?.brands?.name || 'N/A';
                      return (
                        <div key={index} className="flex items-center justify-between p-6 bg-brand-dark-light rounded-xl border border-gray-600 hover:border-brand-green/30 transition-colors">
                          <div className="flex items-center space-x-6">
                            <div className="relative">
                              <img
                                src={product?.image_url || '/placeholder.svg'}
                                alt={productName}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <Badge className="absolute -top-2 -right-2 bg-brand-green text-white text-xs">
                                {item.quantity}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-white font-semibold text-lg">{productName}</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">SKU:</span>
                                  <span className="text-white ml-2">{product?.sku || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Categoria:</span>
                                  <span className="text-white ml-2">{categoryName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Preço unitário:</span>
                                  <span className="text-white ml-2 font-semibold">{formatPrice(item.unit_price || item.price)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Quantidade:</span>
                                  <span className="text-white ml-2 font-semibold">{item.quantity}</span>
                                </div>
                              </div>
                              {/* Numeração Selecionada pelo Cliente */}
                              <div>
                                <span className="text-gray-400">Numeração Selecionada:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(() => {
                                    // Verificar se há selected_size diretamente no item
                                    let selectedSize = item.selected_size;
                                    
                                    // Se não tiver, verificar no product_snapshot
                                    if (!selectedSize && item.product_snapshot && typeof item.product_snapshot === 'object') {
                                      selectedSize = item.product_snapshot.selected_size;
                                    }
                                    
                                    if (selectedSize) {
                                      return (
                                        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
                                          Numeração {selectedSize}
                                        </Badge>
                                      );
                                    } else if (item.helmet_size) {
                                      return (
                                        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
                                          {item.helmet_size}cm
                                        </Badge>
                                      );
                                    } else if (item.helmet_sizes && item.helmet_sizes.length > 0) {
                                      return (
                                        <>
                                          {item.helmet_sizes.map((size: number, sizeIndex: number) => (
                                            <Badge key={sizeIndex} className="bg-brand-green/20 text-brand-green border-brand-green/30">
                                              {size}cm
                                            </Badge>
                                          ))}
                                        </>
                                      );
                                    } else {
                                      return (
                                        <span className="text-xs text-gray-500 italic">
                                          Numeração não especificada
                                        </span>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                              
                              
                              {/* Compatibilidade com campo antigo helmet_number */}
                              {item.helmet_number && !item.helmet_size && !item.helmet_sizes && (
                                <div>
                                  <span className="text-gray-400">Número do Capacete:</span>
                                  <Badge className="ml-2 bg-brand-green/20 text-brand-green border-brand-green/30">
                                    {item.helmet_number}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-brand-green font-bold text-xl">{formatPrice((item.unit_price || item.price) * item.quantity)}</p>
                            <p className="text-gray-400 text-sm">Total do item</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </CardContent>
              </Card>

              {/* Endereço de Entrega - Seção Melhorada */}
              {(selectedOrder as any).shipping_address && (
                <Card className="bg-brand-dark-lighter border-gray-600 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-brand-green" />
                      <CardTitle className="text-white text-xl">Endereço de Entrega</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-400 block mb-1">Rua</span>
                            <p className="text-white font-semibold">{(selectedOrder as any).shipping_address.street}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-400 block mb-1">Número</span>
                            <p className="text-white">{(selectedOrder as any).shipping_address.number}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-400 block mb-1">Bairro</span>
                            <p className="text-white">{(selectedOrder as any).shipping_address.neighborhood}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-400 block mb-1">Cidade</span>
                            <p className="text-white font-semibold">{(selectedOrder as any).shipping_address.city}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-400 block mb-1">Estado</span>
                            <p className="text-white">{(selectedOrder as any).shipping_address.state}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-400 block mb-1">CEP</span>
                            <p className="text-white font-mono">{(selectedOrder as any).shipping_address.zip_code}</p>
                          </div>
                        </div>
                      </div>
                      {(selectedOrder as any).shipping_address.complement && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <span className="text-sm font-medium text-gray-400 block mb-1">Complemento</span>
                          <p className="text-white">{(selectedOrder as any).shipping_address.complement}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observações do Cliente */}
              {(selectedOrder as any).customer_notes && (
                <Card className="bg-brand-dark-lighter border-gray-600 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-brand-green" />
                      <CardTitle className="text-white text-xl">Observações do Cliente</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-brand-dark-light rounded-xl p-6 border border-gray-600">
                      <p className="text-white whitespace-pre-wrap">{(selectedOrder as any).customer_notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
        );
      })()}

      {/* Modal de Exclusão */}
      {deletingOrder && (
        <Dialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
          <DialogContent className="bg-brand-dark-light border-gray-700" aria-describedby="delete-order-description">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
              <DialogDescription id="delete-order-description" className="text-gray-400">
                Tem certeza que deseja excluir o pedido <strong>#{deletingOrder.id.slice(-8)}</strong>?
                Esta ação não pode ser desfeita e excluirá todos os itens relacionados.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingOrder(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={deleteOrder}
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

export default OrderManager;
