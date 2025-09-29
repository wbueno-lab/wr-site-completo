import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from "@/components/ui/use-toast";
import QuickViewModal from "./QuickViewModal";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { selectBestImage } from "@/lib/imageSelection";
import { SimpleQualityImage } from "./SimpleQualityImage";
import SizeSelectionModal from "./SizeSelectionModal";
import HelmetNumberingModal from "./HelmetNumberingModal";
import ImageHoverPreview from "./ImageHoverPreview";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    image_url?: string;
    image_thumbnail?: string;
    image_medium?: string;
    image_large?: string;
    category: string;
    brand?: string;
    isNew?: boolean;
    isPromo?: boolean;
    galleryImages?: string[];
    helmet_numbers?: number[];
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, addMultipleToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showHelmetNumberingModal, setShowHelmetNumberingModal] = useState(false);
  const [quantity, setQuantity] = useState(3); // Default to 3 for testing



  const handleAddToCart = async () => {
    // Check if product has helmet_numbers and quantity > 1
    if (product.helmet_numbers && product.helmet_numbers.length > 0 && quantity > 1) {
      setShowHelmetNumberingModal(true);
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSizeSelection = async (selectedSizes: number[]) => {
    setIsAdding(true);
    try {
      await addMultipleToCart(product.id, quantity, selectedSizes);
      setShowSizeModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleHelmetNumberingSelection = async (selectedSizes: number[]) => {
    setIsAdding(true);
    try {
      await addMultipleToCart(product.id, quantity, selectedSizes);
      setShowHelmetNumberingModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(product.id);
  };

  const handleQuickView = () => {
    setShowQuickView(true);
  };

  const handleProductClick = () => {
    console.log('🔄 ProductCard: Navegando para produto:', product.id);
    console.log('🔄 ProductCard: URL destino:', `/produto/${product.id}`);
    console.log('🔄 ProductCard: Hook navigate disponível:', typeof navigate === 'function');
    console.log('🔄 ProductCard: URL atual antes da navegação:', window.location.href);
    
    try {
      // Verificar se o navigate está funcionando
      if (typeof navigate !== 'function') {
        console.error('❌ ProductCard: Hook navigate não está disponível');
        return;
      }
      
      console.log('🔄 ProductCard: Executando navigate...');
      navigate(`/produto/${product.id}`);
      console.log('✅ ProductCard: Navegação iniciada para:', `/produto/${product.id}`);
      
      // Verificar se a URL mudou após um pequeno delay
      setTimeout(() => {
        console.log('🔄 ProductCard: URL após navegação:', window.location.href);
      }, 100);
      
    } catch (error) {
      console.error('❌ ProductCard: Erro na navegação:', error);
      console.error('❌ ProductCard: Stack trace:', error.stack);
    }
  };


  // Usar a melhor imagem disponível para o card
  const getBestImageForCard = () => {
    const imageData = {
      image_url: product.image_url || product.image,
      image_thumbnail: product.image_thumbnail,
      image_medium: product.image_medium,
      image_large: product.image_large
    };
    
    return selectBestImage(imageData, 'card');
  };

  // Preparar imagens para o carrossel - versão simplificada
  const getCarouselImages = () => {
    const images = [];
    
    // Adicionar a imagem principal
    const mainImage = getBestImageForCard();
    
    if (mainImage && mainImage !== '/placeholder.svg') {
      images.push(mainImage);
    }
    
    // Adicionar imagens da galeria se existirem
    if (product.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.forEach(img => {
        if (img && img !== mainImage && img !== '/placeholder.svg') {
          images.push(img);
        }
      });
    }
    
    return images.length > 0 ? images : ['/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'];
  };

  return (
    <Card 
      className="group card-hover border-animated overflow-hidden cursor-pointer" 
      onClick={(e) => {
        console.log('🖱️ ProductCard: Clique detectado!', product.id);
        e.preventDefault();
        e.stopPropagation();
        handleProductClick();
      }}
    >
      <div className="relative">
        <ImageHoverPreview
          src={getBestImageForCard()}
          alt={product.name}
          className="h-64 w-full"
          previewSize={250}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-accent-neon text-primary px-2 py-1 text-xs font-bold rounded-full animate-pulse-glow">
              NOVO
            </span>
          )}
          {product.isPromo && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-full">
              PROMOÇÃO
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`bg-background/80 hover:bg-background ${isFavorite(product.id) ? 'text-red-500' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickView();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70 font-medium">{product.category}</p>
            {product.brand && (
              <p className="text-xs text-accent-neon font-semibold bg-accent-neon/10 px-2 py-1 rounded-full">
                {product.brand}
              </p>
            )}
          </div>
          
          {/* Numeração dos Capacetes */}
          {product.helmet_numbers && product.helmet_numbers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.helmet_numbers.slice(0, 4).map((number) => (
                <span
                  key={number}
                  className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium"
                >
                  {number}
                </span>
              ))}
              {product.helmet_numbers.length > 4 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{product.helmet_numbers.length - 4}
                </span>
              )}
            </div>
          )}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-accent-neon transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>


          <Button 
            variant="cart" 
            className="w-full mt-4" 
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isAdding}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAdding ? "Adicionando..." : "Adicionar ao Carrinho"}
          </Button>
        </div>
      </CardContent>

      {/* Quick View Modal */}
      <QuickViewModal
        productId={showQuickView ? product.id : null}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />

      {/* Size Selection Modal */}
      <SizeSelectionModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onConfirm={handleSizeSelection}
        productName={product.name}
        quantity={quantity}
        availableSizes={product.helmet_numbers || []}
        productImage={product.image_url || product.image}
      />

      {/* Helmet Numbering Modal */}
      <HelmetNumberingModal
        isOpen={showHelmetNumberingModal}
        onClose={() => setShowHelmetNumberingModal(false)}
        onConfirm={handleHelmetNumberingSelection}
        productName={product.name}
        quantity={quantity}
        availableSizes={product.helmet_numbers || []}
        productImage={product.image_url || product.image}
      />

    </Card>
  );
};

export default ProductCard;