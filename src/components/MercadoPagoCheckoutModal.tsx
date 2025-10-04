import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, ShoppingCart, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/components/ui/use-toast';
import ShippingAddressForm from './ShippingAddressForm';
import ShippingCalculator from './checkout/ShippingCalculator';
import MercadoPagoCardForm from './payment/MercadoPagoCardForm';
import MercadoPagoPixForm from './payment/MercadoPagoPixForm';
import { supabase } from '@/integrations/supabase/client';
import { ShippingService, PaymentResult, OrderData } from '@/types/payment';
import { shippingService } from '@/services/shippingService';

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

interface MercadoPagoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'processing' | 'success';

const MercadoPagoCheckoutModal = ({ isOpen, onClose }: MercadoPagoCheckoutModalProps) => {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados do checkout
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingService | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  // Calcular totais
  const subtotal = getCartTotal();
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost;
  // Calcular peso total usando o peso padrão de capacetes (2kg)
  const totalWeight = items.reduce((acc, item) => {
    const itemWeight = 2.0; // Peso padrão para capacetes
    return acc + (item.quantity * itemWeight);
  }, 0);

  // Resetar estado quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('address');
      setShippingAddress(null);
      setSelectedShipping(null);
      setSelectedPaymentMethod('credit_card');
      setIsProcessing(false);
      fetchMissingProductNames();
    }
  }, [isOpen]);

  // Buscar nomes de produtos
  const fetchMissingProductNames = async () => {
    const missingProducts = items.filter(item => !item.product?.name);
    if (missingProducts.length === 0) return;

    try {
      const productIds = missingProducts.map(item => item.product_id);
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      if (error) {
        console.error('Erro ao buscar nomes dos produtos:', error);
        return;
      }

      const namesMap: Record<string, string> = {};
      data?.forEach(product => {
        namesMap[product.id] = product.name;
      });
      setProductNames(namesMap);
    } catch (error) {
      console.error('Erro ao buscar nomes dos produtos:', error);
    }
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Submissão do endereço
  const handleAddressSubmit = (addressData: ShippingAddressData) => {
    setShippingAddress(addressData);
    setCurrentStep('shipping');
  };

  // Selecionar frete
  const handleShippingSelect = (shipping: ShippingService) => {
    setSelectedShipping(shipping);
  };

  // Avançar para pagamento
  const handleContinueToPayment = () => {
    if (!selectedShipping) {
      toast({
        title: "Erro",
        description: "Selecione uma opção de frete",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('payment');
  };

  // Passo anterior
  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'shipping':
        setCurrentStep('address');
        break;
      case 'payment':
        setCurrentStep('shipping');
        break;
    }
  };

  // Preparar dados do pedido
  const prepareOrderData = (): OrderData => {
    return {
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        unit_price: item.product?.price || 0,
        product_name: item.product?.name || productNames[item.product_id] || `Produto ${item.product_id}`,
        selectedSize: item.selectedSize || undefined,
        // Incluir product_snapshot completo para que a Edge Function tenha todos os dados
        product_snapshot: item.product ? {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          original_price: item.product.original_price,
          image_url: item.product.image_url, // ⭐ CRUCIAL: incluir a imagem
          description: item.product.description,
          sku: item.product.sku,
          is_new: item.product.is_new,
          is_promo: item.product.is_promo,
          stock_quantity: item.product.stock_quantity,
          weight: item.product.weight,
          material: item.product.material,
          helmet_type: item.product.helmet_type,
          available_sizes: item.product.available_sizes,
          helmet_numbers: item.product.helmet_numbers,
          color_options: item.product.color_options,
          warranty_period: item.product.warranty_period,
          country_of_origin: item.product.country_of_origin,
          gallery: item.product.gallery,
          selected_size: item.selectedSize
        } : undefined,
        weight: 2.0, // Peso padrão para capacetes
        dimensions: {
          length: 27,
          width: 27,
          height: 27
        }
      })),
      payment_method: selectedPaymentMethod,
      total_amount: total,
      shipping_cost: shippingCost,
      shipping_service: selectedShipping?.code,
      customer_email: shippingAddress?.email || user?.email || '',
      customer_name: shippingAddress?.fullName || '',
      customer_phone: shippingAddress?.phone || '',
      shipping_address: {
        full_name: shippingAddress?.fullName || '',
        email: shippingAddress?.email || '',
        phone: shippingAddress?.phone || '',
        street: shippingAddress?.street || '',
        number: shippingAddress?.number || '',
        complement: shippingAddress?.complement,
        neighborhood: shippingAddress?.neighborhood || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zip_code: shippingAddress?.cep.replace(/\D/g, '') || ''
      }
    };
  };

  // Sucesso do pagamento
  const handlePaymentSuccess = (result: PaymentResult) => {
    console.log('✅ Pagamento bem-sucedido:', result);
    clearCart();
    setCurrentStep('success');
    
    toast({
      title: "Pagamento Processado!",
      description: "Seu pagamento foi processado com sucesso"
    });
  };

  // Erro do pagamento
  const handlePaymentError = (error: string) => {
    toast({
      title: "Erro no Pagamento",
      description: error,
      variant: "destructive"
    });
  };

  // Título do passo
  const getStepTitle = () => {
    switch (currentStep) {
      case 'address':
        return 'Endereço de Entrega';
      case 'shipping':
        return 'Frete e Entrega';
      case 'payment':
        return 'Forma de Pagamento';
      case 'processing':
        return 'Processando Pagamento';
      case 'success':
        return 'Pedido Realizado!';
      default:
        return 'Checkout';
    }
  };

  // Renderizar conteúdo do passo
  const renderStepContent = () => {
    const orderData = prepareOrderData();

    switch (currentStep) {
      case 'address':
        return (
          <ShippingAddressForm
            onSubmit={handleAddressSubmit}
            initialData={shippingAddress}
          />
        );

      case 'shipping':
        return (
          <ShippingCalculator
            selectedService={selectedShipping?.code}
            onServiceSelect={handleShippingSelect}
            totalWeight={totalWeight}
            cep={shippingAddress?.cep}
          />
        );

      case 'payment':
        return (
          <div className="space-y-6">
            {/* Seletor de Método de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('credit_card')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  selectedPaymentMethod === 'credit_card'
                    ? 'border-brand-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className={`h-6 w-6 mx-auto mb-2 ${
                  selectedPaymentMethod === 'credit_card' ? 'text-gray-700' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedPaymentMethod === 'credit_card' ? 'text-gray-700' : 'text-gray-600'
                }`}>Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('pix')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  selectedPaymentMethod === 'pix'
                    ? 'border-brand-green bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className={`h-6 w-6 mx-auto mb-2 ${
                  selectedPaymentMethod === 'pix' ? 'text-gray-700' : 'text-gray-600'
                }`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
                </svg>
                <span className={`text-sm font-medium ${
                  selectedPaymentMethod === 'pix' ? 'text-gray-700' : 'text-gray-600'
                }`}>PIX</span>
              </button>
            </div>
            
            {/* Formulário do método selecionado */}
            {selectedPaymentMethod === 'credit_card' && (
              <MercadoPagoCardForm
                totalAmount={total}
                orderData={orderData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}
            
            {selectedPaymentMethod === 'pix' && (
              <MercadoPagoPixForm
                totalAmount={total}
                orderData={orderData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}
            
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-green mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processando Pagamento</h3>
            <p className="text-muted-foreground">
              Aguarde enquanto processamos seu pagamento...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-brand-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pedido Realizado com Sucesso!</h3>
            <p className="text-muted-foreground mb-6">
              Você receberá um email com os detalhes do seu pedido
            </p>
            <Button onClick={onClose} className="w-full">
              Continuar Comprando
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" aria-describedby="cart-empty-description">
          <DialogHeader>
            <DialogTitle>Carrinho Vazio</DialogTitle>
            <DialogDescription id="cart-empty-description">
              Adicione produtos ao carrinho antes de finalizar a compra.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Continuar Comprando</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="checkout-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {getStepTitle()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription id="checkout-description">
            Complete seu pedido seguindo os passos abaixo
          </DialogDescription>
          
          {/* Indicador de Progresso */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {['address', 'shipping', 'payment'].map((step, index) => {
              const stepIndex = ['address', 'shipping', 'payment'].indexOf(currentStep);
              const isActive = step === currentStep;
              const isCompleted = index < stepIndex;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isActive ? 'bg-brand-green text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-8 h-1 mx-2 ${
                      index < stepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        {/* Resumo do Carrinho */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-2 text-gray-900">Resumo do Pedido</h4>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.selectedSize}`} className="flex justify-between text-sm text-gray-900">
                <span>
                  {item.product?.name || productNames[item.product_id] || `Produto ${item.product_id}`}
                  {item.selectedSize && ` (${item.selectedSize})`}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm text-gray-900">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {selectedShipping && (
                <div className="flex justify-between text-sm text-gray-900">
                  <span>Frete ({selectedShipping.name}):</span>
                  <span>
                    {selectedShipping.price === 0 
                      ? 'Grátis' 
                      : formatPrice(selectedShipping.price)
                    }
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do Passo */}
        <div className="space-y-6">
          {renderStepContent()}
        </div>

        {/* Botões de Navegação */}
        {currentStep !== 'processing' && currentStep !== 'success' && currentStep !== 'payment' && (
          <div className="flex gap-2 pt-4">
            {currentStep !== 'address' && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isProcessing}
              >
                Voltar
              </Button>
            )}
            
            {currentStep === 'shipping' && (
              <Button
                onClick={handleContinueToPayment}
                disabled={!selectedShipping || isProcessing}
                className="flex-1"
              >
                Continuar para Pagamento
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MercadoPagoCheckoutModal;


