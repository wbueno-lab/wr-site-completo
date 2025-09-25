import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface ImageGalleryPreviewProps {
  images: string[];
  productName: string;
  maxPreview?: number;
}

export const ImageGalleryPreview = ({ 
  images, 
  productName, 
  maxPreview = 4 
}: ImageGalleryPreviewProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-brand-dark-lighter border border-gray-600 rounded-xl">
        <span className="text-gray-400 text-sm">Nenhuma imagem na galeria</span>
      </div>
    );
  }

  const previewImages = images.slice(0, maxPreview);
  const remainingCount = images.length - maxPreview;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const nextImage = () => {
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    setSelectedImage(images[next]);
  };

  const prevImage = () => {
    const prev = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);
    setSelectedImage(images[prev]);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {previewImages.map((image, index) => (
          <Card key={index} className="relative group bg-brand-dark-lighter border-gray-600 overflow-hidden">
            <CardContent className="p-0">
              <img
                src={image}
                alt={`${productName} - Imagem ${index + 1}`}
                className="w-full h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              
              {/* Overlay com botão de visualizar */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => openLightbox(index)}
                  title="Ver imagem em tamanho real"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Indicador se há mais imagens */}
              {index === maxPreview - 1 && remainingCount > 0 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                  +{remainingCount}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-brand-dark-light border-gray-700 p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white flex items-center justify-between">
              <span>{productName} - Galeria de Imagens</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Visualize as imagens do produto em tamanho ampliado
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative p-6">
            {/* Imagem principal */}
            <div className="relative">
              <img
                src={selectedImage || ''}
                alt={`${productName} - Imagem ${currentIndex + 1}`}
                className="w-full max-h-[60vh] object-contain mx-auto rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              
              {/* Navegação */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 border-gray-600 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 border-gray-600 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Indicador de posição */}
            <div className="text-center mt-4">
              <span className="text-gray-400 text-sm">
                {currentIndex + 1} de {images.length}
              </span>
            </div>
            
            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setSelectedImage(image);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-brand-green' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

