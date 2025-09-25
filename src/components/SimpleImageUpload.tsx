import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Loader2 } from 'lucide-react';

const SUPABASE_URL = "https://fflomlvtgaqbzrjnvqaz.supabase.co";

interface SimpleImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
}

export const SimpleImageUpload = ({ 
  onImageUploaded, 
  currentImageUrl 
}: SimpleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
      const filePath = `products/${fileName}`;

      console.log('=== SIMPLE UPLOAD DEBUG ===');
      console.log('Arquivo:', file.name);
      console.log('Tamanho:', file.size);
      console.log('Tipo:', file.type);
      console.log('Caminho:', filePath);

      // Fazer upload para o bucket 'product-images'
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      // Gerar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // URL alternativa caso a principal falhe
      const alternativeUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;

      console.log('URL gerada:', publicUrl);
      console.log('URL alternativa:', alternativeUrl);

      // Testar se a URL está acessível
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('✅ URL principal funcionando');
          onImageUploaded(publicUrl);
        } else {
          console.log('❌ URL principal falhou, usando alternativa');
          onImageUploaded(alternativeUrl);
        }
      } catch (error) {
        console.log('❌ Erro ao testar URL, usando alternativa');
        onImageUploaded(alternativeUrl);
      }

      toast({
        title: "Upload realizado!",
        description: "A imagem foi enviada com sucesso."
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao enviar a imagem.",
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
        <Label className="text-sm font-semibold text-white">Imagem Principal</Label>
        <div
          className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-brand-green/50 transition-all duration-200 cursor-pointer bg-brand-dark-lighter"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green mb-2" />
              <p className="text-sm text-white">
                Enviando imagem...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-brand-green mb-2" />
              <p className="text-sm font-medium text-white">
                Clique para selecionar ou arraste a imagem aqui
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP até 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview da imagem atual */}
      {currentImageUrl && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-white">Imagem Atual</Label>
          <Card className="relative bg-brand-dark-lighter border-gray-600">
            <CardContent className="p-2">
              <img
                src={currentImageUrl}
                alt="Imagem atual"
                className="w-full h-32 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
