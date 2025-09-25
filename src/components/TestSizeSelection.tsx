import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import SizeSelectionModal from "./SizeSelectionModal";

const TestSizeSelection = () => {
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [quantity, setQuantity] = useState(3);
  const { addToCart, addMultipleToCart } = useCart();

  // Produto de teste com helmet_numbers
  const testProduct = {
    id: "test-product-123",
    name: "Capacete Teste Numeração",
    price: 199.90,
    image_url: "/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png",
    helmet_numbers: [53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64]
  };

  const handleAddToCart = async () => {
    
    // Check if product has helmet_numbers and quantity > 2
    if (testProduct.helmet_numbers && testProduct.helmet_numbers.length > 0 && quantity > 2) {
      setShowSizeModal(true);
      return;
    }

    try {
      await addToCart(testProduct.id, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleSizeSelection = async (selectedSizes: number[]) => {
    try {
      await addMultipleToCart(testProduct.id, quantity, selectedSizes);
      setShowSizeModal(false);
    } catch (error) {
      console.error('Error adding multiple to cart:', error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Teste de Seleção de Tamanhos</h2>
      
      <Card className="max-w-md">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{testProduct.name}</h3>
              <p className="text-2xl font-bold text-primary">
                R$ {testProduct.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho ({quantity} peças)
            </Button>

            <div className="text-xs text-muted-foreground">
              <p>Quantidade atual: {quantity}</p>
              <p>Modal será aberto se: quantidade &gt; 2</p>
              <p>Helmet numbers: {testProduct.helmet_numbers?.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Selection Modal */}
      <SizeSelectionModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onConfirm={handleSizeSelection}
        productName={testProduct.name}
        quantity={quantity}
        availableSizes={testProduct.helmet_numbers || []}
        productImage={testProduct.image_url}
      />
    </div>
  );
};

export default TestSizeSelection;
