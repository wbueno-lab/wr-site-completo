import React from 'react';
import Header from '@/components/Header';
import FavoritesTab from '@/components/FavoritesTab';
import PageTransition from '@/components/PageTransition';

const FavoritesPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <FavoritesTab />
        </main>
      </div>
    </PageTransition>
  );
};

export default FavoritesPage;

