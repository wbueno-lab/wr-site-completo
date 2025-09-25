import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LoginTest = () => {
  const { signIn, signOut, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
      } else {
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Teste de Login</CardTitle>
        <CardDescription>
          Teste o login e verifique se a sessão persiste
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="font-semibold text-green-800">Usuário Logado</h3>
              <p className="text-sm text-green-700">ID: {user.id}</p>
              <p className="text-sm text-green-700">Email: {user.email}</p>
            </div>
            <Button onClick={handleLogout} className="w-full">
              Fazer Logout
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoggingIn || isLoading}
            >
              {isLoggingIn ? 'Fazendo Login...' : 'Fazer Login'}
            </Button>
          </form>
        )}
        
        <div className="text-xs text-gray-500">
          <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
          <p>User: {user ? 'Logado' : 'Não logado'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

