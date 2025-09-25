import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './UnifiedAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Favorite {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    is_new: boolean;
    is_promo: boolean;
    categories?: {
      name: string;
    };
  };
}

interface FavoritesContextType {
  favorites: Favorite[];
  isLoading: boolean;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
  };

  // Get storage key for favorites
  const getFavoritesKey = () => {
    return user ? `favorites_${user.id}` : `favorites_${getSessionId()}`;
  };

  // Load favorites from localStorage
  const loadFavorites = () => {
    setIsLoading(true);
    try {
      const favoritesKey = getFavoritesKey();
      const storedFavorites = localStorage.getItem(favoritesKey);
      const favoritesList = storedFavorites ? JSON.parse(storedFavorites) : [];
      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save favorites to localStorage
  const saveFavorites = (favoritesList: Favorite[]) => {
    try {
      const favoritesKey = getFavoritesKey();
      localStorage.setItem(favoritesKey, JSON.stringify(favoritesList));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const addToFavorites = async (productId: string) => {
    try {
      const newFavorite: Favorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product_id: productId
      };

      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      saveFavorites(updatedFavorites);
      
      toast({
        title: "Adicionado aos favoritos!",
        description: "Produto adicionado à sua lista de favoritos"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeFromFavorites = async (productId: string) => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.product_id !== productId);
      setFavorites(updatedFavorites);
      saveFavorites(updatedFavorites);
      
      toast({
        title: "Removido dos favoritos",
        description: "Produto removido da sua lista de favoritos"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.product_id === productId);
  };

  const toggleFavorite = async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  };

  const value = {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
