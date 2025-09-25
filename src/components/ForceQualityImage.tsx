import { useState, useRef, useEffect } from 'react';

interface ForceQualityImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ForceQualityImage = ({
  src,
  alt,
  className = ''
}: ForceQualityImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src || src === '/placeholder.svg') {
      setCurrentSrc('/placeholder.svg');
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    // Forçar carregamento da imagem original sem modificações
    const img = new Image();
    
    // Configurações para máxima qualidade
    img.crossOrigin = 'anonymous';
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
      setCurrentSrc(src);
    };
    
    img.onerror = (e) => {
      console.error('ForceQualityImage error loading:', src, e);
      setHasError(true);
      setCurrentSrc('/placeholder.svg');
      setIsLoaded(true); // Marcar como carregado mesmo com erro para mostrar placeholder
    };

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          imageRendering: 'high-quality',
          imageRendering: '-webkit-optimize-contrast',
          imageRendering: 'crisp-edges',
          WebkitImageRendering: 'high-quality',
          MozImageRendering: 'high-quality',
          msImageRendering: 'high-quality',
          OImageRendering: 'high-quality'
        }}
        loading="eager"
        decoding="sync"
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ForceQualityImage;
