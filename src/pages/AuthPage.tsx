import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { Shield, User, Mail, Lock, LogOut } from 'lucide-react';
import { ResendConfirmationEmail } from '@/components/ResendConfirmationEmail';

const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    confirmPassword: '' 
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<'idle' | 'validating' | 'authenticating' | 'success'>('idle');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupStep, setSignupStep] = useState<'idle' | 'validating' | 'creating' | 'success'>('idle');

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'login' || tab === 'signup') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    // Validação básica
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    try {
      setLoginStep('validating');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular validação

      setLoginStep('authenticating');
      const result = await signIn(loginForm.email, loginForm.password);

      if (result.error) {
        setLoginError(result.error.message);
        setLoginStep('idle');
      } else {
        setLoginStep('success');
      }
    } catch (error) {
      setLoginError('Erro ao fazer login. Tente novamente.');
      setLoginStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setIsLoading(true);

    // Validação básica
    if (!signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      setSignupError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      setSignupStep('validating');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular validação

      setSignupStep('creating');
      const result = await signUp(signupForm.email, signupForm.password, signupForm.fullName);

      if (result.error) {
        setSignupError(result.error.message);
        setSignupStep('idle');
      } else {
        setSignupStep('success');
      }
    } catch (error) {
      setSignupError('Erro ao criar conta. Tente novamente.');
      setSignupStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-full bg-gradient-premium">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient-hero">WR Capacetes</h1>
          </div>
          <p className="text-muted-foreground">Acesse sua conta ou cadastre-se</p>
        </div>

        <Card className="border-animated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
            <CardDescription>
              Faça login ou crie uma nova conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 relative z-10">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground cursor-pointer"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4 relative z-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                      <p className="text-red-400 text-sm">{loginError}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="premium" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {loginStep === 'validating' && "Validando..."}
                        {loginStep === 'authenticating' && "Autenticando..."}
                        {loginStep === 'success' && "Sucesso!"}
                      </div>
                    ) : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-4 relative z-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                      <p className="text-red-400 text-sm">{signupError}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="premium" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {signupStep === 'validating' && "Validando..."}
                        {signupStep === 'creating' && "Criando conta..."}
                        {signupStep === 'success' && "Sucesso!"}
                      </div>
                    ) : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-2">Não recebeu o email de confirmação?</h3>
              <ResendConfirmationEmail />
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-4">
          {/* Diagnóstico de problemas */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Problemas com o login?
            </p>
            <Link to="/auth-diagnostic">
              <Button variant="outline" size="sm" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Executar Diagnóstico
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Ao continuar, você concorda com nossos{" "}
              <button 
                onClick={() => alert("Termos de Uso: Esta é uma versão de demonstração. Os termos completos serão implementados em produção.")}
                className="text-accent-neon hover:underline cursor-pointer"
              >
                Termos de Uso
              </button>{" "}
              e{" "}
              <button 
                onClick={() => alert("Política de Privacidade: Esta é uma versão de demonstração. A política completa será implementada em produção.")}
                className="text-accent-neon hover:underline cursor-pointer"
              >
                Política de Privacidade
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;