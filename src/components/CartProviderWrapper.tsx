import React from 'react';
import { CartProvider } from '@/contexts/CartContext';

interface CartProviderWrapperProps {
  children: React.ReactNode;
}

export const CartProviderWrapper = ({ children }: CartProviderWrapperProps) => {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
};


