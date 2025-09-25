import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  AlertTriangle, 
  Info, 
  XCircle,
  Zap,
  Network,
  Database
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ConsoleErrorDemo: React.FC = () => {
  const [isGeneratingErrors, setIsGeneratingErrors] = useState(false);
  const { toast } = useToast();

  const generateJavaScriptError = () => {
    try {
      // Tentar acessar propriedade de objeto undefined
      const obj: any = undefined;
      console.log(obj.nonExistentProperty.someMethod());
    } catch (error) {
      console.error('❌ Erro JavaScript demonstrativo:', error);
    }
  };

  const generateTypeError = () => {
    try {
      // Tentar chamar função em variável que não é função
      const notAFunction: any = "string";
      notAFunction();
    } catch (error) {
      console.error('❌ TypeError demonstrativo:', error);
    }
  };

  const generateNetworkError = async () => {
    try {
      // Tentar fazer requisição para URL inexistente
      await fetch('https://url-inexistente-para-teste.com/api/data');
    } catch (error) {
      console.error('❌ Erro de rede demonstrativo:', error);
    }
  };

  const generateSupabaseError = async () => {
    try {
      // Simular erro de Supabase com JWT inválido
      await fetch('https://fflomlvtgaqbzrjnvqaz.supabase.co/rest/v1/products', {
        headers: {
          'Authorization': 'Bearer invalid-jwt-token',
          'apikey': 'invalid-api-key'
        }
      });
    } catch (error) {
      console.error('❌ Erro Supabase demonstrativo:', error);
    }
  };

  const generateCSPViolation = () => {
    try {
      // Tentar carregar script inline (pode gerar violação CSP)
      const script = document.createElement('script');
      script.innerHTML = 'console.log("Inline script - pode violar CSP");';
      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Possível violação CSP:', error);
    }
  };

  const generateCORSError = async () => {
    try {
      // Tentar fazer requisição que pode gerar erro CORS
      await fetch('https://api.github.com/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
    } catch (error) {
      console.error('❌ Possível erro CORS:', error);
    }
  };

  const generateWarning = () => {
    console.warn('⚠️ Warning demonstrativo: Esta é uma mensagem de aviso para teste');
  };

  const generateInfo = () => {
    console.info('ℹ️ Info demonstrativo: Esta é uma mensagem informativa para teste');
  };

  const generateUnhandledPromiseRejection = () => {
    // Criar promise rejeitada sem catch
    Promise.reject(new Error('Unhandled Promise Rejection para teste'));
  };

  const generateAllErrorTypes = async () => {
    setIsGeneratingErrors(true);
    
    toast({
      title: "Gerando Erros de Teste",
      description: "Criando diferentes tipos de erros para demonstração...",
    });

    // Gerar diferentes tipos de erros com intervalo
    const errorFunctions = [
      { fn: generateJavaScriptError, name: 'JavaScript Error' },
      { fn: generateTypeError, name: 'Type Error' },
      { fn: generateWarning, name: 'Warning' },
      { fn: generateInfo, name: 'Info' },
      { fn: generateNetworkError, name: 'Network Error' },
      { fn: generateSupabaseError, name: 'Supabase Error' },
      { fn: generateCSPViolation, name: 'CSP Violation' },
      { fn: generateCORSError, name: 'CORS Error' },
      { fn: generateUnhandledPromiseRejection, name: 'Unhandled Rejection' }
    ];

    for (let i = 0; i < errorFunctions.length; i++) {
      const { fn, name } = errorFunctions[i];
      console.log(`🧪 Gerando: ${name}`);
      
      try {
        await fn();
      } catch (error) {
        console.error(`Erro ao gerar ${name}:`, error);
      }
      
      // Aguardar um pouco entre erros
      if (i < errorFunctions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsGeneratingErrors(false);
    
    toast({
      title: "Erros Gerados!",
      description: "Todos os tipos de erros foram criados. Verifique o monitor de console.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Gerador de Erros de Console
        </CardTitle>
        <CardDescription>
          Ferramenta para gerar diferentes tipos de erros e testar o monitor de console
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Esta ferramenta gera erros intencionalmente para fins de teste. 
            Use-a junto com o Monitor de Console para verificar se os erros estão sendo capturados corretamente.
          </AlertDescription>
        </Alert>

        {/* Botão principal */}
        <div className="text-center">
          <Button
            onClick={generateAllErrorTypes}
            disabled={isGeneratingErrors}
            size="lg"
            className="flex items-center gap-2"
          >
            {isGeneratingErrors ? (
              <>
                <Zap className="h-4 w-4 animate-pulse" />
                Gerando Erros...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Gerar Todos os Tipos de Erro
              </>
            )}
          </Button>
        </div>

        {/* Botões individuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={generateJavaScriptError}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <XCircle className="h-6 w-6 text-red-500" />
            <div className="text-center">
              <div className="font-medium">JavaScript Error</div>
              <div className="text-xs text-muted-foreground">TypeError: Cannot read property</div>
            </div>
          </Button>

          <Button
            onClick={generateTypeError}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <XCircle className="h-6 w-6 text-red-500" />
            <div className="text-center">
              <div className="font-medium">Type Error</div>
              <div className="text-xs text-muted-foreground">Function call on string</div>
            </div>
          </Button>

          <Button
            onClick={generateNetworkError}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Network className="h-6 w-6 text-orange-500" />
            <div className="text-center">
              <div className="font-medium">Network Error</div>
              <div className="text-xs text-muted-foreground">Failed to fetch</div>
            </div>
          </Button>

          <Button
            onClick={generateSupabaseError}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Database className="h-6 w-6 text-purple-500" />
            <div className="text-center">
              <div className="font-medium">Supabase Error</div>
              <div className="text-xs text-muted-foreground">Invalid JWT token</div>
            </div>
          </Button>

          <Button
            onClick={generateCSPViolation}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div className="text-center">
              <div className="font-medium">CSP Violation</div>
              <div className="text-xs text-muted-foreground">Inline script blocked</div>
            </div>
          </Button>

          <Button
            onClick={generateCORSError}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <XCircle className="h-6 w-6 text-red-500" />
            <div className="text-center">
              <div className="font-medium">CORS Error</div>
              <div className="text-xs text-muted-foreground">Access-Control-Allow-Origin</div>
            </div>
          </Button>

          <Button
            onClick={generateWarning}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div className="text-center">
              <div className="font-medium">Warning</div>
              <div className="text-xs text-muted-foreground">console.warn()</div>
            </div>
          </Button>

          <Button
            onClick={generateInfo}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Info className="h-6 w-6 text-blue-500" />
            <div className="text-center">
              <div className="font-medium">Info</div>
              <div className="text-xs text-muted-foreground">console.info()</div>
            </div>
          </Button>

          <Button
            onClick={generateUnhandledPromiseRejection}
            variant="outline"
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <XCircle className="h-6 w-6 text-red-500" />
            <div className="text-center">
              <div className="font-medium">Promise Rejection</div>
              <div className="text-xs text-muted-foreground">Unhandled rejection</div>
            </div>
          </Button>
        </div>

        {/* Instruções */}
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            <strong>Como usar:</strong>
            <ol className="mt-2 space-y-1 text-sm">
              <li>1. Abra o <strong>Monitor de Console</strong> na aba "Monitor"</li>
              <li>2. Clique em <strong>"Iniciar Monitoramento"</strong></li>
              <li>3. Use os botões acima para gerar diferentes tipos de erros</li>
              <li>4. Observe os erros sendo capturados em tempo real</li>
              <li>5. Vá para a aba <strong>"Análise"</strong> para ver a análise automática</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ConsoleErrorDemo;
