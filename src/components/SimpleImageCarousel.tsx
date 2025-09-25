import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SimpleQualityImage } from './SimpleQualityImage';

interface SimpleImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
}

export const SimpleImageCarousel = ({ 
  images, 
  productName, 
  className = "",
  showThumbnails = false
}: SimpleImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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
        <SimpleQualityImage
          src={images[currentIndex]}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          className="w-full h-full"
        />
        
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
              <SimpleQualityImage
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

export default SimpleImageCarousel;

