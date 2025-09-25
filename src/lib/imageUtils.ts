import imageCompression from 'browser-image-compression';

export interface ImageProcessingOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

export interface ProcessedImage {
  file: File;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Comprime uma imagem automaticamente
 */
export const compressImage = async (
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    quality = 0.8
  } = options;

  try {
    const originalSize = file.size;
    
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      quality,
      fileType: 'image/jpeg', // Sempre converte para JPEG para melhor compressão
    });

    const compressedSize = compressedFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      file: compressedFile,
      url: URL.createObjectURL(compressedFile),
      originalSize,
      compressedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('Erro na compressão da imagem:', error);
    throw new Error('Falha ao comprimir a imagem');
  }
};

/**
 * Redimensiona uma imagem para dimensões específicas
 */
export const resizeImage = async (
  file: File,
  width: number,
  height: number,
  quality: number = 0.9
): Promise<ProcessedImage> => {
  try {
    const originalSize = file.size;
    
    const resizedFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(width, height),
      useWebWorker: true,
      quality,
      fileType: 'image/jpeg',
      maxSizeMB: 5, // Aumentar limite de tamanho
      alwaysKeepResolution: true, // Manter resolução
      preserveExif: false, // Remover metadados para economizar espaço
    });

    const resizedSize = resizedFile.size;
    const compressionRatio = ((originalSize - resizedSize) / originalSize) * 100;

    return {
      file: resizedFile,
      url: URL.createObjectURL(resizedFile),
      originalSize,
      compressedSize: resizedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('Erro no redimensionamento da imagem:', error);
    throw new Error('Falha ao redimensionar a imagem');
  }
};

/**
 * Cria múltiplas versões de uma imagem (thumbnail, medium, large)
 */
export const createImageVariants = async (file: File): Promise<{
  thumbnail: ProcessedImage;
  medium: ProcessedImage;
  large: ProcessedImage;
}> => {
  try {
    const [thumbnail, medium, large] = await Promise.all([
      resizeImage(file, 300, 300, 0.9), // Thumbnail - qualidade máxima
      resizeImage(file, 800, 800, 0.95), // Medium - qualidade máxima
      resizeImage(file, 1920, 1920, 0.98) // Large - qualidade quase original
    ]);

    return { thumbnail, medium, large };
  } catch (error) {
    console.error('Erro ao criar variantes da imagem:', error);
    throw new Error('Falha ao criar variantes da imagem');
  }
};

/**
 * Valida se o arquivo é uma imagem válida
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo inválido. Apenas JPG, PNG e WebP são permitidos.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. O tamanho máximo é 10MB.'
    };
  }

  return { valid: true };
};

/**
 * Gera um nome único para o arquivo
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

/**
 * Calcula o tamanho do arquivo em formato legível
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};



