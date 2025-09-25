import { useState, useRef, useEffect } from 'react';

interface UltraQualityImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
}

export const UltraQualityImage = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  placeholder = '/placeholder.svg'
}: UltraQualityImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const preloadImgRef = useRef<HTMLImageElement | null>(null);

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

  // Pré-carregar a imagem para garantir qualidade máxima
  useEffect(() => {
    if (isInView && src && src !== placeholder) {
      // Criar uma nova imagem para pré-carregamento
      const preloadImg = new Image();
      preloadImgRef.current = preloadImg;
      
      preloadImg.onload = () => {
        // Quando a imagem estiver carregada, definir como src
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      
      preloadImg.onerror = () => {
        setHasError(true);
        setImageSrc(placeholder);
        setIsLoaded(true);
        onError?.();
      };
      
      // Definir a fonte da imagem
      preloadImg.src = src;
      
      // Configurações para máxima qualidade
      preloadImg.style.imageRendering = 'high-quality';
      preloadImg.crossOrigin = 'anonymous';
    }
  }, [isInView, src, onLoad, onError, placeholder]);

  const handleLoad = () => {
    // Já foi tratado no pré-carregamento
  };

  const handleError = () => {
    // Já foi tratado no pré-carregamento
  };

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
      {isInView && imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          style={{
            imageRendering: 'high-quality',
            imageRendering: '-webkit-optimize-contrast',
            imageRendering: 'crisp-edges'
          }}
        />
      )}
    </div>
  );
};

export default UltraQualityImage;

