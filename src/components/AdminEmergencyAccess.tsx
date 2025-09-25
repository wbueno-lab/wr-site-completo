import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, CheckCircle, User, Key } from 'lucide-react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminEmergencyAccessProps {
  onSuccess?: () => void;
}

export const AdminEmergencyAccess: React.FC<AdminEmergencyAccessProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handlePromoteToAdmin = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: true,
          updated_at: new Date().toISOString(),
          last_modified_by: user.id
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro ao promover usuário",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Salvar no localStorage como backup
      localStorage.setItem(`admin_${user.id}`, 'true');

      toast({
        title: "Usuário promovido a administrador!",
        description: "Suas permissões foram atualizadas. Recarregue a página.",
        duration: 5000
      });

      if (onSuccess) {
        onSuccess();
      }

      // Recarregar página após um delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível promover o usuário",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyAdmin = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      // Verificar se o usuário é admin no banco
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Erro ao verificar perfil",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (profile?.is_admin) {
        // Salvar no localStorage como backup
        localStorage.setItem(`admin_${user.id}`, 'true');
        
        toast({
          title: "Usuário confirmado como administrador!",
          description: "Suas permissões foram verificadas. Recarregue a página.",
          duration: 5000
        });

        if (onSuccess) {
          onSuccess();
        }

        // Recarregar página após um delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Usuário não é administrador",
          description: "Seu perfil não tem permissões de administrador no banco de dados.",
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Erro ao verificar perfil",
        description: "Não foi possível verificar suas permissões",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForceAccess = () => {
    if (!user) return;

    // Forçar acesso salvando no localStorage
    localStorage.setItem(`admin_${user.id}`, 'true');
    
    toast({
      title: "Acesso forçado ativado",
      description: "Acesso temporário concedido. Recarregue a página.",
      variant: "warning",
      duration: 5000
    });

    if (onSuccess) {
      onSuccess();
    }

    // Recarregar página após um delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleCodeVerification = async () => {
    // Código de emergência simples (em produção, use algo mais seguro)
    const emergencyCode = 'ADMIN2025';
    
    if (verificationCode === emergencyCode) {
      await handlePromoteToAdmin();
    } else {
      toast({
        title: "Código inválido",
        description: "O código de verificação está incorreto.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Acesso de Emergência ao Admin</CardTitle>
          <CardDescription>
            Se você é um administrador mas não consegue acessar o painel, use as opções abaixo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status do usuário */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Usuário atual:</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {user?.email || 'Não autenticado'}
            </p>
          </div>

          {/* Aviso */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Use estas opções apenas se você tem certeza de que é um administrador:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Verificar permissões no banco de dados</li>
                <li>• Promover usuário a administrador</li>
                <li>• Forçar acesso temporário (modo offline)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Opções de acesso */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleVerifyAdmin}
                disabled={isVerifying}
                className="flex items-center gap-2 h-auto p-4"
                variant="outline"
              >
                <CheckCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Verificar Admin</div>
                  <div className="text-xs text-muted-foreground">
                    Verifica se você é admin no banco
                  </div>
                </div>
              </Button>

              <Button 
                onClick={handlePromoteToAdmin}
                disabled={isVerifying}
                className="flex items-center gap-2 h-auto p-4"
                variant="outline"
              >
                <Shield className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Promover a Admin</div>
                  <div className="text-xs text-muted-foreground">
                    Promove seu usuário a administrador
                  </div>
                </div>
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <Button 
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    variant="outline"
                    className="w-full"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Verificação por Código
                  </Button>
                </div>

                {showCodeInput && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label htmlFor="verification-code">Código de Verificação</Label>
                      <Input
                        id="verification-code"
                        type="password"
                        placeholder="Digite o código de emergência"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCodeVerification()}
                      />
                    </div>
                    <Button 
                      onClick={handleCodeVerification}
                      disabled={!verificationCode || isVerifying}
                      className="w-full"
                    >
                      Verificar Código
                    </Button>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Acesso de Emergência:</strong> Use apenas se você tem certeza de que é um administrador e está enfrentando problemas técnicos.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleForceAccess}
                    disabled={isVerifying}
                    variant="destructive"
                    className="w-full mt-3"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Forçar Acesso (Modo Emergência)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Se nenhuma das opções funcionar, entre em contato com o suporte técnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
