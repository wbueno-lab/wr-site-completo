import { useState, useEffect, useCallback } from 'react';
import { getBestImageUrl, prepareImageVariants, optimizeImageUrl } from '@/lib/imageOptimization';

interface ProductImageData {
  image_url?: string;
  image_thumbnail?: string;
  image_medium?: string;
  image_large?: string;
}

interface UseProductImagesReturn {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
  getOptimizedUrl: (context: 'thumbnail' | 'card' | 'gallery' | 'detail', quality?: number) => string;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Hook para gerenciar imagens de produtos com otimização e cache
 */
export const useProductImages = (product: ProductImageData): UseProductImagesReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Preparar todas as variantes da imagem
  const variants = prepareImageVariants(product);

  // Função para obter URL otimizada baseada no contexto
  const getOptimizedUrl = useCallback((
    context: 'thumbnail' | 'card' | 'gallery' | 'detail',
    quality?: number
  ) => {
    // Sempre usar a melhor variante disponível para o contexto
    let size: 'thumbnail' | 'medium' | 'large' | 'original' = 'large';
    
    switch (context) {
      case 'thumbnail':
        size = 'thumbnail';
        break;
      case 'card':
        size = 'medium';
        break;
      case 'gallery':
      case 'detail':
        size = 'large';
        break;
    }
    
    const baseUrl = getBestImageUrl(product, size);
    
    // Retornar a URL original sem modificações para manter qualidade
    return baseUrl;
  }, [product]);

  // Simular carregamento para UX
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [product.image_url, product.image_large, product.image_medium, product.image_thumbnail]);

  return {
    ...variants,
    getOptimizedUrl,
    isLoading,
    hasError
  };
};

export default useProductImages;
