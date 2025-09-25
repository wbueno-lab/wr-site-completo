import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';
import { formatFileSize } from '@/lib/imageUtils';
import { imageCache, preloadImage } from '@/lib/imageCache';

interface ImageData {
  id: string;
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
  metadata: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    dimensions: { width: number; height: number };
  };
}

interface ImageGalleryProps {
  images: ImageData[];
  onRemoveImage?: (index: number) => void;
  showMetadata?: boolean;
  maxThumbnails?: number;
}

export const ImageGallery = ({ 
  images, 
  onRemoveImage, 
  showMetadata = true,
  maxThumbnails = 6 
}: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsModalOpen(true);
  };

  const handlePrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const handleDownload = async (imageData: ImageData) => {
    try {
      const response = await fetch(imageData.large);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagem-${imageData.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  const preloadImageInCache = async (imageData: ImageData) => {
    if (!loadedImages.has(imageData.id)) {
      try {
        await preloadImage(imageData.large);
        setLoadedImages(prev => new Set([...prev, imageData.id]));
      } catch (error) {
        console.error('Erro ao pré-carregar imagem:', error);
      }
    }
  };

  const visibleImages = images.slice(0, maxThumbnails);
  const hasMoreImages = images.length > maxThumbnails;

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
        <h3 className="text-lg font-medium">Galeria de Imagens</h3>
        <Badge variant="secondary">
          {images.length} imagem{images.length !== 1 ? 'ns' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleImages.map((imageData, index) => (
          <Card key={imageData.id} className="relative group cursor-pointer">
            <CardContent className="p-2">
              <img
                src={imageData.thumbnail}
                alt={`Imagem ${index + 1}`}
                className="w-full h-32 object-cover rounded"
                onClick={() => handleImageClick(index)}
                onLoad={() => preloadImageInCache(imageData)}
              />
              
              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(index);
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(imageData);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {onRemoveImage && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Metadados */}
              {showMetadata && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between">
                    <span>{formatFileSize(imageData.metadata.compressedSize)}</span>
                    <span>-{imageData.metadata.compressionRatio.toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Indicador de mais imagens */}
        {hasMoreImages && (
          <Card className="relative group cursor-pointer">
            <CardContent className="p-2 flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-sm font-medium">+{images.length - maxThumbnails}</p>
                <p className="text-xs text-muted-foreground">mais imagens</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de visualização */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Imagem {selectedImage !== null ? selectedImage + 1 : 0} de {images.length}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedImage !== null && handleDownload(images[selectedImage])}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage !== null && (
            <div className="relative p-6">
              <img
                src={images[selectedImage].large}
                alt={`Imagem ${selectedImage + 1}`}
                className="w-full h-auto max-h-[60vh] object-contain mx-auto"
              />
              
              {/* Navegação */}
              {images.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={handlePrevious}
                    disabled={selectedImage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={handleNext}
                    disabled={selectedImage === images.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Metadados da imagem */}
              {showMetadata && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Informações da Imagem</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tamanho Original</p>
                      <p className="font-medium">{formatFileSize(images[selectedImage].metadata.originalSize)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tamanho Comprimido</p>
                      <p className="font-medium">{formatFileSize(images[selectedImage].metadata.compressedSize)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compressão</p>
                      <p className="font-medium text-green-600">-{images[selectedImage].metadata.compressionRatio.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Economia</p>
                      <p className="font-medium text-green-600">
                        {formatFileSize(images[selectedImage].metadata.originalSize - images[selectedImage].metadata.compressedSize)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};



