import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sizes: number[]) => void;
  productName: string;
  quantity: number;
  availableSizes: number[];
  productImage?: string;
}

const SizeSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  quantity,
  availableSizes,
  productImage
}: SizeSelectionModalProps) => {
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset selected sizes when modal opens
      setSelectedSizes([]);
    }
  }, [isOpen]);

  const handleSizeSelect = (size: number) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else if (prev.length < quantity) {
        return [...prev, size];
      } else {
        // Replace the first selected size if we've reached the limit
        return [size, ...prev.slice(1)];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedSizes.length !== quantity) {
      toast({
        title: "Seleção incompleta",
        description: `Por favor, selecione exatamente ${quantity} tamanho(s)`,
        variant: "destructive"
      });
      return;
    }

    onConfirm(selectedSizes);
    onClose();
  };

  const getSizeStatus = (size: number) => {
    if (selectedSizes.includes(size)) {
      return "default";
    }
    if (selectedSizes.length >= quantity) {
      return "outline";
    }
    return "outline";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="size-selection-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Seleção de Tamanhos
          </DialogTitle>
          <DialogDescription id="size-selection-description">
            Selecione os tamanhos desejados para adicionar ao carrinho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            {productImage && (
              <img 
                src={productImage} 
                alt={productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold">{productName}</h3>
              <p className="text-sm text-muted-foreground">
                Quantidade: {quantity} peça(s)
              </p>
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div className="text-center space-y-2">
            <h4 className="font-medium text-lg">
              Selecione o tamanho para cada peça
            </h4>
            <p className="text-sm text-muted-foreground">
              Você selecionou {quantity} peça(s). Por favor, escolha o tamanho para cada uma delas.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">
                {selectedSizes.length} de {quantity} selecionado(s)
              </Badge>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-4">
            <h5 className="font-medium">Tamanhos Disponíveis:</h5>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {availableSizes
                .sort((a, b) => a - b)
                .map((size) => (
                  <Button
                    key={size}
                    variant={getSizeStatus(size)}
                    size="lg"
                    onClick={() => handleSizeSelect(size)}
                    className={`min-w-[60px] h-12 ${
                      selectedSizes.includes(size)
                        ? 'bg-primary text-primary-foreground'
                        : selectedSizes.length >= quantity
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-primary/10'
                    }`}
                    disabled={selectedSizes.length >= quantity && !selectedSizes.includes(size)}
                  >
                    {size}
                  </Button>
                ))}
            </div>
          </div>

          {/* Selected Sizes Display */}
          {selectedSizes.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium">Tamanhos Selecionados:</h5>
              <div className="flex flex-wrap gap-2">
                {selectedSizes.map((size, index) => (
                  <Badge key={`${size}-${index}`} variant="default" className="px-3 py-1">
                    Peça {index + 1}: {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedSizes.length !== quantity}
              className="min-w-[120px]"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Confirmar ({selectedSizes.length}/{quantity})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeSelectionModal;
