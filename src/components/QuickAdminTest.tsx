import { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const QuickAdminTest = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);

  const runQuickTest = () => {
    const results: string[] = [];
    
    // Test 1: User logged in
    if (user) {
      results.push(`✅ Usuário logado: ${user.email}`);
    } else {
      results.push('❌ Usuário não está logado');
      setTestResults(results);
      return;
    }

    // Test 2: Profile loading
    if (isProfileLoading) {
      results.push('⚠️ Perfil ainda carregando...');
    } else if (profile) {
      results.push(`✅ Perfil carregado: ${profile.email}`);
    } else {
      results.push('❌ Perfil não encontrado');
    }

    // Test 3: Admin status
    if (profile) {
      if (profile.is_admin) {
        results.push('✅ Usuário é administrador');
      } else {
        results.push('❌ Usuário NÃO é administrador');
      }
    } else {
      results.push('⚠️ Não é possível verificar status de admin (perfil não carregado)');
    }

    setTestResults(results);
  };

  const makeAdminNow = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('make_user_admin', {
        user_email: user.email
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        toast({
          title: "Sucesso!",
          description: "Agora você é administrador! Recarregando...",
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({
          title: "Aviso",
          description: "Usuário não encontrado no banco",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (result: string) => {
    if (result.startsWith('✅')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (result.startsWith('❌')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (result.startsWith('⚠️')) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Teste Rápido do Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runQuickTest} className="flex-1">
            Executar Teste
          </Button>
          {user && !profile?.is_admin && (
            <Button onClick={makeAdminNow} variant="outline">
              Tornar Admin
            </Button>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <Alert key={index}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result)}
                  <AlertDescription>{result}</AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Status atual:</strong></p>
          <p>• Usuário: {user ? user.email : 'Não logado'}</p>
          <p>• Perfil: {isProfileLoading ? 'Carregando...' : profile ? 'Carregado' : 'Não encontrado'}</p>
          <p>• Admin: {profile?.is_admin ? 'Sim' : 'Não'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
