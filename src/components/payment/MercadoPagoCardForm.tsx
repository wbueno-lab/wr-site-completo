import React, { useState, useEffect } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { mercadoPagoService } from '@/integrations/mercado-pago/mercadoPagoService';
import { MERCADO_PAGO_CONFIG, isMercadoPagoConfigured } from '@/integrations/mercado-pago/config';
import { PaymentResult, OrderData } from '@/types/payment';
import { MercadoPagoInstallment } from '@/integrations/mercado-pago/types';

interface MercadoPagoCardFormProps {
  totalAmount: number;
  orderData: OrderData;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

const MercadoPagoCardForm: React.FC<MercadoPagoCardFormProps> = ({
  totalAmount,
  orderData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [installments, setInstallments] = useState<MercadoPagoInstallment[]>([]);
  const [selectedInstallments, setSelectedInstallments] = useState(1);

  // Dados do cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');

  // Carregar parcelas disponíveis
  useEffect(() => {
    loadInstallments();
  }, [totalAmount]);

  const loadInstallments = async () => {
    try {
      console.log('🔄 Carregando parcelas para:', totalAmount);
      const data = await mercadoPagoService.getInstallments(totalAmount);
      console.log('✅ Parcelas carregadas:', data.length);
      setInstallments(data);
      
      if (data.length === 0) {
        toast({
          title: "Aviso",
          description: "Não foi possível carregar as parcelas. Usando valores padrão.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar parcelas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar opções de parcelamento",
        variant: "destructive"
      });
    }
  };

  // Detectar bandeira do cartão
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
    if (/^50|^63|^67/.test(cleanNumber)) return 'Elo';
    if (/^606282/.test(cleanNumber)) return 'Hipercard';
    
    return '';
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const parts = cleanValue.match(/.{1,4}/g) || [];
    const formatted = parts.join(' ').substring(0, 19);
    
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  // Formatar CVV
  const formatCVV = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').substring(0, 4);
    setCvv(cleanValue);
  };

  // Validar formulário
  const validateForm = (): boolean => {
    if (cardNumber.replace(/\s/g, '').length < 13) {
      onPaymentError('Número do cartão inválido');
      return false;
    }

    if (!cardName || cardName.length < 3) {
      onPaymentError('Nome no cartão inválido');
      return false;
    }

    if (!expiryMonth || !expiryYear) {
      onPaymentError('Data de validade inválida');
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      onPaymentError('Cartão vencido');
      return false;
    }

    if (cvv.length < 3) {
      onPaymentError('CVV inválido');
      return false;
    }

    return true;
  };

  // Processar pagamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMercadoPagoConfigured) {
      onPaymentError('Mercado Pago não configurado. Configure as credenciais no arquivo .env');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Aqui você usaria o SDK do Mercado Pago para criar o token do cartão
      // Por enquanto, vou simular o processo
      
      // Em produção, usar:
      // const cardToken = await createCardToken({
      //   cardNumber: cardNumber.replace(/\s/g, ''),
      //   cardholderName: cardName,
      //   cardExpirationMonth: expiryMonth,
      //   cardExpirationYear: '20' + expiryYear,
      //   securityCode: cvv,
      //   identificationType: 'CPF',
      //   identificationNumber: '00000000000'
      // });

      // Simulação para desenvolvimento
      const simulatedToken = `card_token_${Date.now()}`;

      const result = await mercadoPagoService.createCardPayment(
        orderData,
        simulatedToken,
        selectedInstallments
      );

      if (result.success) {
        toast({
          title: "Pagamento Aprovado!",
          description: "Seu pagamento foi processado com sucesso"
        });
        onPaymentSuccess(result);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      onPaymentError(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-1">Pagamento Seguro</h4>
          <p className="text-sm text-blue-700">
            Seus dados são protegidos pelo Mercado Pago
          </p>
        </div>
      </div>

      {/* Número do Cartão */}
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-white font-medium">Número do Cartão</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => formatCardNumber(e.target.value)}
            maxLength={19}
            className="text-white bg-gray-800"
            required
          />
          {cardType && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300">
              {cardType}
            </span>
          )}
        </div>
      </div>

      {/* Nome no Cartão */}
      <div className="space-y-2">
        <Label htmlFor="cardName" className="text-white font-medium">Nome no Cartão</Label>
        <Input
          id="cardName"
          type="text"
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          className="text-white bg-gray-800"
          required
        />
      </div>

      {/* Validade e CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth" className="text-white font-medium">Mês</Label>
          <Select value={expiryMonth} onValueChange={setExpiryMonth} required>
            <SelectTrigger className="text-white bg-gray-800">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryYear" className="text-white font-medium">Ano</Label>
          <Select value={expiryYear} onValueChange={setExpiryYear} required>
            <SelectTrigger className="text-white bg-gray-800">
              <SelectValue placeholder="AA" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 15 }, (_, i) => {
                const year = new Date().getFullYear() % 100 + i;
                return (
                  <SelectItem key={year} value={year.toString().padStart(2, '0')}>
                    {year.toString().padStart(2, '0')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv" className="text-white font-medium">CVV</Label>
          <Input
            id="cvv"
            type="text"
            placeholder="123"
            value={cvv}
            onChange={(e) => formatCVV(e.target.value)}
            maxLength={4}
            className="text-white bg-gray-800"
            required
          />
        </div>
      </div>

      {/* Parcelas */}
      <div className="space-y-2">
        <Label htmlFor="installments" className="text-white font-medium">Parcelas</Label>
        <Select
          value={selectedInstallments.toString()}
          onValueChange={(value) => setSelectedInstallments(parseInt(value))}
        >
          <SelectTrigger className="text-white bg-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {installments.map((inst) => (
              <SelectItem key={inst.installments} value={inst.installments.toString()}>
                {inst.recommended_message}
                {inst.installments === 1 && ' (sem juros)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Total */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white font-medium">Total a pagar</span>
          <span className="text-xl font-bold text-brand-green">
            {formatPrice(
              installments.find(i => i.installments === selectedInstallments)?.total_amount || totalAmount
            )}
          </span>
        </div>
        {selectedInstallments > 1 && (
          <p className="text-xs text-gray-300 mt-1">
            {selectedInstallments}x de {formatPrice(
              (installments.find(i => i.installments === selectedInstallments)?.installment_amount || 0)
            )}
          </p>
        )}
      </div>

      {/* Botão de Pagamento */}
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pagar {formatPrice(totalAmount)}
          </>
        )}
      </Button>
    </form>
  );
};

export default MercadoPagoCardForm;


