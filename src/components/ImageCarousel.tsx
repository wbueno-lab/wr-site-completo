import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageData {
  id: string;
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

interface ImageCarouselProps {
  images: ImageData[];
  productName: string;
}

export const ImageCarousel = ({ images, productName }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Imagens do Produto</h3>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} de {images.length}
        </span>
      </div>

      {/* Imagem Principal */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-lg group">
            <img
              src={images[currentIndex]?.large || images[currentIndex]?.medium || images[currentIndex]?.thumbnail}
              alt={`${productName} - Imagem ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/placeholder.svg') {
                  target.src = '/placeholder.svg';
                }
              }}
            />
            
            {/* Navegação */}
            {images.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Indicadores de posição */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-foreground' : 'bg-foreground/50'
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                currentIndex === index 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              <img
                src={image.thumbnail}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/placeholder.svg') {
                    target.src = '/placeholder.svg';
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
