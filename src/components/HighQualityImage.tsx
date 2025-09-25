import { useState, useRef, useEffect } from 'react';
import { getBestImageUrl } from '@/lib/imageOptimization';

interface HighQualityImageProps {
  src: string;
  alt: string;
  className?: string;
  context?: 'thumbnail' | 'card' | 'gallery' | 'detail';
  image_thumbnail?: string;
  image_medium?: string;
  image_large?: string;
  image_url?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
}

export const HighQualityImage = ({
  src,
  alt,
  className = '',
  context = 'card',
  image_thumbnail,
  image_medium,
  image_large,
  image_url,
  onLoad,
  onError,
  placeholder = '/placeholder.svg'
}: HighQualityImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Determinar qual variante usar baseada no contexto
  const getBestVariant = () => {
    // Se temos variantes específicas, usar a melhor para o contexto
    if (image_thumbnail || image_medium || image_large || image_url) {
      const product = {
        image_url: image_url || src,
        image_thumbnail,
        image_medium,
        image_large
      };
      
      switch (context) {
        case 'thumbnail':
          return getBestImageUrl(product, 'thumbnail');
        case 'card':
          return getBestImageUrl(product, 'medium');
        case 'gallery':
        case 'detail':
          return getBestImageUrl(product, 'large');
        default:
          return getBestImageUrl(product, 'medium');
      }
    }
    
    // Fallback para src original
    return src || placeholder;
  };

  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Atualizar src quando entrar em view
  useEffect(() => {
    if (isInView) {
      setCurrentSrc(getBestVariant());
    }
  }, [isInView, context, src, image_thumbnail, image_medium, image_large, image_url]);

  // Lazy loading com Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(placeholder);
    onError?.();
  };

  const displaySrc = hasError ? placeholder : currentSrc;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder/Skeleton */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* Imagem real */}
      {isInView && (
        <img
          src={displaySrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default HighQualityImage;

