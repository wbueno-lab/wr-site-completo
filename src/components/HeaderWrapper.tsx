import React from 'react';
import { RealtimeProviderWrapper } from './RealtimeProviderWrapper';
import Header from './Header';

export const HeaderWrapper: React.FC = () => {
  return (
    <RealtimeProviderWrapper>
      <Header />
    </RealtimeProviderWrapper>
  );
};

