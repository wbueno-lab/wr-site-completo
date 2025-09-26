import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './UnifiedAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase, waitForSupabase } from '@/integrations/supabase/client';

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

  // Load favorites from localStorage and fetch product data
  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const favoritesKey = getFavoritesKey();
      const storedFavorites = localStorage.getItem(favoritesKey);
      const favoritesList = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      if (favoritesList.length > 0) {
        // Buscar dados dos produtos favoritos no banco
        await loadProductsData(favoritesList);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load product data for favorites
  const loadProductsData = async (favoritesList: Favorite[]) => {
    try {
      await waitForSupabase();
      
      const productIds = favoritesList.map(fav => fav.product_id);
      
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          is_new,
          is_promo,
          categories (
            name
          )
        `)
        .in('id', productIds)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching products data:', error);
        setFavorites(favoritesList); // Manter favoritos mesmo sem dados dos produtos
        return;
      }

      // Combinar dados dos favoritos com dados dos produtos
      const favoritesWithProducts = favoritesList.map(favorite => {
        const product = products?.find(p => p.id === favorite.product_id);
        return {
          ...favorite,
          product: product || null
        };
      }).filter(fav => fav.product !== null); // Remover favoritos de produtos que não existem mais

      setFavorites(favoritesWithProducts);
    } catch (error) {
      console.error('Error loading products data:', error);
      setFavorites(favoritesList); // Manter favoritos mesmo com erro
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
      // Buscar dados do produto
      await waitForSupabase();
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          is_new,
          is_promo,
          categories (
            name
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error('Produto não encontrado');
      }

      const newFavorite: Favorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product_id: productId,
        product: product
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
