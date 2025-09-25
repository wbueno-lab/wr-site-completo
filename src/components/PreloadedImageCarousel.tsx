import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UltraQualityImage } from './UltraQualityImage';

interface PreloadedImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const PreloadedImageCarousel = ({ 
  images, 
  productName, 
  className = "",
  showThumbnails = false,
  autoPlay = false,
  autoPlayInterval = 3000
}: PreloadedImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageLoad = (index: number) => {
    setPreloadedImages(prev => new Set([...prev, index]));
    if (index === currentIndex) {
      setImageLoaded(true);
    }
  };

  const handleImageError = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== '/placeholder.svg') {
      target.src = '/placeholder.svg';
    }
    setPreloadedImages(prev => new Set([...prev, index]));
    if (index === currentIndex) {
      setImageLoaded(true);
    }
  };

  // Pré-carregar todas as imagens
  useEffect(() => {
    images.forEach((_, index) => {
      const img = new Image();
      img.onload = () => handleImageLoad(index);
      img.onerror = () => setPreloadedImages(prev => new Set([...prev, index]));
      img.src = images[index];
    });
  }, [images]);

  // Atualizar estado de carregamento quando o índice muda
  useEffect(() => {
    setImageLoaded(preloadedImages.has(currentIndex));
  }, [currentIndex, preloadedImages]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, images.length, autoPlayInterval]);

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Imagem Principal */}
      <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
        <UltraQualityImage
          src={images[currentIndex]}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          className="w-full h-full transition-all duration-300 group-hover:scale-110"
          onLoad={() => handleImageLoad(currentIndex)}
          onError={() => handleImageError(currentIndex, {} as any)}
        />
        
        {/* Placeholder/Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-0">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Carregando imagem...</p>
            </div>
          </div>
        )}
        
        {/* Navegação */}
        {images.length > 1 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white z-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white z-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Indicadores de posição */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-foreground' : 'bg-foreground/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas (opcional) */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                currentIndex === index 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              <UltraQualityImage
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreloadedImageCarousel;
