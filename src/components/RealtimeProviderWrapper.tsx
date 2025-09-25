import React, { ReactNode } from 'react';
import { RealtimeProvider } from '@/contexts/RealtimeContext';

interface RealtimeProviderWrapperProps {
  children: ReactNode;
}

export const RealtimeProviderWrapper: React.FC<RealtimeProviderWrapperProps> = ({ children }) => {
  return (
    <RealtimeProvider>
      {children}
    </RealtimeProvider>
  );
};

