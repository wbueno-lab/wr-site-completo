import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { paymentService } from '@/services/paymentService';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        toast({
          title: "Erro",
          description: "ID do pagamento não encontrado",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const result = await paymentService.checkPaymentStatus(paymentId);
        
        if (result.success) {
          // Buscar dados do pedido
          const order = await paymentService.getOrder(paymentId);
          setOrderData(order);
          
          toast({
            title: "Pagamento Aprovado!",
            description: "Seu pedido foi processado com sucesso"
          });
        } else {
          toast({
            title: "Pagamento Pendente",
            description: result.message || "Seu pagamento está sendo processado"
          });
        }
      } catch (error: any) {
        console.error('Erro ao verificar pagamento:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar status do pagamento",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, navigate, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processando</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejeitado</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-dark to-brand-darker flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando pagamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-brand-darker py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-brand-green mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Pagamento Processado!
          </h1>
          <p className="text-muted-foreground">
            Obrigado pela sua compra. Seu pedido foi recebido com sucesso.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status do Pagamento */}
          <Card className="bg-brand-dark-lighter border-brand-green/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-brand-green" />
                Status do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(orderData?.status || status || 'pending')}
              </div>
              
              {paymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID do Pagamento:</span>
                  <span className="text-sm font-mono text-brand-green">
                    {paymentId}
                  </span>
                </div>
              )}

              {orderData?.total_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="text-lg font-semibold text-brand-green">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(orderData.total_amount)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes do Pedido */}
          {orderData && (
            <Card className="bg-brand-dark-lighter border-brand-green/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingBag className="h-5 w-5 text-brand-green" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Número do Pedido:</span>
                  <span className="font-semibold text-white">
                    #{orderData.id.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="text-white">
                    {new Date(orderData.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Método de Pagamento:</span>
                  <span className="text-white">
                    {orderData.payment_method}
                  </span>
                </div>

                {orderData.customer_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="text-white">
                      {orderData.customer_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Próximos Passos */}
        <Card className="mt-6 bg-brand-green/10 border-brand-green/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Próximos Passos
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• Você receberá um email de confirmação em breve</p>
              <p>• Seu pedido será processado e enviado</p>
              <p>• Você receberá um código de rastreamento</p>
              <p>• Em caso de dúvidas, entre em contato conosco</p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={() => navigate('/')}
            className="flex-1"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
          <Button 
            onClick={() => navigate('/catalog')}
            className="flex-1"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;

