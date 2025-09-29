import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  User, 
  Mail, 
  Phone,
  ShoppingBag,
  DollarSign,
  Home,
  Building,
  Hash,
  Star,
  Tag
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size?: number | string;
  product_snapshot: {
    id: string;
    name: string;
    image_url: string;
    description?: string;
    brand_model?: string;
    helmet_type?: string;
    color_options?: string[];
    size?: string;
    selected_size?: number | string;
    material?: string;
    certifications?: string[];
    is_new?: boolean;
    is_promo?: boolean;
    original_price?: number;
  };
  product?: {
    id: string;
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  billing_address?: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  payment_method: string | null;
  payment_details: {
    method: string;
    status: string;
    transaction_id?: string;
    installments?: number;
    card_last_four?: string;
    card_brand?: string;
  } | null;
  tracking_code: string | null;
  shipping_method: string | null;
  shipping_cost: number | null;
  notes: string | null;
  order_items?: OrderItem[];
}

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
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

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
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

  const statusConfigData = getStatusConfig(order.status);
  const paymentStatusConfigData = getPaymentStatusConfig(order.payment_status || 'pending');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Pedido #{order.order_number}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Detalhes completos do pedido realizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Status do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Badge className={`${statusConfigData.color} text-white`}>
                      {statusConfigData.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Pagamento:</span>
                    <Badge className={`${paymentStatusConfigData.color} text-white`}>
                      {paymentStatusConfigData.label}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  {order.tracking_code && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Código: {order.tracking_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Nome:</span>
                    <span className="text-sm">{order.customer_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm">{order.customer_email || 'N/A'}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Telefone:</span>
                      <span className="text-sm">{order.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Nome:</span>
                        <span className="text-sm">{order.shipping_address.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Endereço:</span>
                        <span className="text-sm">{order.shipping_address.street}, {order.shipping_address.number}</span>
                      </div>
                      {order.shipping_address.complement && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Complemento:</span>
                          <span className="text-sm">{order.shipping_address.complement}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Bairro:</span>
                        <span className="text-sm">{order.shipping_address.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Cidade:</span>
                        <span className="text-sm">{order.shipping_address.city} - {order.shipping_address.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">CEP:</span>
                        <span className="text-sm font-mono">{order.shipping_address.zipCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Endereço não disponível</p>
              )}
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item) => {
                  const product = item.product_snapshot || item.product;
                  const hasDiscount = product?.original_price && product.original_price > item.unit_price;
                  const discountPercentage = hasDiscount 
                    ? Math.round(((product.original_price - item.unit_price) / product.original_price) * 100)
                    : 0;

                  // Debug mais detalhado do product_snapshot (apenas em desenvolvimento)
                  if (process.env.NODE_ENV === 'development' && item.product_snapshot) {
                    console.log('🔍 DEBUG - Product Snapshot Details:', {
                      type: typeof item.product_snapshot,
                      isObject: typeof item.product_snapshot === 'object',
                      isString: typeof item.product_snapshot === 'string',
                      keys: typeof item.product_snapshot === 'object' ? Object.keys(item.product_snapshot) : 'N/A',
                      rawSnapshot: item.product_snapshot,
                      selectedSizeFromSnapshot: item.product_snapshot?.selected_size,
                      selectedSizeType: typeof item.product_snapshot?.selected_size
                    });

                    // Se for string, tentar fazer parse
                    if (typeof item.product_snapshot === 'string') {
                      try {
                        const parsed = JSON.parse(item.product_snapshot);
                        console.log('🔍 DEBUG - Parsed Snapshot:', {
                          parsed,
                          selectedSizeFromParsed: parsed.selected_size,
                          selectedSizeType: typeof parsed.selected_size
                        });
                      } catch (e) {
                        console.log('🔍 DEBUG - Parse Error:', e.message);
                      }
                    }
                  }

                  return (
                    <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        {product?.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name || 'Produto'}
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {product?.name || `Produto ID: ${item.product_id}`}
                              </h4>
                              
                              {/* Informações do produto */}
                              <div className="space-y-1">
                                {product?.brand_model && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Modelo:</span> {product.brand_model}
                                  </p>
                                )}
                                {product?.helmet_type && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Tipo:</span> {product.helmet_type}
                                  </p>
                                )}
                                {product?.material && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Material:</span> {product.material}
                                  </p>
                                )}
                                {product?.color_options && product.color_options.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Cores:</span> {product.color_options.join(', ')}
                                  </p>
                                )}
                                {(() => {
                                  // Extrair tamanho/numeração do product_snapshot
                                  let selectedSize = null;
                                  let isHelmet = false;
                                  let isJacket = false;
                                  
                                  // Detectar tipo de produto
                                  if (item.product_snapshot) {
                                    // Verificar se é capacete (tem helmet_numbers ou helmet_type)
                                    isHelmet = !!(item.product_snapshot.helmet_numbers || item.product_snapshot.helmet_type);
                                    // Verificar se é jaqueta (tem available_sizes ou jacket_type)
                                    isJacket = !!(item.product_snapshot.available_sizes || item.product_snapshot.jacket_type);
                                  }
                                  
                                  // Debug: Log apenas em desenvolvimento
                                  if (process.env.NODE_ENV === 'development') {
                                    console.log('🔍 DEBUG - Item completo:', {
                                      itemId: item.id,
                                      productId: item.product_id,
                                      isHelmet,
                                      isJacket,
                                      selectedSizeValue: item.product_snapshot?.selected_size || item.selected_size
                                    });
                                  }
                                  
                                  // Tentar extrair tamanho do product_snapshot
                                  if (item.product_snapshot) {
                                    if (typeof item.product_snapshot === 'object' && item.product_snapshot !== null) {
                                      // Se for um objeto, acessar selected_size diretamente
                                      selectedSize = item.product_snapshot.selected_size;
                                    } else if (typeof item.product_snapshot === 'string') {
                                      // Se for string JSON, fazer parse
                                      try {
                                        const parsed = JSON.parse(item.product_snapshot);
                                        selectedSize = parsed.selected_size;
                                      } catch (e) {
                                        console.warn('Erro ao fazer parse do product_snapshot:', e);
                                      }
                                    }
                                  }
                                  
                                  // Fallback: tentar usar a coluna selected_size se existir
                                  if (!selectedSize && item.selected_size !== undefined && item.selected_size !== null) {
                                    selectedSize = item.selected_size;
                                  }
                                  
                                  // Para jaquetas, converter número para string se necessário
                                  if (isJacket && typeof selectedSize === 'number') {
                                    // Se for número, provavelmente é um erro - jaquetas usam strings como "M", "G", etc.
                                    selectedSize = null;
                                  }
                                  
                                  // Debug: Log resultado apenas em desenvolvimento
                                  if (process.env.NODE_ENV === 'development') {
                                    console.log('🔍 DEBUG - Size extraction result:', {
                                      finalSelectedSize: selectedSize,
                                      hasSize: !!selectedSize,
                                      sizeType: typeof selectedSize,
                                      productType: isHelmet ? 'capacete' : isJacket ? 'jaqueta' : 'desconhecido'
                                    });
                                  }
                                  
                                  if (selectedSize) {
                                    const label = isJacket ? 'Tamanho' : 'Numeração';
                                    const unit = isHelmet && typeof selectedSize === 'number' ? 'cm' : '';
                                    
                                    return (
                                      <p className="text-sm text-primary font-medium">
                                        <span className="font-medium">{label}:</span> {selectedSize}{unit}
                                      </p>
                                    );
                                  } else {
                                    const label = isJacket ? 'Tamanho' : 'Numeração';
                                    return (
                                      <p className="text-sm text-gray-500">
                                        <span className="font-medium">{label}:</span> Não especificado
                                      </p>
                                    );
                                  }
                                })()}
                              </div>

                              {/* Certificações */}
                              {product?.certifications && product.certifications.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {product.certifications.map((cert, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Badges de status */}
                              <div className="flex gap-2 mt-2">
                                {product?.is_new && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Novo
                                  </Badge>
                                )}
                                {product?.is_promo && (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    <Tag className="h-3 w-3 mr-1" />
                                    Promoção
                                  </Badge>
                                )}
                                {hasDiscount && (
                                  <Badge className="bg-red-100 text-red-800">
                                    -{discountPercentage}%
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Preços e quantidade */}
                            <div className="text-right space-y-2">
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  Quantidade: <span className="font-medium">{item.quantity}</span>
                                </p>
                                <div className="space-y-1">
                                  {hasDiscount && (
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatCurrency(product.original_price)}
                                    </p>
                                  )}
                                  <p className="text-sm font-medium">
                                    Preço unitário: {formatCurrency(item.unit_price)}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-2 border-t">
                                <p className="text-lg font-bold text-gray-900">
                                  {formatCurrency(item.total_price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm">
                    {formatCurrency(order.total_amount - (order.shipping_cost || 0))}
                  </span>
                </div>
                {order.shipping_cost && order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frete:</span>
                    <span className="text-sm">{formatCurrency(order.shipping_cost)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Pagamento */}
          {order.payment_method && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Informações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Método:</span>
                        <span className="text-sm font-medium">{order.payment_method}</span>
                      </div>
                      {order.payment_details?.transaction_id && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">ID da Transação:</span>
                          <span className="text-sm font-mono">{order.payment_details.transaction_id}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <Badge className={`${getPaymentStatusConfig(order.payment_status || 'pending').color} text-white`}>
                          {getPaymentStatusConfig(order.payment_status || 'pending').label}
                        </Badge>
                      </div>
                      {order.payment_details?.installments && order.payment_details.installments > 1 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Parcelas:</span>
                          <span className="text-sm">{order.payment_details.installments}x</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do cartão */}
                  {(order.payment_details?.card_last_four || order.payment_details?.card_brand) && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Cartão</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.payment_details.card_brand && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Bandeira:</span>
                            <span className="text-sm font-medium">{order.payment_details.card_brand}</span>
                          </div>
                        )}
                        {order.payment_details.card_last_four && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Final:</span>
                            <span className="text-sm font-mono">**** **** **** {order.payment_details.card_last_four}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detalhes adicionais */}
                  {order.payment_details && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700 mb-2">Detalhes Adicionais</h4>
                      <div className="text-xs text-blue-600">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(order.payment_details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

