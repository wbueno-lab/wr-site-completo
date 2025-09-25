import React, { Suspense, lazy } from 'react';
import { RealtimeComponentWrapper } from './RealtimeComponentWrapper';

const Categories = lazy(() => import('./Categories'));
const Brands = lazy(() => import('./Brands'));
const FeaturedProducts = lazy(() => import('./FeaturedProducts'));

const LoadingFallback = () => (
  <div className="py-20 text-center">
    <div className="animate-spin h-8 w-8 border-4 border-accent-neon border-t-transparent rounded-full mx-auto mb-4"></div>
    <p className="text-white/80">Carregando...</p>
  </div>
);

export const RealtimeComponents: React.FC = () => {
  return (
    <RealtimeComponentWrapper>
      <Suspense fallback={<LoadingFallback />}>
        <Categories />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <Brands />
      </Suspense>
      <Suspense fallback={<LoadingFallback />}>
        <FeaturedProducts />
      </Suspense>
    </RealtimeComponentWrapper>
  );
};
