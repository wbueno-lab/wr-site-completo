import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { mercadoPagoService } from '@/integrations/mercado-pago/mercadoPagoService';
import { isMercadoPagoConfigured } from '@/integrations/mercado-pago/config';
import { PaymentResult, OrderData } from '@/types/payment';

interface MercadoPagoPixFormProps {
  totalAmount: number;
  orderData: OrderData;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

const MercadoPagoPixForm: React.FC<MercadoPagoPixFormProps> = ({
  totalAmount,
  orderData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutos em segundos
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Timer para expiração do PIX
  useEffect(() => {
    if (!paymentResult) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentResult]);

  // Verificar pagamento periodicamente
  useEffect(() => {
    if (!paymentResult?.paymentId) return;

    const checkInterval = setInterval(async () => {
      await checkPaymentStatus();
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(checkInterval);
  }, [paymentResult]);

  // Gerar PIX
  const generatePix = async () => {
    if (!isMercadoPagoConfigured) {
      onPaymentError('Mercado Pago não configurado. Configure as credenciais no arquivo .env');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await mercadoPagoService.createPixPayment(orderData);

      if (result.success) {
        setPaymentResult(result);
        toast({
          title: "PIX Gerado!",
          description: "Escaneie o QR Code ou copie o código PIX"
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error);
      onPaymentError(error.message || 'Erro ao gerar PIX');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verificar status do pagamento
  const checkPaymentStatus = async () => {
    if (!paymentResult?.paymentId || isCheckingPayment) return;

    setIsCheckingPayment(true);

    try {
      const result = await mercadoPagoService.checkPaymentStatus(paymentResult.paymentId);

      if (result.status === 'approved') {
        toast({
          title: "Pagamento Confirmado!",
          description: "Seu pagamento PIX foi aprovado"
        });
        onPaymentSuccess(result);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Copiar código PIX
  const copyPixCode = () => {
    if (!paymentResult?.qrCode) return;

    navigator.clipboard.writeText(paymentResult.qrCode);
    toast({
      title: "Código Copiado!",
      description: "Cole no app do seu banco para pagar"
    });
  };

  // Formatar tempo restante
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Se o PIX ainda não foi gerado
  if (!paymentResult) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Pagamento via PIX</h4>
              <p className="text-sm text-blue-700 mb-2">
                Instantâneo e sem taxas adicionais
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>✓ Aprovação imediata</li>
                <li>✓ Disponível 24h por dia</li>
                <li>✓ Código válido por 30 minutos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Total a pagar</span>
            <span className="text-2xl font-bold text-brand-green">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>

        <Button
          onClick={generatePix}
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando PIX...
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Gerar Código PIX
            </>
          )}
        </Button>
      </div>
    );
  }

  // PIX gerado - mostrar QR Code e código
  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">
            Tempo restante:
          </span>
        </div>
        <span className="text-lg font-bold text-orange-600">
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* QR Code */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="text-center font-semibold mb-4">Escaneie o QR Code</h4>
        
        {paymentResult.details?.pix_data?.qrCodeBase64 ? (
          <div className="flex justify-center mb-4">
            <img
              src={`data:image/png;base64,${paymentResult.details.pix_data.qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-64 h-64"
            />
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="h-32 w-32 text-gray-400" />
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-600">
          Abra o app do seu banco e escaneie o código
        </p>
      </div>

      {/* Código PIX para copiar */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ou copie o código PIX:</Label>
        <div className="relative">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 pr-12 font-mono text-xs break-all">
            {paymentResult.qrCode}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyPixCode}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Entre na área PIX</li>
          <li>Escaneie o QR Code ou cole o código copiado</li>
          <li>Confirme o pagamento de {formatPrice(totalAmount)}</li>
        </ol>
      </div>

      {/* Status de verificação */}
      {isCheckingPayment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-sm text-yellow-900">
            Aguardando confirmação do pagamento...
          </span>
        </div>
      )}

      {/* Botão para verificar manualmente */}
      <Button
        onClick={checkPaymentStatus}
        variant="outline"
        className="w-full"
        disabled={isCheckingPayment}
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Verificar Pagamento
      </Button>
    </div>
  );
};

// Label component simples
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <label className={`block ${className}`}>
    {children}
  </label>
);

export default MercadoPagoPixForm;


