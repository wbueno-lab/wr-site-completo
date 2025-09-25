import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://fflomlvtgaqbzrjnvqaz.supabase.co";
import { Upload, X, Image as ImageIcon, Loader2, Trash2, Eye } from 'lucide-react';
import { 
  compressImage, 
  createImageVariants, 
  validateImageFile, 
  generateUniqueFileName,
  formatFileSize,
  type ProcessedImage 
} from '@/lib/imageUtils';
import { imageCache, preloadImage } from '@/lib/imageCache';

interface ImageUploadProps {
  onImageUploaded: (imageData: string | ImageData[]) => void;
  currentImageUrl?: string;
  currentImages?: ImageData[];
  multiple?: boolean;
  maxImages?: number;
  showCompressionInfo?: boolean;
}

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

export const ImageUpload = ({ 
  onImageUploaded, 
  currentImageUrl, 
  currentImages = [],
  multiple = false, 
  maxImages = 5,
  showCompressionInfo = true
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>(currentImages);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar número de imagens
    const totalImages = uploadedImages.length + files.length;
    if (totalImages > maxImages) {
      toast({
        title: "Muitas imagens",
        description: `Você pode enviar no máximo ${maxImages} imagens.`,
        variant: "destructive"
      });
      return;
    }

    // Validar arquivos
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: "Arquivo inválido",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
    }

    setUploading(true);
    setProcessingProgress({ current: 0, total: fileArray.length });

    try {
      const processedImages: ImageData[] = [];

      // Processar imagens em paralelo com limite de 3 ao mesmo tempo
      const batchSize = 3;
      for (let i = 0; i < fileArray.length; i += batchSize) {
        const batch = fileArray.slice(i, i + batchSize);
        const batchPromises = batch.map(async (file, index) => {
          setProcessingProgress({ current: i + index + 1, total: fileArray.length });

          // Otimizar imagem antes de criar variantes
          const optimizedFile = await optimizeImage(file);

          // Criar variantes da imagem (thumbnail, medium, large)
          const variants = await createImageVariants(optimizedFile);
          return { file, variants };
        });

        const batchResults = await Promise.all(batchPromises);
        for (const result of batchResults) {
          const { file, variants } = result;
        
        // Tentar diferentes buckets em ordem de preferência
        const possibleBuckets = ['product-images', 'uploads', 'images', 'public'];
        let bucketName = 'product-images';
        
        // Verificar qual bucket está disponível
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          if (buckets && buckets.length > 0) {
            const availableBucket = possibleBuckets.find(bucket => 
              buckets.some(b => b.name === bucket)
            );
            if (availableBucket) {
              bucketName = availableBucket;
            } else {
              bucketName = buckets[0].name; // Usar o primeiro disponível
            }
          }
        } catch (error) {
          // Usar bucket padrão se não conseguir listar
        }
        

        // Upload das variantes para o Supabase Storage
        const uploadPromises = Object.entries(variants).map(async ([size, processedImage]) => {
          const fileName = generateUniqueFileName(file.name);
          const filePath = `products/${size}/${fileName}`;

          // Tentar upload com diferentes buckets se necessário
          let uploadSuccess = false;
          let finalBucketName = bucketName;
          let uploadError = null;

          for (const testBucket of possibleBuckets) {
            try {
              const { data, error } = await supabase.storage
                .from(testBucket)
                .upload(filePath, processedImage.file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (error) {
                continue;
              }

              finalBucketName = testBucket;
              uploadSuccess = true;
              break;
            } catch (err) {
              continue;
            }
          }

          if (!uploadSuccess) {
            throw new Error('Não foi possível fazer upload em nenhum bucket disponível');
          }

          const { data: { publicUrl } } = supabase.storage
            .from(finalBucketName)
            .getPublicUrl(filePath);

          // Gerar URL alternativa se necessário
          const alternativeUrl = `${SUPABASE_URL}/storage/v1/object/public/${finalBucketName}/${filePath}`;

          // Testar se a URL está acessível
          try {
            const response = await fetch(publicUrl, { method: 'HEAD' });
            
            if (response.ok) {
              return { size, url: publicUrl };
            } else {
              return { size, url: alternativeUrl };
            }
          } catch (error) {
            return { size, url: alternativeUrl };
          }
        });

        const uploadedVariants = await Promise.all(uploadPromises);
        
        // Criar objeto de dados da imagem
        const imageData: ImageData = {
          id: generateUniqueFileName(file.name),
          thumbnail: uploadedVariants.find(v => v.size === 'thumbnail')?.url || '',
          medium: uploadedVariants.find(v => v.size === 'medium')?.url || '',
          large: uploadedVariants.find(v => v.size === 'large')?.url || '',
          original: uploadedVariants.find(v => v.size === 'large')?.url || '', // Usar large como original
          metadata: {
            originalSize: file.size,
            compressedSize: variants.large.compressedSize,
            compressionRatio: variants.large.compressionRatio,
            dimensions: { width: 0, height: 0 } // Será preenchido quando a imagem carregar
          }
        };

        processedImages.push(imageData);
      }

      const newUploadedImages = [...uploadedImages, ...processedImages];
      setUploadedImages(newUploadedImages);

      // Chamar callback com os dados apropriados
      if (!multiple) {
        onImageUploaded(processedImages[0].large);
      } else {
        onImageUploaded(newUploadedImages);
      }

      toast({
        title: "Upload realizado!",
        description: `${processedImages.length} imagem(ns) processada(s) e enviada(s) com sucesso.`
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao processar e enviar as imagens.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProcessingProgress({ current: 0, total: 0 });
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    if (!multiple) {
      onImageUploaded('');
    } else {
      onImageUploaded(newImages);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Imagens do Produto</Label>
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-border/80 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Processando imagens... {processingProgress.current}/{processingProgress.total}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Clique para selecionar ou arraste as imagens aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP até 10MB cada • Compressão automática
                {multiple && ` • Máximo ${maxImages} imagens`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview das imagens */}
      {(uploadedImages.length > 0 || currentImageUrl) && (
        <div className="space-y-2">
          <Label>Preview das Imagens</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Imagem atual se existir */}
            {currentImageUrl && !uploadedImages.some(img => img.large === currentImageUrl) && (
              <Card className="relative">
                <CardContent className="p-2">
                  <img
                    src={currentImageUrl}
                    alt="Imagem atual"
                    className="w-full h-24 object-cover rounded"
                  />
                  <div className="absolute top-1 right-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => onImageUploaded('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-1 text-muted-foreground">Atual</p>
                </CardContent>
              </Card>
            )}
            
            {/* Novas imagens */}
            {uploadedImages.map((imageData, index) => (
              <Card key={imageData.id} className="relative group">
                <CardContent className="p-2">
                  <img
                    src={imageData.thumbnail}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(imageData.large, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Informações de compressão */}
                  {showCompressionInfo && (
                    <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-between">
                        <span>{formatFileSize(imageData.metadata.originalSize)}</span>
                        <span>-{imageData.metadata.compressionRatio.toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Estatísticas de compressão */}
          {showCompressionInfo && uploadedImages.length > 0 && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Total de imagens: {uploadedImages.length}</p>
              <p>
                Economia de espaço: {uploadedImages.reduce((acc, img) => 
                  acc + (img.metadata.originalSize - img.metadata.compressedSize), 0
                ).toLocaleString()} bytes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
