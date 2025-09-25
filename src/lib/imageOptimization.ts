/**
 * Utilitários para otimização e seleção de imagens
 */

export interface ImageVariants {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
}

export interface ProductImageData {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

/**
 * Seleciona a melhor imagem disponível baseada no contexto
 */
export const getBestImageUrl = (
  product: {
    image_url?: string;
    image_thumbnail?: string;
    image_medium?: string;
    image_large?: string;
  },
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'large'
): string => {
  // Priorizar as variantes otimizadas quando disponíveis
  switch (size) {
    case 'thumbnail':
      return product.image_thumbnail || product.image_medium || product.image_large || product.image_url || '/placeholder.svg';
    
    case 'medium':
      return product.image_medium || product.image_large || product.image_thumbnail || product.image_url || '/placeholder.svg';
    
    case 'large':
      return product.image_large || product.image_medium || product.image_thumbnail || product.image_url || '/placeholder.svg';
    
    case 'original':
      return product.image_url || product.image_large || product.image_medium || product.image_thumbnail || '/placeholder.svg';
    
    default:
      return product.image_large || product.image_medium || product.image_thumbnail || product.image_url || '/placeholder.svg';
  }
};

/**
 * Prepara dados de imagem para componentes que precisam de múltiplas variantes
 */
export const prepareImageVariants = (
  product: {
    image_url?: string;
    image_thumbnail?: string;
    image_medium?: string;
    image_large?: string;
  }
): ProductImageData => {
  return {
    thumbnail: getBestImageUrl(product, 'thumbnail'),
    medium: getBestImageUrl(product, 'medium'),
    large: getBestImageUrl(product, 'large'),
    original: getBestImageUrl(product, 'original')
  };
};

/**
 * Determina o tamanho de imagem ideal baseado no contexto de uso
 */
export const getImageSizeForContext = (
  context: 'card' | 'gallery' | 'detail' | 'thumbnail'
): 'thumbnail' | 'medium' | 'large' | 'original' => {
  switch (context) {
    case 'card':
      return 'medium';
    case 'gallery':
      return 'large';
    case 'detail':
      return 'large';
    case 'thumbnail':
      return 'thumbnail';
    default:
      return 'medium';
  }
};

/**
 * Retorna a URL da imagem sem modificações desnecessárias
 * O Supabase Storage já otimiza as imagens automaticamente
 */
export const optimizeImageUrl = (
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return imageUrl;
  }

  // Retornar a URL original sem modificações
  // O Supabase Storage já serve as imagens otimizadas
  return imageUrl;
};

/**
 * Hook para carregar imagens com fallback e otimização
 */
export const useOptimizedImage = (
  product: {
    image_url?: string;
    image_thumbnail?: string;
    image_medium?: string;
    image_large?: string;
  },
  context: 'card' | 'gallery' | 'detail' | 'thumbnail' = 'card'
) => {
  const size = getImageSizeForContext(context);
  const baseUrl = getBestImageUrl(product, size);
  
  // Para contextos específicos, aplicar otimizações adicionais
  const optimizedUrl = optimizeImageUrl(baseUrl, {
    quality: context === 'thumbnail' ? 80 : context === 'card' ? 85 : 90,
    format: 'webp'
  });

  return {
    url: optimizedUrl,
    fallbackUrl: baseUrl,
    variants: prepareImageVariants(product)
  };
};

/**
 * Configurações de qualidade para diferentes contextos
 */
export const IMAGE_QUALITY_SETTINGS = {
  thumbnail: {
    quality: 0.8,
    maxWidthOrHeight: 300,
    maxSizeMB: 0.5
  },
  medium: {
    quality: 0.85,
    maxWidthOrHeight: 800,
    maxSizeMB: 1
  },
  large: {
    quality: 0.9,
    maxWidthOrHeight: 1920,
    maxSizeMB: 2
  }
} as const;
