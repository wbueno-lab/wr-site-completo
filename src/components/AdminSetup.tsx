import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export const AdminSetup = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const makeCurrentUserAdmin = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o usuário tem permissão para se tornar admin
    const { data: allowedEmails, error: emailError } = await supabase
      .from('admin_whitelist')
      .select('email')
      .eq('email', user.email)
      .single();

    if (emailError || !allowedEmails) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para se tornar administrador",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se já existe outro admin
      const { data: existingAdmin, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .single();

      if (existingAdmin) {
        toast({
          title: "Erro",
          description: "Já existe um administrador configurado",
          variant: "destructive"
        });
        return;
      }

      // Chamar a função do Supabase para tornar o usuário admin
      const { data, error } = await supabase.rpc('make_user_admin', {
        user_email: user.email
      });

      if (error) {
        console.error('Erro ao tornar usuário admin:', error);
        toast({
          title: "Erro",
          description: `Erro ao tornar usuário admin: ${error.message}`,
          variant: "destructive"
        });
      } else if (data) {
        // Registrar a mudança no histórico
        await supabase.from('admin_history').insert({
          user_id: user.id,
          action: 'grant',
          created_at: new Date().toISOString()
        });

        toast({
          title: "Sucesso!",
          description: "Usuário configurado como administrador. Recarregue a página.",
        });
        // Recarregar a página para atualizar o contexto
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Aviso",
          description: "Usuário não encontrado no banco de dados. Faça login novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao configurar admin",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuração de Administrador</CardTitle>
        <CardDescription>
          Configure este usuário como administrador para acessar o painel administrativo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status Admin:</strong> {profile?.is_admin ? '✅ Sim' : '❌ Não'}</p>
        </div>
        
        {!profile?.is_admin && (
          <Button 
            onClick={makeCurrentUserAdmin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Configurando...' : 'Tornar Administrador'}
          </Button>
        )}
        
        {profile?.is_admin && (
          <div className="text-center text-green-600 font-medium">
            ✅ Usuário já é administrador
          </div>
        )}
      </CardContent>
    </Card>
  );
};
