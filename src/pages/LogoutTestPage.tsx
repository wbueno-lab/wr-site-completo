import React from 'react';
import { LogoutTest } from '@/components/LogoutTest';

const LogoutTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Teste de Logout</h1>
          <p className="text-muted-foreground">
            Esta página permite testar o sistema de logout
          </p>
        </div>
        
        <LogoutTest />
        
        <div className="max-w-md mx-auto mt-8 text-center">
          <a 
            href="/auth" 
            className="text-accent-neon hover:underline"
          >
            ← Voltar para página de login
          </a>
        </div>
      </div>
    </div>
  );
};

export default LogoutTestPage;

