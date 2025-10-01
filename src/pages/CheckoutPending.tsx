import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft, ShoppingBag, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mercadoPagoService } from '@/integrations/mercado-pago/mercadoPagoService';

const CheckoutPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    setIsChecking(true);
    try {
      const result = await mercadoPagoService.checkPaymentStatus(paymentId);
      
      if (result.success) {
        toast({
          title: "Pagamento Aprovado!",
          description: "Seu pagamento foi processado com sucesso"
        });
        navigate('/checkout/success', { 
          state: { paymentId, status: result.status } 
        });
      } else if (result.status === 'rejected') {
        toast({
          title: "Pagamento Rejeitado",
          description: "Seu pagamento foi rejeitado"
        });
        navigate('/checkout/failure', { 
          state: { paymentId, status: result.status } 
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Verificar status automaticamente a cada 30 segundos
    const interval = setInterval(checkPaymentStatus, 30000);
    
    // Verificar imediatamente
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-brand-darker py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Pagamento Pendente
          </h1>
          <p className="text-muted-foreground">
            Seu pagamento está sendo processado. Aguarde a confirmação.
          </p>
        </div>

        <Card className="bg-brand-dark-lighter border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-yellow-500" />
              Status do Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-yellow-500">Pendente</Badge>
            </div>
            
            {paymentId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID do Pagamento:</span>
                <span className="text-sm font-mono text-yellow-400">
                  {paymentId}
                </span>
              </div>
            )}

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">
                O que está acontecendo?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seu pagamento foi enviado para processamento</li>
                <li>• O banco está verificando os dados</li>
                <li>• Isso pode levar alguns minutos</li>
                <li>• Você receberá uma confirmação em breve</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="mt-6 bg-brand-green/10 border-brand-green/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Próximos Passos
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• Aguarde a confirmação do pagamento</p>
              <p>• Você receberá um email quando for aprovado</p>
              <p>• Seu pedido será processado automaticamente</p>
              <p>• Em caso de dúvidas, entre em contato conosco</p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={checkPaymentStatus}
            disabled={isChecking}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Verificar Status'}
          </Button>
          
          <Button 
            onClick={() => navigate('/catalog')}
            className="flex-1"
            variant="outline"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="flex-1"
            variant="secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>

        {/* Nota Importante */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Importante:</strong> Esta página verifica automaticamente o status do seu pagamento. 
            Se você fechar a página, não se preocupe - você receberá um email de confirmação 
            assim que o pagamento for processado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPending;

