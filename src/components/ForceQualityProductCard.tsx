import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from "@/components/ui/use-toast";
import QuickViewModal from "./QuickViewModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForceQualityImage } from "./ForceQualityImage";
import { DirectImage } from "./DirectImage";
import { TestImage } from "./TestImage";
import NativeImage from "./NativeImage";
import SimpleSupabaseImage from "./SimpleSupabaseImage";

interface ForceQualityProductCardProps {
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

const ForceQualityProductCard = ({ product }: ForceQualityProductCardProps) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.id);
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
    try {
      navigate(`/produto/${product.id}`);
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
    }
  };

  // Função para selecionar a melhor imagem disponível
  const getBestImage = () => {
    // Prioridade: image_large > image_medium > image_thumbnail > image_url > image
    const images = [
      product.image_large,
      product.image_medium,
      product.image_thumbnail,
      product.image_url,
      product.image
    ];

    for (const img of images) {
      if (img && 
          img !== '/placeholder.svg' && 
          img !== 'null' && 
          img !== 'undefined' && 
          img.trim() !== '' &&
          (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/'))) {
        return img;
      }
    }
    
    // Fallback para placeholder apenas se nenhuma imagem válida for encontrada
    return '/placeholder.svg';
  };

  return (
    <Card 
      className="group card-hover border-animated overflow-hidden cursor-pointer" 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleProductClick();
      }}
    >
      <div className="relative">
        <SimpleSupabaseImage
          src={getBestImage()}
          alt={product.name}
          className="h-64 w-full object-cover"
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
    </Card>
  );
};

export default ForceQualityProductCard;
