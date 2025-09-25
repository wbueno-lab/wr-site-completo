import React from 'react';
import { Heart, ShoppingCart, Eye, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface FavoritesTabProps {
  className?: string;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ className }) => {
  const { favorites, isLoading, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Adicionado ao carrinho!",
        description: `${product.name} foi adicionado ao seu carrinho`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveFavorite = async (productId: string, productName: string) => {
    try {
      await removeFromFavorites(productId);
      toast({
        title: "Removido dos favoritos",
        description: `${productName} foi removido da sua lista de favoritos`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <div className="bg-muted/50 rounded-full p-6 mb-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Explore nosso catálogo e adicione produtos que você gosta à sua lista de favoritos.
        </p>
        <Button 
          onClick={() => navigate('/catalogo')}
          className="bg-gradient-to-r from-primary to-accent-neon hover:from-primary/90 hover:to-accent-neon/90"
        >
          <Package className="mr-2 h-4 w-4" />
          Explorar Catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-hero">Meus Favoritos</h2>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'} na sua lista
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((favorite) => {
          const product = favorite.product;
          if (!product) return null;

          return (
            <Card key={favorite.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.is_new && (
                      <Badge className="bg-green-500 text-white text-xs font-semibold">
                        Novo
                      </Badge>
                    )}
                    {product.is_promo && (
                      <Badge className="bg-red-500 text-white text-xs font-semibold">
                        Promoção
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/90 hover:bg-background shadow-md"
                      onClick={() => handleViewProduct(product.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/90 hover:bg-background shadow-md"
                      onClick={() => handleRemoveFavorite(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.categories && (
                      <p className="text-sm text-muted-foreground">
                        {product.categories.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-primary to-accent-neon hover:from-primary/90 hover:to-accent-neon/90 text-white font-semibold"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Adicionar ao Carrinho
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewProduct(product.id)}
                      className="border-primary/30 hover:bg-primary/5"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesTab;

