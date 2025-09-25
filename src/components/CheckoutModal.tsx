import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, MapPin, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useToast } from "@/components/ui/use-toast";
import ShippingAddressForm from "./ShippingAddressForm";
import { paymentService } from "@/services/paymentService";
import { supabase } from "@/integrations/supabase/client";

interface ShippingAddressData {
  fullName: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'address' | 'processing' | 'success'>('address');
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para buscar nomes de produtos que não foram carregados
  const fetchMissingProductNames = async () => {
    const missingProducts = items.filter(item => !item.product?.name);
    console.log('🔍 DEBUG - Produtos sem nome:', missingProducts);
    
    if (missingProducts.length === 0) {
      console.log('🔍 DEBUG - Todos os produtos têm nome, não precisa buscar');
      return;
    }

    try {
      const productIds = missingProducts.map(item => item.product_id);
      console.log('🔍 DEBUG - Buscando nomes para IDs:', productIds);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      if (error) {
        console.error('Erro ao buscar nomes dos produtos:', error);
        return;
      }

      console.log('🔍 DEBUG - Nomes encontrados:', data);

      const namesMap: Record<string, string> = {};
      data?.forEach(product => {
        namesMap[product.id] = product.name;
      });

      console.log('🔍 DEBUG - Mapa de nomes criado:', namesMap);
      setProductNames(namesMap);
    } catch (error) {
      console.error('Erro ao buscar nomes dos produtos:', error);
    }
  };

  const handleAddressSubmit = async (addressData: ShippingAddressData) => {
    setShippingAddress(addressData);
    setIsProcessing(true);
    setStep('processing');

    try {
      const orderData = {
        items: items.map(item => {
          // Garantir que temos o nome do produto
          const productName = item.product?.name || productNames[item.product_id] || `Produto ${item.product_id}`;
          
          // Debug simplificado
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Item do carrinho:', {
              productId: item.product_id,
              selectedSize: item.selectedSize
            });
          }
          
          const orderItem = {
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product?.price || 0,
            product_name: productName,
            selectedSize: item.selectedSize || null
          };
          
          
          return orderItem;
        }),
        payment_method: 'mercado_pago', // Método padrão
        total_amount: getCartTotal(),
        customer_email: addressData.email,
        customer_name: addressData.fullName,
        customer_phone: addressData.phone,
        shipping_address: {
          full_name: addressData.fullName,
          email: addressData.email,
          phone: addressData.phone,
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.cep
        }
      };

      console.log('🔍 Processando pagamento com dados:', orderData);

      // Debug: Verificar dados antes de enviar para paymentService
      console.log('🔍 DEBUG - Dados enviados para paymentService:', {
        itemsCount: orderData.items.length,
        itemsWithSize: orderData.items.filter(item => item.selectedSize !== undefined).length,
        itemsDetails: orderData.items.map(item => ({
          product_id: item.product_id,
          selectedSize: item.selectedSize,
          hasSelectedSize: item.selectedSize !== undefined
        }))
      });
      
      console.log('🔍 DEBUG - Chamando paymentService.processPayment...');
      const result = await paymentService.processPayment(orderData);
      console.log('🔍 DEBUG - Resultado do paymentService:', result);
      
      if (result.success && result.redirectUrl) {
        console.log('✅ Redirecionando para Mercado Pago:', result.redirectUrl);
        // Redirecionar imediatamente para o Mercado Pago
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(result.message || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro no checkout",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      setStep('address');
      setIsProcessing(false);
    }
  };


  const handleClose = () => {
    if (!isProcessing) {
      setStep('address');
      setShippingAddress(null);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep('address');
      setShippingAddress(null);
      // Buscar nomes dos produtos que não foram carregados
      console.log('🔍 DEBUG - CheckoutModal aberto, items:', items);
      console.log('🔍 DEBUG - Items sem nome:', items.filter(item => !item.product?.name));
      fetchMissingProductNames();
    }
  }, [isOpen, items]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'address' && <MapPin className="h-5 w-5" />}
            {step === 'processing' && <CreditCard className="h-5 w-5" />}
            {step === 'success' && <CheckCircle className="h-5 w-5" />}
            {step === 'address' && "Finalizar Compra"}
            {step === 'processing' && "Redirecionando para pagamento..."}
            {step === 'success' && "Pagamento realizado!"}
          </DialogTitle>
          <DialogDescription>
            {step === 'address' && "Informe os dados para entrega e será redirecionado para o pagamento"}
            {step === 'processing' && "Aguarde enquanto redirecionamos para o Mercado Pago..."}
            {step === 'success' && "Seu pedido foi confirmado com sucesso!"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do pedido - sempre visível */}
          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Resumo do Pedido
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('🔍 DEBUG - Forçando debug do carrinho:', items);
                console.log('🔍 DEBUG - ProductNames:', productNames);
                console.log('🔍 DEBUG - Items com tamanho:', items.filter(item => item.selectedSize));
                fetchMissingProductNames();
              }}
            >
              Debug Carrinho
            </Button>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum item no carrinho
                </div>
              ) : (
                items.map((item) => {
                  const productName = item.product?.name || productNames[item.product_id] || `Produto ${item.product_id}`;
                  // Debug simplificado
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`🔍 Item do carrinho:`, {
                      id: item.id,
                      productName: productName,
                      selectedSize: item.selectedSize
                    });
                  }
                  
                  return (
                    <div key={`${item.id}-${item.selectedSize || 'no-size'}`} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">
                          {productName}
                        </span>
                        {item.selectedSize && (
                          <span className="text-muted-foreground ml-2">Tamanho: {item.selectedSize}</span>
                        )}
                        <div className="text-xs text-gray-500">
                          Debug: ID={item.product_id}, TemProduto={!!item.product?.name}, TemFallback={!!productNames[item.product_id]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{item.quantity}x {formatPrice(item.product?.price || 0)}</div>
                        <div className="font-medium">{formatPrice((item.product?.price || 0) * item.quantity)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
            </div>
          </div>

          {step === 'address' && (
            <div className="space-y-6">
              <ShippingAddressForm
                onNext={handleAddressSubmit}
                onBack={handleClose}
                isLoading={isProcessing}
              />
              
              {/* Informações sobre pagamento */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Pagamento Seguro
                </h4>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• Após preencher o endereço, você será redirecionado para o Mercado Pago</p>
                  <p>• Poderá escolher entre PIX, cartão de crédito, débito e boleto</p>
                  <p>• Seus dados são protegidos pelo Mercado Pago</p>
                  <p>• Você será redirecionado de volta após o pagamento</p>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Redirecionando para o Mercado Pago</h3>
                <p className="text-muted-foreground">
                  Aguarde enquanto criamos sua preferência de pagamento...
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Pagamento Aprovado!</h3>
                <p className="text-muted-foreground">
                  Redirecionando para a página de confirmação...
                </p>
              </div>
            </div>
          )}

          {/* Botão de cancelar - sempre visível exceto no sucesso */}
          {step !== 'success' && step !== 'processing' && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Cancelar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;