import React, { Suspense, lazy } from 'react';
import { RealtimeProvider } from '@/contexts/RealtimeContext';

interface RealtimeComponentWrapperProps {
  children: React.ReactNode;
}

export const RealtimeComponentWrapper: React.FC<RealtimeComponentWrapperProps> = ({ children }) => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RealtimeProvider>
        {children}
      </RealtimeProvider>
    </Suspense>
  );
};

