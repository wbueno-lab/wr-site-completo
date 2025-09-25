import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  QrCode, 
  Copy, 
  CheckCircle, 
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MercadoPagoPixFormProps {
  totalAmount: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
  productName?: string;
}

const MercadoPagoPixForm = ({ 
  totalAmount, 
  onPaymentSuccess, 
  onPaymentError, 
  isLoading = false,
  productName
}: MercadoPagoPixFormProps) => {
  const { toast } = useToast();
  const [pixCode, setPixCode] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos

  // Gerar código PIX
  const generatePixCode = async () => {
    setIsGenerating(true);
    
    try {
      // Simular geração do código PIX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Código PIX simulado
      const mockPixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${totalAmount.toFixed(2)}5802BR5913MERCADO PAGO6009SAO PAULO62070503***6304`;
      const mockQrCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12">
            QR Code PIX
          </text>
        </svg>
      `)}`;
      
      setPixCode(mockPixCode);
      setQrCode(mockQrCode);
      
      toast({
        title: "Código PIX Gerado",
        description: "Escaneie o QR Code ou copie o código para pagar"
      });
    } catch (error) {
      onPaymentError('Erro ao gerar código PIX');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copiar código PIX
  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast({
        title: "Código Copiado",
        description: "Código PIX copiado para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive"
      });
    }
  };

  // Simular pagamento PIX
  const simulatePayment = () => {
    setIsPaid(true);
    onPaymentSuccess({
      paymentId: `pix_${Date.now()}`,
      status: 'approved',
      amount: totalAmount,
      method: 'pix'
    });
  };

  // Timer countdown
  useEffect(() => {
    if (pixCode && !isPaid) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [pixCode, isPaid]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Smartphone className="h-5 w-5 text-brand-green" />
          Pagamento PIX
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pague instantaneamente com PIX
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!pixCode ? (
          // Gerar PIX
          <div className="text-center space-y-4">
            <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-6">
              <QrCode className="h-12 w-12 text-brand-green mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">
                Pagamento Instantâneo
              </h3>
              <p className="text-sm text-muted-foreground">
                Gere seu código PIX e pague em segundos
              </p>
            </div>

            <Button
              onClick={generatePixCode}
              disabled={isGenerating || isLoading}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Gerar Código PIX
                </>
              )}
            </Button>
          </div>
        ) : isPaid ? (
          // Pagamento Aprovado
          <div className="text-center space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">
                Pagamento Aprovado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Seu pagamento PIX foi processado com sucesso
              </p>
            </div>
          </div>
        ) : (
          // Código PIX Gerado
          <div className="space-y-4">
            {/* QR Code */}
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                {qrCode && (
                  <img 
                    src={qrCode} 
                    alt="QR Code PIX" 
                    className="w-32 h-32"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Escaneie com seu app do banco
              </p>
            </div>

            <Separator />

            {/* Código PIX */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Código PIX (Copiar e Colar)</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-xs break-all">
                  {pixCode}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPixCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-500">
                Expira em: {formatTime(timeLeft)}
              </span>
            </div>

            {/* Resumo */}
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
              <div className="flex justify-between text-sm">
                <span>Método:</span>
                <span>PIX</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-brand-green">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Botão de Teste */}
            <Button
              onClick={simulatePayment}
              variant="outline"
              className="w-full"
            >
              Simular Pagamento (Teste)
            </Button>
          </div>
        )}

        {/* Informações PIX */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Como pagar com PIX:
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>1. Abra o app do seu banco</p>
            <p>2. Escaneie o QR Code ou cole o código</p>
            <p>3. Confirme o pagamento</p>
            <p>4. Pronto! Pagamento instantâneo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoPixForm;


