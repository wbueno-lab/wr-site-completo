import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import CheckoutModal from "./CheckoutModal";

interface CartDrawerProps {
  children: React.ReactNode;
}

const CartDrawer = ({ children }: CartDrawerProps) => {
  const { items, isLoading, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar a compra",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive"
      });
      return;
    }

    // Verificar estoque de todos os itens
    const outOfStockItems = items.filter(item => 
      item.quantity > (item.product?.stock_quantity || 0)
    );

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.product?.name).join(", ");
      toast({
        title: "Estoque insuficiente",
        description: `Os seguintes itens não têm estoque suficiente: ${itemNames}`,
        variant: "destructive"
      });
      return;
    }

    setShowCheckout(true);
    setIsOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho de Compras
              {getCartCount() > 0 && (
                <Badge variant="secondary" className="bg-accent-neon text-primary">
                  {getCartCount()}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              {getCartCount() > 0 
                ? `${getCartCount()} ${getCartCount() === 1 ? 'item' : 'itens'} no seu carrinho`
                : "Seu carrinho está vazio"
              }
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto py-6 min-h-0">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex gap-4 animate-pulse">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Carrinho vazio</p>
                  <p className="text-muted-foreground">Adicione produtos para começar suas compras</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize || 'no-size'}`} className="flex gap-4 p-4 border rounded-lg">
                      <img 
                        src={item.product?.image_url} 
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded-lg bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product?.price || 0)}
                        </p>
                        {item.selectedSize && (
                          <p className="text-xs text-primary font-medium mt-1">
                            Numeração: {item.selectedSize}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.selectedSize)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.selectedSize)}
                            disabled={item.quantity >= (item.product?.stock_quantity || 0)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.product_id, item.selectedSize)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <p className="font-medium text-sm">
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="premium" 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={!user}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Finalizar Compra
                  </Button>
                  
                  {!user && (
                    <p className="text-sm text-muted-foreground text-center">
                      Faça login para finalizar a compra
                    </p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => clearCart()}
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
      />
    </>
  );
};

export default CartDrawer;