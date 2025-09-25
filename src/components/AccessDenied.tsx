import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <div className="mt-2 text-sm text-muted-foreground">
            <div className="mb-2">
              Você não tem permissão para acessar esta área. Apenas administradores podem acessar o painel administrativo.
            </div>
            <div className="text-sm text-muted-foreground">
              Se você é um administrador e está vendo esta mensagem, tente fazer logout e login novamente.
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">O que fazer?</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Verifique se você está logado na conta correta</li>
              <li>Tente fazer logout e login novamente</li>
              <li>Entre em contato com o suporte se o problema persistir</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
            <Button onClick={() => navigate('/auth')} variant="outline" className="flex-1">
              Fazer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};