import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthDiagnostic } from '@/components/AuthDiagnostic';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const AuthDiagnosticPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/auth">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Diagnóstico de Autenticação</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Esta ferramenta ajuda a identificar e resolver problemas de login. 
              Execute o diagnóstico para verificar a conectividade e configurações.
            </p>
          </div>
        </div>

        {/* Diagnostic Component */}
        <AuthDiagnostic />

        {/* Help Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Problemas Comuns e Soluções
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-3 text-red-400">
                🚫 Erro: "Failed to fetch"
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Problema de conectividade com o Supabase
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Verifique sua conexão com a internet</li>
                <li>• Desative temporariamente o firewall/antivírus</li>
                <li>• Tente usar dados móveis (4G/5G)</li>
                <li>• Use uma VPN se necessário</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-3 text-yellow-400">
                ⚠️ Erro: "Invalid login credentials"
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Email ou senha incorretos
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Verifique se o email está correto</li>
                <li>• Confirme se a senha está correta</li>
                <li>• Verifique se o Caps Lock está desativado</li>
                <li>• Tente resetar a senha se necessário</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-3 text-blue-400">
                📧 Erro: "Email not confirmed"
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Email de confirmação não foi verificado
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Verifique sua caixa de entrada</li>
                <li>• Procure na pasta de spam/lixo eletrônico</li>
                <li>• Solicite reenvio do email de confirmação</li>
                <li>• Aguarde alguns minutos e tente novamente</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-3 text-purple-400">
                🔄 Erro: "Too many requests"
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Muitas tentativas de login
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Aguarde 15 minutos antes de tentar novamente</li>
                <li>• Limpe o cache do navegador</li>
                <li>• Reinicie o navegador</li>
                <li>• Tente em modo incógnito</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-12 text-center">
          <div className="bg-muted/50 p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Precisa de Ajuda?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Se os problemas persistirem, entre em contato conosco:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  Página de Contato
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('mailto:suporte@wrcapacetes.com', '_blank')}
              >
                Email: suporte@wrcapacetes.com
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDiagnosticPage;

