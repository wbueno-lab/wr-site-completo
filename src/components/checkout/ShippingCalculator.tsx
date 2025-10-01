import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  Package, 
  Clock,
  Calculator,
  Loader2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { ShippingService } from '@/types/payment';
import { shippingService } from '@/services/shippingService';
import { useToast } from '@/components/ui/use-toast';

interface ShippingCalculatorProps {
  selectedService?: string;
  onServiceSelect: (service: ShippingService) => void;
  totalWeight?: number;
  cep?: string;
  onCepChange?: (cep: string) => void;
}

const ShippingCalculator = ({ 
  selectedService, 
  onServiceSelect, 
  totalWeight = 1.5,
  cep = '',
  onCepChange
}: ShippingCalculatorProps) => {
  const { toast } = useToast();
  const [inputCep, setInputCep] = useState(cep);
  const [shippingServices, setShippingServices] = useState<ShippingService[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Atualizar CEP local quando prop muda
  useEffect(() => {
    setInputCep(cep);
  }, [cep]);

  // Formatar CEP
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Validar CEP
  const isValidCep = (cep: string): boolean => {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  };

  // Calcular frete
  const calculateShipping = async () => {
    const cleanCep = inputCep.replace(/\D/g, '');
    
    if (!isValidCep(inputCep)) {
      toast({
        title: "CEP Inválido",
        description: "Digite um CEP válido com 8 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Calcular dimensões padrão baseadas no peso
      const dimensions = shippingService.calculateDefaultDimensions(totalWeight);
      const result = await shippingService.calculateShipping(cleanCep, totalWeight, dimensions);
      const services = result.success ? result.services : [];
      setShippingServices(services);
      setHasCalculated(true);
      
      // Notificar mudança do CEP
      if (onCepChange) {
        onCepChange(cleanCep);
      }
      
      // Selecionar primeiro serviço se nenhum estiver selecionado
      if (services.length > 0 && !selectedService) {
        onServiceSelect(services[0]);
      }
      
      if (services.length === 0) {
        toast({
          title: "Nenhum serviço encontrado",
          description: "Não foi possível calcular o frete para este CEP",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      setError('Erro ao calcular frete');
      toast({
        title: "Erro no Cálculo",
        description: "Não foi possível calcular o frete. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Obter ícone da transportadora
  const getCompanyIcon = (company: string) => {
    switch (company) {
      case 'correios':
        return <Package className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  // Formatar tempo de entrega
  const formatDeliveryTime = (days: number): string => {
    if (days === 0) return 'Retirada imediata';
    if (days === 1) return '1 dia útil';
    return `${days} dias úteis`;
  };

  // Obter serviço selecionado
  const selectedServiceData = shippingServices.find(s => s.code === selectedService);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Frete e Entrega
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Calculadora de CEP */}
        <div className="space-y-2">
          <Label htmlFor="cep">CEP de Entrega</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="cep"
                type="text"
                placeholder="00000-000"
                value={inputCep}
                onChange={(e) => setInputCep(formatCep(e.target.value))}
                maxLength={9}
                className="font-mono"
              />
            </div>
            <Button 
              onClick={calculateShipping}
              disabled={isCalculating || !inputCep}
              size="default"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular
                </>
              )}
            </Button>
          </div>
          
          {!hasCalculated && (
            <p className="text-sm text-muted-foreground">
              Digite seu CEP para calcular o frete
            </p>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Serviços de Entrega */}
        {shippingServices.length > 0 && (
          <div className="space-y-3">
            <Label>Escolha o tipo de entrega:</Label>
            
            <RadioGroup 
              value={selectedService} 
              onValueChange={(code) => {
                const service = shippingServices.find(s => s.code === code);
                if (service) onServiceSelect(service);
              }}
            >
              {shippingServices.map((service) => (
                <div key={service.code} className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={service.code} id={service.code} />
                    <Label 
                      htmlFor={service.code} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCompanyIcon(service.company)}
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDeliveryTime(service.delivery_time)}</span>
                              {service.additional_info && (
                                <>
                                  <span>•</span>
                                  <span>{service.additional_info}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {service.price === 0 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Grátis
                            </Badge>
                          ) : (
                            <p className="font-semibold text-lg">
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </p>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Informações do Serviço Selecionado */}
        {selectedServiceData && (
          <>
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Detalhes da Entrega
              </h4>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Serviço:</span>
                    <span className="font-semibold">{selectedServiceData.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-700">Prazo:</span>
                    <span className="font-semibold">
                      {formatDeliveryTime(selectedServiceData.delivery_time)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-700">Valor:</span>
                    <span className="font-semibold">
                      {selectedServiceData.price === 0 
                        ? 'Grátis' 
                        : `R$ ${selectedServiceData.price.toFixed(2).replace('.', ',')}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-700">CEP:</span>
                    <span className="font-mono">{formatCep(inputCep)}</span>
                  </div>
                  
                  {totalWeight && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Peso:</span>
                      <span>{totalWeight.toFixed(1)} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Informações Gerais */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>• Prazos contados em dias úteis após confirmação do pagamento</p>
          <p>• Frete calculado com base no CEP de destino</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-yellow-600">• Valores simulados para desenvolvimento</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingCalculator;



