import React, { useState } from 'react';
import { FileText, Download, Copy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { mercadoPagoService } from '@/integrations/mercado-pago/mercadoPagoService';
import { isMercadoPagoConfigured } from '@/integrations/mercado-pago/config';
import { PaymentResult, OrderData } from '@/types/payment';

interface MercadoPagoBoletoFormProps {
  totalAmount: number;
  orderData: OrderData;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

const MercadoPagoBoletoForm: React.FC<MercadoPagoBoletoFormProps> = ({
  totalAmount,
  orderData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [cpf, setCpf] = useState('');

  // Formatar CPF
  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').substring(0, 11);
    const formatted = cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(formatted);
  };

  // Validar CPF
  const isValidCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  // Gerar boleto
  const generateBoleto = async () => {
    if (!isMercadoPagoConfigured) {
      onPaymentError('Mercado Pago não configurado. Configure as credenciais no arquivo .env');
      return;
    }

    if (!isValidCPF(cpf)) {
      onPaymentError('CPF inválido');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await mercadoPagoService.createBoletoPayment(orderData);

      if (result.success) {
        setPaymentResult(result);
        toast({
          title: "Boleto Gerado!",
          description: "Baixe ou copie o código de barras para pagar"
        });
        onPaymentSuccess(result);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Erro ao gerar boleto:', error);
      onPaymentError(error.message || 'Erro ao gerar boleto');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copiar código de barras
  const copyBarCode = () => {
    if (!paymentResult?.details?.boleto_data?.barCode) return;

    navigator.clipboard.writeText(paymentResult.details.boleto_data.barCode);
    toast({
      title: "Código Copiado!",
      description: "Cole no app do seu banco para pagar"
    });
  };

  // Baixar boleto
  const downloadBoleto = () => {
    if (!paymentResult?.boletoUrl) return;

    window.open(paymentResult.boletoUrl, '_blank');
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Formatar data
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Se o boleto ainda não foi gerado
  if (!paymentResult) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Pagamento via Boleto</h4>
              <p className="text-sm text-blue-700 mb-2">
                Pague em qualquer banco, lotérica ou app bancário
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>✓ Vencimento em 3 dias úteis</li>
                <li>✓ Sem taxas adicionais</li>
                <li>✓ Aprovação em até 2 dias úteis</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF do Titular</Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => formatCPF(e.target.value)}
            maxLength={14}
            required
          />
          <p className="text-xs text-gray-500">
            CPF necessário para emissão do boleto
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total a pagar</span>
            <span className="text-2xl font-bold text-brand-green">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>

        <Button
          onClick={generateBoleto}
          className="w-full"
          disabled={isGenerating || !cpf}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando Boleto...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Boleto
            </>
          )}
        </Button>
      </div>
    );
  }

  // Boleto gerado - mostrar detalhes
  const boletoData = paymentResult.details?.boleto_data;

  return (
    <div className="space-y-4">
      {/* Sucesso */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <FileText className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-green-900 mb-1">Boleto Gerado com Sucesso!</h4>
          <p className="text-sm text-green-700">
            Pague até o vencimento para garantir seu pedido
          </p>
        </div>
      </div>

      {/* Informações do Boleto */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-sm text-gray-600">Valor</span>
          <span className="text-xl font-bold text-brand-green">
            {formatPrice(boletoData?.amount || totalAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Vencimento</span>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">
              {boletoData?.dueDate ? formatDate(boletoData.dueDate) : 'Em 3 dias'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t">
          <span className="text-sm text-gray-600 block mb-2">Código de Barras</span>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm break-all">
            {boletoData?.barCode || paymentResult.paymentId}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={copyBarCode}
          variant="outline"
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copiar Código
        </Button>

        <Button
          onClick={downloadBoleto}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Boleto
        </Button>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Baixe o boleto ou copie o código de barras</li>
          <li>Pague em qualquer banco, lotérica ou app bancário</li>
          <li>O pagamento pode levar até 2 dias úteis para ser confirmado</li>
          <li>Você receberá um email quando o pagamento for aprovado</li>
        </ol>
      </div>

      {/* Aviso de vencimento */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <p className="text-sm text-orange-900">
          ⚠️ <strong>Atenção:</strong> O boleto vence em{' '}
          {boletoData?.dueDate ? formatDate(boletoData.dueDate) : '3 dias'}.
          Após o vencimento, o pedido será cancelado automaticamente.
        </p>
      </div>
    </div>
  );
};

export default MercadoPagoBoletoForm;


