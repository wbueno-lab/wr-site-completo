import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  FileText, 
  Building2, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { paymentService, PaymentMethod } from '@/services/paymentService';

// Interface local para compatibilidade com o componente existente
export interface PaymentMethodLocal {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  requiresOnline: boolean;
  processingFeePercentage: number;
  minAmount: number;
  maxAmount?: number;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
  totalAmount: number;
  paymentMethods?: PaymentMethodLocal[]; // Opcional para usar dados do serviço
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  totalAmount,
  paymentMethods: propPaymentMethods,
  onPaymentSuccess,
  onPaymentError
}: PaymentMethodSelectorProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodLocal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar métodos de pagamento do serviço
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const methods = await paymentService.getPaymentMethods();
        
        // Converter para formato local
        const localMethods: PaymentMethodLocal[] = methods.map(method => ({
          id: method.id,
          name: method.name,
          description: getMethodDescription(method.type),
          icon: getMethodIcon(method.type),
          isActive: method.enabled,
          requiresOnline: method.type !== 'bank_transfer' && method.type !== 'boleto',
          processingFeePercentage: method.processing_fee_percentage,
          minAmount: method.min_amount,
          maxAmount: method.max_amount
        }));

        setPaymentMethods(localMethods);
      } catch (error) {
        console.error('Erro ao carregar métodos de pagamento:', error);
        // Usar métodos padrão em caso de erro
        setPaymentMethods(propPaymentMethods || []);
      } finally {
        setIsLoading(false);
      }
    };

    if (!propPaymentMethods) {
      loadPaymentMethods();
    } else {
      setPaymentMethods(propPaymentMethods);
      setIsLoading(false);
    }
  }, [propPaymentMethods]);

  // Obter descrição do método de pagamento
  const getMethodDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'credit_card': 'Pague com cartão de crédito Visa, Mastercard, Elo',
      'debit_card': 'Pague com cartão de débito Visa, Mastercard, Elo',
      'pix': 'Pague instantaneamente com PIX',
      'boleto': 'Pague com boleto bancário',
      'bank_transfer': 'Pague via transferência bancária'
    };
    return descriptions[type] || 'Método de pagamento';
  };

  // Obter ícone do método de pagamento
  const getMethodIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'credit_card': 'credit-card',
      'debit_card': 'credit-card',
      'pix': 'smartphone',
      'boleto': 'file-text',
      'bank_transfer': 'bank'
    };
    return icons[type] || 'credit-card';
  };
  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (iconName) {
      case 'credit-card':
        return <CreditCard {...iconProps} />;
      case 'debit-card':
        return <CreditCard {...iconProps} />;
      case 'smartphone':
        return <Smartphone {...iconProps} />;
      case 'file-text':
        return <FileText {...iconProps} />;
      case 'bank':
        return <Building2 {...iconProps} />;
      case 'dollar-sign':
        return <DollarSign {...iconProps} />;
      default:
        return <CreditCard {...iconProps} />;
    }
  };

  const isMethodAvailable = (method: PaymentMethodLocal) => {
    if (!method.isActive) return false;
    if (totalAmount < method.minAmount) return false;
    if (method.maxAmount && totalAmount > method.maxAmount) return false;
    return true;
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-white">Forma de Pagamento</h3>
          <Loader2 className="h-4 w-4 animate-spin text-brand-green" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-gray-600 bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-600 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-600 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-white">Forma de Pagamento</h3>
        <Badge variant="outline" className="text-xs">
          {paymentMethods.filter(m => isMethodAvailable(m)).length} opções
        </Badge>
      </div>

      <RadioGroup value={selectedMethod || ''} onValueChange={onMethodSelect}>
        <div className="grid gap-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {paymentMethods.map((method) => {
            const isAvailable = isMethodAvailable(method);

            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedMethod === method.id
                    ? 'border-brand-green bg-brand-green/10 shadow-lg'
                    : isAvailable
                    ? 'border-gray-600 hover:border-brand-green/50 hover:bg-brand-dark-lighter'
                    : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => isAvailable && onMethodSelect(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={method.id} 
                      id={method.id}
                      disabled={!isAvailable}
                      className="text-brand-green"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          selectedMethod === method.id 
                            ? 'bg-brand-green/20 text-brand-green' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {getIcon(method.icon)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label 
                              htmlFor={method.id} 
                              className={`font-semibold cursor-pointer ${
                                isAvailable ? 'text-white' : 'text-gray-400'
                              }`}
                            >
                              {method.name}
                            </Label>
                            
                            {!isAvailable && (
                              <AlertCircle className="h-4 w-4 text-orange-400" />
                            )}
                            
                            {method.requiresOnline && (
                              <Badge variant="outline" className="text-xs">
                                Online
                              </Badge>
                            )}
                          </div>
                          
                          <p className={`text-sm ${
                            isAvailable ? 'text-muted-foreground' : 'text-gray-500'
                          }`}>
                            {method.description}
                          </p>
                        </div>
                      </div>


                      {!isAvailable && (
                        <div className="ml-11">
                          {totalAmount < method.minAmount && (
                            <p className="text-xs text-orange-400">
                              Valor mínimo: {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(method.minAmount)}
                            </p>
                          )}
                          {method.maxAmount && totalAmount > method.maxAmount && (
                            <p className="text-xs text-orange-400">
                              Valor máximo: {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(method.maxAmount)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-brand-green" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>

      {selectedMethod && (
        <div className="mt-4">
          <div className="p-4 bg-brand-green/10 border border-brand-green/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-brand-green" />
              <span className="text-sm font-semibold text-brand-green">
                Forma de pagamento selecionada
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Você será redirecionado para finalizar o pagamento após confirmar o pedido.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
