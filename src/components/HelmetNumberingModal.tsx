import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface HelmetNumberingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sizes: number[]) => void;
  productName: string;
  quantity: number;
  availableSizes: number[];
  productImage?: string;
}

const HelmetNumberingModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  quantity,
  availableSizes,
  productImage
}: HelmetNumberingModalProps) => {
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset selected sizes when modal opens
      setSelectedSizes([]);
    }
  }, [isOpen]);

  const handleSizeSelect = (size: number, pieceIndex: number) => {
    setSelectedSizes(prev => {
      const newSizes = [...prev];
      newSizes[pieceIndex] = size;
      return newSizes;
    });
  };

  const handleConfirm = () => {
    // Verificar se todas as peças têm numeração selecionada
    const hasAllSizes = selectedSizes.length === quantity && selectedSizes.every(size => size !== undefined);
    
    if (!hasAllSizes) {
      toast({
        title: "Seleção incompleta",
        description: `Por favor, selecione a numeração para todas as ${quantity} peça(s)`,
        variant: "destructive"
      });
      return;
    }

    onConfirm(selectedSizes);
    onClose();
  };

  const getSizeStatus = (size: number, pieceIndex: number) => {
    if (selectedSizes[pieceIndex] === size) {
      return "default";
    }
    return "outline";
  };

  const isSizeSelected = (size: number, pieceIndex: number) => {
    return selectedSizes[pieceIndex] === size;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Numeração dos Capacetes
          </DialogTitle>
          <DialogDescription>
            Selecione o tamanho para cada peça do capacete
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            {productImage && (
              <img 
                src={productImage} 
                alt={productName}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{productName}</h3>
              <p className="text-sm text-muted-foreground">
                Quantidade: {quantity} peça(s)
              </p>
            </div>
          </div>

          <Separator />

          {/* Alert Message */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">
                Numeração Obrigatória
              </h4>
              <p className="text-sm text-amber-700">
                Para garantir que você receba os capacetes com as numerações corretas, 
                por favor selecione a numeração específica para cada peça que está adicionando ao carrinho.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <h4 className="font-medium text-lg">
              Selecione a numeração para cada capacete
            </h4>
            <p className="text-sm text-muted-foreground">
              Escolha a numeração específica (53-64) para cada uma das {quantity} peça(s) que você está adicionando.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">
                {selectedSizes.filter(size => size !== undefined).length} de {quantity} selecionado(s)
              </Badge>
            </div>
          </div>

          {/* Individual Piece Selection */}
          <div className="space-y-6">
            {Array.from({ length: quantity }, (_, pieceIndex) => (
              <div key={pieceIndex} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    {pieceIndex + 1}
                  </div>
                  <h5 className="font-medium text-lg">
                    Peça {pieceIndex + 1} - Selecione a numeração:
                  </h5>
                  {selectedSizes[pieceIndex] && (
                    <Badge variant="default" className="ml-auto">
                      Numeração: {selectedSizes[pieceIndex]}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 ml-11">
                  {availableSizes
                    .sort((a, b) => a - b)
                    .map((size) => (
                      <Button
                        key={`${pieceIndex}-${size}`}
                        variant={getSizeStatus(size, pieceIndex)}
                        size="lg"
                        onClick={() => handleSizeSelect(size, pieceIndex)}
                        className={`min-w-[60px] h-12 ${
                          isSizeSelected(size, pieceIndex)
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                            : 'hover:bg-primary/10'
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {selectedSizes.filter(size => size !== undefined).length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h5 className="font-medium text-lg">Resumo da Seleção:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedSizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">
                      {size ? `Numeração ${size}` : 'Não selecionado'}
                    </span>
                  </div>
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
              disabled={selectedSizes.length !== quantity || selectedSizes.some(size => size === undefined)}
              className="min-w-[140px]"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelmetNumberingModal;
