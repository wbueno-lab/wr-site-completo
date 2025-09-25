import React, { useState, useEffect, useRef } from 'react';
import { useImageCache } from '@/lib/imageCache';
import OptimizedLoading from './OptimizedLoading';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder.svg',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { cacheImage } = useImageCache();

  useEffect(() => {
    if (!src) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Tentar usar cache primeiro
        const cachedUrl = await cacheImage(src);
        setImageSrc(cachedUrl);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.warn('Erro ao carregar imagem:', error);
        setHasError(true);
        setImageSrc(fallback);
        setIsLoading(false);
        onError?.();
      }
    };

    loadImage();
  }, [src, fallback, cacheImage, onLoad, onError]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallback);
      setIsLoading(false);
      onError?.();
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <OptimizedLoading size="sm" text="" />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={loading}
        onError={handleImageError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default OptimizedImage;