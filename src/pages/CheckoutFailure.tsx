import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, ArrowLeft, ShoppingBag, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CheckoutFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  React.useEffect(() => {
    toast({
      title: "Pagamento Não Processado",
      description: "Houve um problema com seu pagamento. Tente novamente.",
      variant: "destructive"
    });
  }, [toast]);

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'rejected':
        return 'Seu pagamento foi rejeitado. Verifique os dados do cartão.';
      case 'cancelled':
        return 'Pagamento cancelado. Você pode tentar novamente.';
      case 'pending':
        return 'Pagamento pendente. Aguarde a confirmação.';
      default:
        return 'Houve um problema com seu pagamento. Tente novamente.';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rejected':
        return <Badge className="bg-red-500">Rejeitado</Badge>;
      case 'cancelled':
        return <Badge className="bg-orange-500">Cancelado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-500">Erro</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-brand-darker py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Pagamento Não Processado
          </h1>
          <p className="text-muted-foreground">
            {getStatusMessage(status || 'error')}
          </p>
        </div>

        <Card className="bg-brand-dark-lighter border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <XCircle className="h-5 w-5 text-red-500" />
              Detalhes do Problema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(status || 'error')}
            </div>
            
            {paymentId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID do Pagamento:</span>
                <span className="text-sm font-mono text-red-400">
                  {paymentId}
                </span>
              </div>
            )}

            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-2">
                Possíveis Causas:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dados do cartão incorretos</li>
                <li>• Cartão sem limite disponível</li>
                <li>• Problema temporário com o banco</li>
                <li>• Dados de cobrança incorretos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Soluções */}
        <Card className="mt-6 bg-brand-green/10 border-brand-green/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              O que fazer agora?
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• Verifique os dados do seu cartão</p>
              <p>• Confirme se há limite disponível</p>
              <p>• Tente com outro cartão</p>
              <p>• Entre em contato com seu banco</p>
              <p>• Use uma forma de pagamento diferente</p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={() => navigate('/catalog')}
            className="flex-1"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Catálogo
          </Button>
          
          <Button 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="flex-1"
            variant="secondary"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailure;

