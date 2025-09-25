import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ResendConfirmationEmail() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSuccess(false);
    
    try {
      console.log('[ResendEmail] Tentando reenviar email para:', email);
      
      // Tentar reenviar email de confirmação
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?tab=login`
        }
      });

      if (error) {
        console.error('[ResendEmail] Erro ao reenviar:', error);
        throw error;
      }

      console.log('[ResendEmail] Resposta do reenvio:', data);
      setSuccess(true);
      
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e pasta de spam. O link expira em 24 horas.",
        duration: 10000
      });
      
      // Limpar o campo após sucesso
      setEmail('');
    } catch (error: any) {
      console.error('[ResendEmail] Erro detalhado:', error);
      
      // Mensagem de erro personalizada
      let errorMessage = "Não foi possível reenviar o email. Tente novamente mais tarde.";
      
      if (error.message) {
        if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
        } else if (error.message.includes("User not found")) {
          errorMessage = "Email não encontrado. Verifique se o email está correto ou crie uma nova conta.";
        }
      }
      
      toast({
        title: "Erro ao reenviar",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleResend} className="space-y-4 mt-4">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="flex-1"
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          variant={success ? "success" : "outline"}
          className={success ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          {isLoading ? "Enviando..." : success ? "Enviado!" : "Reenviar"}
        </Button>
      </div>
      {success && (
        <p className="text-sm text-green-600 mt-2">
          Email reenviado com sucesso! Verifique sua caixa de entrada e pasta de spam.
        </p>
      )}
    </form>
  );
}
