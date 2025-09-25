import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CardFormData {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
}

interface MercadoPagoCardFormProps {
  totalAmount: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
  productName?: string;
}

const MercadoPagoCardForm = ({ 
  totalAmount, 
  onPaymentSuccess, 
  onPaymentError, 
  isLoading = false,
  productName
}: MercadoPagoCardFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    installments: 1
  });
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardType, setCardType] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detectar tipo de cartão
  useEffect(() => {
    const number = formData.cardNumber.replace(/\D/g, '');
    if (number.startsWith('4')) {
      setCardType('Visa');
    } else if (number.startsWith('5') || number.startsWith('2')) {
      setCardType('Mastercard');
    } else if (number.startsWith('3')) {
      setCardType('American Express');
    } else if (number.startsWith('6')) {
      setCardType('Elo');
    } else {
      setCardType('');
    }
  }, [formData.cardNumber]);

  // Gerar opções de parcelamento
  const generateInstallmentOptions = () => {
    const options = [];
    const maxInstallments = Math.min(12, Math.floor(totalAmount / 50)); // Mínimo R$ 50 por parcela
    
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = totalAmount / i;
      const interestRate = i > 1 ? 2.99 : 0; // Taxa de juros para parcelas
      const totalWithInterest = i > 1 ? totalAmount * (1 + interestRate / 100) : totalAmount;
      const monthlyValue = totalWithInterest / i;
      
      options.push({
        value: i,
        label: i === 1 
          ? `À vista - R$ ${totalAmount.toFixed(2).replace('.', ',')}`
          : `${i}x de R$ ${monthlyValue.toFixed(2).replace('.', ',')} ${
              i > 1 ? `(Total: R$ ${totalWithInterest.toFixed(2).replace('.', ',')})` : ''
            }`
      });
    }
    
    return options;
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar número do cartão
    const cardNumber = formData.cardNumber.replace(/\D/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    // Validar nome
    if (formData.cardName.trim().length < 2) {
      newErrors.cardName = 'Nome no cartão é obrigatório';
    }

    // Validar CVV
    if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'CVV inválido';
    }

    // Validar data de expiração
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Data de expiração é obrigatória';
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear);
      const expiryMonth = parseInt(formData.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiry = 'Cartão expirado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    const formatted = number.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  // Formatar CVV
  const formatCvv = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  // Formatar nome do cartão
  const formatCardName = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z\s]/g, '');
  };

  // Processar pagamento
  const handlePayment = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simular processamento do pagamento
      // Em uma implementação real, aqui você faria a chamada para a API do Mercado Pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular sucesso/erro baseado em dados de teste
      const cardNumber = formData.cardNumber.replace(/\D/g, '');
      const isTestCard = cardNumber.startsWith('4000') || cardNumber.startsWith('5000');
      
      if (isTestCard) {
        onPaymentSuccess({
          paymentId: `mp_${Date.now()}`,
          status: 'approved',
          amount: totalAmount,
          installments: formData.installments,
          cardType,
          cardLastFour: cardNumber.slice(-4)
        });
      } else {
        throw new Error('Cartão de teste inválido. Use cartões que começam com 4000 ou 5000');
      }
    } catch (error: any) {
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const installmentOptions = generateInstallmentOptions();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-green" />
          Pagamento com Cartão
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Informe os dados do seu cartão de crédito
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Número do Cartão */}
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Número do Cartão *</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              type="text"
              placeholder="0000 0000 0000 0000"
              value={formData.cardNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                cardNumber: formatCardNumber(e.target.value)
              }))}
              className={`pr-20 ${errors.cardNumber ? 'border-red-500' : ''}`}
              maxLength={19}
            />
            {cardType && (
              <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2">
                {cardType}
              </Badge>
            )}
          </div>
          {errors.cardNumber && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.cardNumber}
            </p>
          )}
        </div>

        {/* Nome no Cartão */}
        <div className="space-y-2">
          <Label htmlFor="cardName">Nome no Cartão *</Label>
          <Input
            id="cardName"
            type="text"
            placeholder="NOME COMO NO CARTÃO"
            value={formData.cardName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              cardName: formatCardName(e.target.value)
            }))}
            className={errors.cardName ? 'border-red-500' : ''}
          />
          {errors.cardName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.cardName}
            </p>
          )}
        </div>

        {/* Data de Expiração e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Validade *</Label>
            <div className="flex gap-2">
              <Select
                value={formData.expiryMonth}
                onValueChange={(value) => setFormData(prev => ({ ...prev, expiryMonth: value }))}
              >
                <SelectTrigger className={errors.expiry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={formData.expiryYear}
                onValueChange={(value) => setFormData(prev => ({ ...prev, expiryYear: value }))}
              >
                <SelectTrigger className={errors.expiry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {errors.expiry && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.expiry}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV *</Label>
            <div className="relative">
              <Input
                id="cvv"
                type={showCvv ? 'text' : 'password'}
                placeholder="000"
                value={formData.cvv}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cvv: formatCvv(e.target.value)
                }))}
                className={`pr-10 ${errors.cvv ? 'border-red-500' : ''}`}
                maxLength={4}
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.cvv && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cvv}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Parcelamento */}
        <div className="space-y-2">
          <Label>Parcelamento</Label>
          <Select
            value={String(formData.installments)}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              installments: parseInt(value) 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {installmentOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resumo do Pagamento */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          {productName && (
            <div className="flex justify-between text-sm">
              <span>Produto:</span>
              <span className="font-medium">{productName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Valor:</span>
            <span>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
          </div>
          {formData.installments > 1 && (
            <div className="flex justify-between text-sm">
              <span>Parcelas:</span>
              <span>{formData.installments}x</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-brand-green">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Botão de Pagamento */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || isLoading}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pagar R$ {totalAmount.toFixed(2).replace('.', ',')}
            </>
          )}
        </Button>

        {/* Informações de Segurança */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Pagamento seguro e criptografado</span>
        </div>

        {/* Cartões de Teste */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Cartões de Teste:
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Visa:</strong> 4000 0000 0000 0002</p>
            <p><strong>Mastercard:</strong> 5000 0000 0000 0002</p>
            <p><strong>CVV:</strong> Qualquer 3 dígitos</p>
            <p><strong>Validade:</strong> Qualquer data futura</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoCardForm;


