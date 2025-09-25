import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Package, Calendar, MapPin, CreditCard, Truck } from 'lucide-react';
import { OrderDetailModal } from '@/components/OrderDetailModal';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  shipping_address: any;
  payment_method: string | null;
  tracking_code: string | null;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size?: number;
  product_snapshot: any;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  processing: { label: 'Processando', color: 'bg-blue-500' },
  shipped: { label: 'Enviado', color: 'bg-green-500' },
  delivered: { label: 'Entregue', color: 'bg-emerald-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' }
};

const paymentStatusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  paid: { label: 'Pago', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500' }
};

export const OrdersPage = () => {
  const { user, profile } = useAuth();
  const { orders: realtimeOrders, excludedDeliveredOrders } = useRealtime();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && realtimeOrders.length > 0) {
      // Filtrar pedidos do usuário e excluir os entregues que foram removidos
      const userOrders = realtimeOrders
        .filter(order => order.user_id === user.id)
        .filter(order => !(order.status === 'delivered' && excludedDeliveredOrders.has(order.id)));
      
      setOrders(userOrders);
      setLoading(false);
    }
  }, [user, realtimeOrders, excludedDeliveredOrders]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };
  };

  const getPaymentStatusConfig = (status: string) => {
    return paymentStatusConfig[status as keyof typeof paymentStatusConfig] || { label: status, color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você precisa estar logado para visualizar seus pedidos.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-600">Você ainda não fez nenhum pedido.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const paymentStatusConfig = getPaymentStatusConfig(order.payment_status || 'pending');
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{order.order_number}
                          </h3>
                          <Badge className={`${statusConfig.color} text-white`}>
                            {statusConfig.label}
                          </Badge>
                          <Badge className={`${paymentStatusConfig.color} text-white`}>
                            {paymentStatusConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>{order.payment_method || 'N/A'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>{order.tracking_code || 'Sem código de rastreamento'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">
                                {order.customer_name || 'Usuário não encontrado'}
                              </p>
                              <p className="text-sm text-gray-500">{order.customer_email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(order.total_amount)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.order_items?.length || 0} item(ns)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button
                          onClick={() => handleViewOrder(order)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersPage;
