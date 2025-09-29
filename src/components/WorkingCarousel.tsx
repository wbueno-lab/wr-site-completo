import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkingCarouselProps {
  images: string[];
  productName: string;
  className?: string;
}

export const WorkingCarousel = ({ 
  images, 
  productName, 
  className = "" 
}: WorkingCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-sm">Nenhuma imagem disponível</p>
      </div>
    );
  }

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

  return (
    <div className={`relative ${className}`}>
      {/* Container da imagem */}
      <div className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 relative">
        {/* Imagem atual */}
        <img
          src={images[currentIndex]}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{
            display: 'block',
            maxWidth: '100%',
            height: '100%'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.log('❌ Erro ao carregar:', target.src);
            // Tentar placeholder se não for já o placeholder
            if (target.src !== '/placeholder.svg' && target.src !== window.location.origin + '/placeholder.svg') {
              target.src = '/placeholder.svg';
            }
          }}
          onLoad={() => {
            console.log('✅ Imagem carregada:', images[currentIndex]);
          }}
        />
        
        {/* Setas de navegação - SEMPRE VISÍVEIS */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center z-20 transition-all"
              style={{
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full flex items-center justify-center z-20 transition-all"
              style={{
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indicadores */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                style={{
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-20">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                currentIndex === index 
                  ? 'border-blue-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <img
                src={image}
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
