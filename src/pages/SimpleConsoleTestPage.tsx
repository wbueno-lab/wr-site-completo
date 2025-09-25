import React from 'react';
import ConsoleErrorTester from '@/components/ConsoleErrorTester';

const SimpleConsoleTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold">🐛 Teste Simples de Console</h1>
        <p className="text-muted-foreground">
          Ferramenta simplificada para testar erros de console
        </p>
      </div>
      
      <ConsoleErrorTester />
    </div>
  );
};

export default SimpleConsoleTestPage;
