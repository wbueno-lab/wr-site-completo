/**
 * Utilitários para seleção da melhor imagem disponível
 */

export interface ProductImageData {
  image_url?: string;
  image_thumbnail?: string;
  image_medium?: string;
  image_large?: string;
}

/**
 * Seleciona a melhor imagem disponível para um contexto específico
 */
export const selectBestImage = (
  product: ProductImageData,
  context: 'thumbnail' | 'card' | 'gallery' | 'detail' = 'card'
): string => {
  // Se não há dados de imagem, retornar placeholder
  if (!product.image_url && !product.image_thumbnail && !product.image_medium && !product.image_large) {
    return '/placeholder.svg';
  }

  // Imagem de fallback padrão
  const fallbackImage = '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png';

  // Estratégia de seleção baseada no contexto
  switch (context) {
    case 'thumbnail':
      // Para thumbnails, priorizar image_thumbnail, depois image_medium
      if (product.image_thumbnail && isValidImageUrl(product.image_thumbnail)) {
        return product.image_thumbnail;
      }
      if (product.image_medium && isValidImageUrl(product.image_medium)) {
        return product.image_medium;
      }
      if (product.image_large && isValidImageUrl(product.image_large)) {
        return product.image_large;
      }
      if (product.image_url && isValidImageUrl(product.image_url)) {
        return product.image_url;
      }
      break;

    case 'card':
      // Para cards, priorizar image_medium, depois image_large
      if (product.image_medium && isValidImageUrl(product.image_medium)) {
        return product.image_medium;
      }
      if (product.image_large && isValidImageUrl(product.image_large)) {
        return product.image_large;
      }
      if (product.image_thumbnail && isValidImageUrl(product.image_thumbnail)) {
        return product.image_thumbnail;
      }
      if (product.image_url && isValidImageUrl(product.image_url)) {
        return product.image_url;
      }
      break;

    case 'gallery':
    case 'detail':
      // Para galeria e detalhes, priorizar image_large, depois image_medium
      if (product.image_large && isValidImageUrl(product.image_large)) {
        return product.image_large;
      }
      if (product.image_medium && isValidImageUrl(product.image_medium)) {
        return product.image_medium;
      }
      if (product.image_url && isValidImageUrl(product.image_url)) {
        return product.image_url;
      }
      if (product.image_thumbnail && isValidImageUrl(product.image_thumbnail)) {
        return product.image_thumbnail;
      }
      break;

    default:
      // Fallback geral
      if (product.image_large && isValidImageUrl(product.image_large)) {
        return product.image_large;
      }
      if (product.image_medium && isValidImageUrl(product.image_medium)) {
        return product.image_medium;
      }
      if (product.image_url && isValidImageUrl(product.image_url)) {
        return product.image_url;
      }
      if (product.image_thumbnail && isValidImageUrl(product.image_thumbnail)) {
        return product.image_thumbnail;
      }
  }

  return fallbackImage;
};

/**
 * Verifica se uma URL de imagem é válida
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || url === '' || url === '/placeholder.svg') {
    return false;
  }
  
  // Verificar se é uma URL válida
  try {
    new URL(url);
    return true;
  } catch {
    // Se não é uma URL válida, verificar se é um caminho relativo válido
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

/**
 * Obtém todas as imagens disponíveis de um produto
 */
export const getAllAvailableImages = (product: ProductImageData): string[] => {
  const images: string[] = [];
  
  if (isValidImageUrl(product.image_large)) {
    images.push(product.image_large!);
  }
  if (isValidImageUrl(product.image_medium)) {
    images.push(product.image_medium!);
  }
  if (isValidImageUrl(product.image_url)) {
    images.push(product.image_url!);
  }
  if (isValidImageUrl(product.image_thumbnail)) {
    images.push(product.image_thumbnail!);
  }
  
  return images;
};

/**
 * Obtém a imagem de melhor qualidade disponível
 */
export const getHighestQualityImage = (product: ProductImageData): string => {
  if (product.image_large && isValidImageUrl(product.image_large)) {
    return product.image_large;
  }
  if (product.image_medium && isValidImageUrl(product.image_medium)) {
    return product.image_medium;
  }
  if (product.image_url && isValidImageUrl(product.image_url)) {
    return product.image_url;
  }
  if (product.image_thumbnail && isValidImageUrl(product.image_thumbnail)) {
    return product.image_thumbnail;
  }
  
  return '/placeholder.svg';
};

/**
 * Obtém a imagem de menor tamanho disponível (para performance)
 */
export const getSmallestImage = (product: ProductImageData): string => {
  if (product.image_thumbnail && isValidImageUrl(product.image_thumbnail)) {
    return product.image_thumbnail;
  }
  if (product.image_medium && isValidImageUrl(product.image_medium)) {
    return product.image_medium;
  }
  if (product.image_url && isValidImageUrl(product.image_url)) {
    return product.image_url;
  }
  if (product.image_large && isValidImageUrl(product.image_large)) {
    return product.image_large;
  }
  
  return '/placeholder.svg';
};
