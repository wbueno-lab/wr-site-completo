import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Loader2, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createImageVariants, generateUniqueFileName } from '@/lib/imageUtils';

interface MultiImageUploadProps {
  onImagesUploaded: (images: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  showProgress?: boolean;
  enableDragDrop?: boolean;
}

export const MultiImageUpload = ({ 
  onImagesUploaded, 
  currentImages = [],
  maxImages = 8,
  showProgress = true,
  enableDragDrop = true
}: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(currentImages);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Verificar se não excede o limite
    const totalImages = uploadedImages.length + files.length;
    if (totalImages > maxImages) {
      toast({
        title: "Muitas imagens",
        description: `Você pode adicionar no máximo ${maxImages} imagens.`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const newImages: string[] = [];
      const fileArray = Array.from(files);
      setUploadProgress({ current: 0, total: fileArray.length });

      // Processar cada arquivo
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress({ current: i + 1, total: fileArray.length });

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Arquivo inválido",
            description: `${file.name} não é uma imagem válida.`,
            variant: "destructive"
          });
          continue;
        }

        // Validar tamanho (máximo 5MB por imagem)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `${file.name} é muito grande. Máximo 5MB por imagem.`,
            variant: "destructive"
          });
          continue;
        }

        // Criar variantes da imagem (thumbnail, medium, large)
        const variants = await createImageVariants(file);
        
        // Tentar diferentes buckets em ordem de preferência
        const possibleBuckets = ['product-images', 'public', 'uploads', 'images'];
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
          console.log('Não foi possível listar buckets, usando padrão:', bucketName);
        }
        
        console.log('Usando bucket:', bucketName);

        // Upload da imagem grande para o Supabase Storage
        const fileName = generateUniqueFileName(file.name);
        const filePath = `gallery/${fileName}`;

        // Tentar upload com diferentes buckets se necessário
        let uploadSuccess = false;
        let finalBucketName = bucketName;
        let uploadError = null;

        for (const testBucket of possibleBuckets) {
          try {
            const { data, error } = await supabase.storage
              .from(testBucket)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              uploadError = error;
              continue;
            }

            // Obter URL pública
            const { data: urlData } = supabase.storage
              .from(testBucket)
              .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
              newImages.push(urlData.publicUrl);
              uploadSuccess = true;
              finalBucketName = testBucket;
              break;
            }
          } catch (error) {
            console.log(`Erro no bucket ${testBucket}:`, error);
            continue;
          }
        }

        if (!uploadSuccess) {
          console.error('Erro no upload:', uploadError);
          toast({
            title: "Erro no upload",
            description: `Não foi possível fazer upload de ${file.name}.`,
            variant: "destructive"
          });
          continue;
        }
      }

      // Adicionar novas imagens às existentes
      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onImagesUploaded(updatedImages);

      toast({
        title: "Imagens carregadas!",
        description: `${newImages.length} imagem(ns) enviada(s) com sucesso.`
      });

    } catch (error: any) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro no processamento",
        description: error.message || "Erro ao processar as imagens.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    if (!enableDragDrop) return;
    
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
    if (enableDragDrop) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold text-white">Imagens da Galeria ({uploadedImages.length}/{maxImages})</Label>
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
            dragActive 
              ? 'border-brand-green bg-brand-green/10' 
              : 'border-gray-600 hover:border-brand-green/50 bg-brand-dark-lighter'
          } ${uploading || uploadedImages.length >= maxImages ? 'cursor-not-allowed opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && uploadedImages.length < maxImages && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || uploadedImages.length >= maxImages}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-2" />
              <p className="text-sm text-white">
                Processando imagens...
              </p>
              {showProgress && uploadProgress.total > 0 && (
                <div className="w-full max-w-xs mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{uploadProgress.current} de {uploadProgress.total}</span>
                    <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-brand-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : uploadedImages.length >= maxImages ? (
            <div className="flex flex-col items-center">
              <X className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">
                Limite de imagens atingido ({maxImages})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Remova algumas imagens para adicionar novas
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {dragActive ? (
                <Upload className="h-8 w-8 text-brand-green mb-2 animate-pulse" />
              ) : (
                <Upload className="h-8 w-8 text-brand-green mb-2" />
              )}
              <p className="text-sm font-medium text-white">
                {enableDragDrop ? 'Clique para selecionar ou arraste as imagens aqui' : 'Clique para selecionar imagens'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP até 5MB cada • Máximo {maxImages} imagens
              </p>
              {uploadedImages.length > 0 && (
                <p className="text-xs text-brand-green mt-1">
                  {maxImages - uploadedImages.length} slot(s) restante(s)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview das imagens */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-white">Preview das Imagens</Label>
            <div className="text-xs text-gray-400">
              {uploadedImages.length}/{maxImages} imagens
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={index} className="relative group bg-brand-dark-lighter border-gray-600">
                <CardContent className="p-2">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Botões de ação */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(image, '_blank')}
                        title="Ver imagem em tamanho real"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                        title="Remover imagem"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Número da imagem */}
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Estatísticas e ações */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div>
              <p>Total: {uploadedImages.length} imagem(ns)</p>
              <p>Espaço restante: {maxImages - uploadedImages.length} imagem(ns)</p>
            </div>
            {uploadedImages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadedImages([]);
                  onImagesUploaded([]);
                }}
                className="text-red-400 border-red-400/50 hover:bg-red-400/10"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar Todas
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Botão para adicionar mais imagens */}
      {uploadedImages.length > 0 && uploadedImages.length < maxImages && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-brand-green/50 text-brand-green hover:bg-brand-green/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mais Imagens ({maxImages - uploadedImages.length} restantes)
          </Button>
        </div>
      )}
    </div>
  );
};
