import { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingProductDetail from '@/components/LoadingProductDetail';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Ruler,
  Weight,
  Package,
  Tag,
  Eye,
  MapPin
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { productService, ProductWithCategory } from '@/services/productService';
import { useConnectivity } from '@/hooks/useConnectivity';
import { ImageCarousel } from '@/components/ImageCarousel';
import { EnhancedProductCarousel } from '@/components/EnhancedProductCarousel';
import { WorkingCarousel } from '@/components/WorkingCarousel';
import ProductReviews from '@/components/ProductReviews';
import SizeSelectionModal from '@/components/SizeSelectionModal';
import HelmetNumberingModal from '@/components/HelmetNumberingModal';

type Category = Tables<'categories'>;

interface ProductDetailState {
  product: ProductWithCategory | null;
  category: Category | null;
  loading: boolean;
  hasError: boolean;
  isInitialized: boolean;
}

interface UseProductDetailResult extends ProductDetailState {
  fetchProduct: () => Promise<void>;
}

const useProductDetail = (productId: string | undefined): UseProductDetailResult => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { executeWithRetry, isOnline } = useConnectivity();
  const [state, setState] = useState({
    product: null as ProductWithCategory | null,
    category: null as Category | null,
    loading: true,
    hasError: false,
    isInitialized: false
  });

  const fetchProduct = useCallback(async () => {
    if (!productId || !state.isInitialized) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, hasError: false }));
      
      if (!isOnline) {
        throw new Error('Sem conexão com a internet');
      }
      
      const productData = await executeWithRetry(
        () => productService.getProductById(productId),
        {
          timeoutMs: 8000 // Reduzido para 8 segundos
        }
      );

      if (!productData) {
        throw new Error('Produto não encontrado');
      }

      setState(prev => ({
        ...prev,
        product: productData,
        category: productData.categories || null,
        loading: false
      }));
    } catch (error) {
      console.error('❌ ProductDetailPage: Erro ao buscar produto:', error);
      
      if (error.message?.includes('Produto não encontrado') || error.message?.includes('PGRST116')) {
        toast({
          title: "Produto não encontrado",
          description: `O produto não existe ou não está ativo`,
          variant: "destructive",
        });
        navigate('/catalogo');
        return;
      }
      
      toast({
        title: error.message?.includes('Sem conexão') ? "Sem Conexão" : "Erro",
        description: error.message?.includes('Sem conexão') 
          ? "Verifique sua conexão com a internet e tente novamente"
          : "Erro ao carregar produto",
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, hasError: true, loading: false }));
    }
  }, [productId, state.isInitialized, isOnline, executeWithRetry, toast, navigate]);

  useEffect(() => {
    setState(prev => ({ ...prev, isInitialized: true }));
  }, []);

  useEffect(() => {
    let mounted = true;
    
    if (mounted && state.isInitialized && productId) {
      fetchProduct();
    }
    
    return () => {
      mounted = false;
    };
  }, [state.isInitialized, productId, fetchProduct]);

  return {
    ...state,
    fetchProduct
  };
};

interface ProductDetailContentProps {
  id?: string;
}

const ProductDetailContent: React.FC<ProductDetailContentProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, addMultipleToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showHelmetNumberingModal, setShowHelmetNumberingModal] = useState(false);
  
  const { 
    product, 
    category, 
    loading, 
    hasError,
    fetchProduct 
  } = useProductDetail(id);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Verificar se o usuário está logado
    if (!user) {
      navigate('/auth?tab=login');
      return;
    }

    // Check if product has helmet_numbers and quantity > 1
    if (product.helmet_numbers && product.helmet_numbers.length > 0 && quantity > 1) {
      setShowHelmetNumberingModal(true);
      return;
    }

    // Check if size selection is required
    const hasHelmetNumbers = product.helmet_numbers && product.helmet_numbers.length > 0;
    const hasAvailableSizes = product.available_sizes && product.available_sizes.length > 0;
    
    if ((hasHelmetNumbers || hasAvailableSizes) && selectedSize === null) {
      toast({
        title: hasHelmetNumbers ? "Numeração necessária" : "Tamanho necessário",
        description: hasHelmetNumbers ? "Por favor, selecione uma numeração" : "Por favor, selecione um tamanho",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, selectedSize);
      toast({
        title: "Sucesso",
        description: "Produto adicionado ao carrinho",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto ao carrinho",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSizeSelection = async (selectedSizes: number[]) => {
    if (!product) return;
    
    // Verificar se o usuário está logado
    if (!user) {
      navigate('/auth?tab=login');
      return;
    }
    
    setIsAdding(true);
    try {
      await addMultipleToCart(product.id, quantity, selectedSizes);
      setShowSizeModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto ao carrinho",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleHelmetNumberingSelection = async (selectedSizes: number[]) => {
    if (!product) return;
    
    // Verificar se o usuário está logado
    if (!user) {
      navigate('/auth?tab=login');
      return;
    }
    
    setIsAdding(true);
    try {
      await addMultipleToCart(product.id, quantity, selectedSizes);
      setShowHelmetNumberingModal(false);
      toast({
        title: "Sucesso",
        description: `${quantity} capacete(s) adicionado(s) ao carrinho com numeração específica`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto ao carrinho",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    await toggleFavorite(product.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description || '',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "Link do produto copiado para a área de transferência",
      });
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getGalleryImages = () => {
    if (!product) return [];
    
    
    // Primeiro tenta gallery_images (campo usado pelo admin)
    let gallery = product.gallery_images as any;
    
    // Se não tiver gallery_images, tenta o campo gallery
    if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
      gallery = product.gallery as any;
    }
    
    
    if (Array.isArray(gallery) && gallery.length > 0) {
      return gallery.map((img: any, index: number) => {
        // Se img é uma string (URL), cria objeto com diferentes tamanhos
        if (typeof img === 'string') {
          return {
            id: `gallery-${index}`,
            thumbnail: img,
            medium: img,
            large: img,
            original: img,
            metadata: {
              originalSize: 0,
              compressedSize: 0,
              compressionRatio: 0,
              dimensions: { width: 0, height: 0 }
            }
          };
        }
        
        // Se img é um objeto com diferentes tamanhos
        return {
          id: `gallery-${index}`,
          thumbnail: img.thumbnail || img.medium || img,
          medium: img.medium || img,
          large: img.large || img.original || img,
          original: img.original || img,
          metadata: {
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 0,
            dimensions: { width: 0, height: 0 }
          }
        };
      });
    }
    
    // Fallback para imagem única
    const fallbackImages = [{
      id: 'main-image',
      thumbnail: product.image_url || '/placeholder.svg',
      medium: product.image_url || '/placeholder.svg',
      large: product.image_url || '/placeholder.svg',
      original: product.image_url || '/placeholder.svg',
      metadata: {
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        dimensions: { width: 0, height: 0 }
      }
    }];
    
    return fallbackImages;
  };

  if (loading) {
    return <LoadingProductDetail />;
  }

  if (hasError && !product) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Erro ao Carregar Produto</h1>
            <p className="text-muted-foreground mb-6">
              Não foi possível carregar o produto. 
              Isso pode ser devido a problemas de conectividade.
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 text-sm">
                <strong>Dica:</strong> Se o problema persistir, verifique sua conexão com a internet 
                ou tente acessar de uma rede diferente.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center mb-8">
              <Button 
                onClick={fetchProduct} 
                variant="default"
              >
                🔄 Tentar Novamente
              </Button>
              <Button onClick={() => navigate('/catalogo')} variant="outline">
                📋 Ir para Catálogo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate('/catalogo')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    );
  }

  const galleryImages = getGalleryImages();
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <span>/</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/catalogo')}
            className="p-0 h-auto"
          >
            Catálogo
          </Button>
          {category && (
            <>
              <span>/</span>
              <span className="text-foreground">{category.name}</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carrossel de Imagens Aprimorado */}
          <div className="space-y-4">
            {(() => {
              const galleryImages = getGalleryImages();
              const imageUrls = galleryImages.map(img => img.large || img.medium || img.thumbnail);
              
              return (
                <WorkingCarousel 
                  images={imageUrls}
                  productName={product.name}
                />
              );
            })()}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.is_new && (
                  <Badge variant="default" className="bg-accent-neon text-primary animate-pulse-glow">
                    NOVO
                  </Badge>
                )}
                {product.is_promo && (
                  <Badge variant="destructive">
                    PROMOÇÃO
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {category && (
                <p className="text-muted-foreground mb-4">
                  Categoria: <span className="font-medium">{category.name}</span>
                </p>
              )}
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.original_price!)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-medium">
                  Economize {formatPrice(product.original_price! - product.price)}
                </p>
              )}
            </div>

            {/* Numeração dos Capacetes */}
            {product.helmet_numbers && product.helmet_numbers.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Numeração Disponível</h3>
                <div className="flex flex-wrap gap-2">
                  {product.helmet_numbers.map((number) => (
                    <Button
                      key={number}
                      variant={selectedSize === number ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(number)}
                      className="min-w-[50px]"
                    >
                      {number}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione a numeração do capacete (53-64)
                </p>
              </div>
            )}

            {/* Tamanhos das Jaquetas */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Tamanho Disponível</h3>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className="min-w-[50px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione o tamanho da jaqueta (PP, P, M, G, GG, etc.)
                </p>
              </div>
            )}


            {/* Quantidade */}
            <div className="space-y-3">
              <h3 className="font-medium">Quantidade</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product.stock_quantity || 10)}
                >
                  +
                </Button>
              </div>
              {product.stock_quantity && (
                <p className="text-sm text-muted-foreground">
                  {product.stock_quantity} unidades disponíveis
                </p>
              )}
            </div>

            {/* Ações */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAdding ? "Adicionando..." : "Adicionar ao Carrinho"}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite(product.id) ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite(product.id) ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Informações de Entrega */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Frete Grátis</p>
                      <p className="text-sm text-muted-foreground">Para compras acima de R$ 200</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Garantia</p>
                      <p className="text-sm text-muted-foreground">1 ano de garantia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Troca Fácil</p>
                      <p className="text-sm text-muted-foreground">30 dias para troca</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs com Detalhes */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="specifications">Especificações</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Descrição do Produto</h3>
                  <div className="prose max-w-none">
                    {product.description ? (
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Descrição não disponível para este produto.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Especificações Técnicas</h3>
                  
                  {/* Especificações Técnicas Detalhadas */}
                  {product.specifications && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-3">Especificações Detalhadas</h4>
                      <div className="prose max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {product.specifications}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.sku && (
                      <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">SKU</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    )}
                    
                    {product.weight_grams && (
                      <div className="flex items-center gap-3">
                        <Weight className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Peso</p>
                          <p className="text-sm text-muted-foreground">{product.weight_grams}g</p>
                        </div>
                      </div>
                    )}

                    {product.material && (
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Material</p>
                          <p className="text-sm text-muted-foreground">{product.material}</p>
                        </div>
                      </div>
                    )}

                    {product.helmet_type && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Tipo de Capacete</p>
                          <p className="text-sm text-muted-foreground">{product.helmet_type}</p>
                        </div>
                      </div>
                    )}

                    {product.shell_material && (
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Material da Casca</p>
                          <p className="text-sm text-muted-foreground">{product.shell_material}</p>
                        </div>
                      </div>
                    )}

                    {product.liner_material && (
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Material do Forro</p>
                          <p className="text-sm text-muted-foreground">{product.liner_material}</p>
                        </div>
                      </div>
                    )}

                    {product.ventilation_system && (
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Sistema de Ventilação</p>
                          <p className="text-sm text-muted-foreground">{product.ventilation_system}</p>
                        </div>
                      </div>
                    )}

                    {product.visor_type && (
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Tipo de Viseira</p>
                          <p className="text-sm text-muted-foreground">{product.visor_type}</p>
                        </div>
                      </div>
                    )}

                    {product.chin_strap_type && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Tipo de Jugular</p>
                          <p className="text-sm text-muted-foreground">{product.chin_strap_type}</p>
                        </div>
                      </div>
                    )}

                    {product.retention_system && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Sistema de Retenção</p>
                          <p className="text-sm text-muted-foreground">{product.retention_system}</p>
                        </div>
                      </div>
                    )}

                    {product.impact_absorption && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Absorção de Impacto</p>
                          <p className="text-sm text-muted-foreground">{product.impact_absorption}</p>
                        </div>
                      </div>
                    )}

                    {product.penetration_resistance && (
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Resistência à Penetração</p>
                          <p className="text-sm text-muted-foreground">{product.penetration_resistance}</p>
                        </div>
                      </div>
                    )}

                    {product.warranty_period && (
                      <div className="flex items-center gap-3">
                        <RotateCcw className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Garantia</p>
                          <p className="text-sm text-muted-foreground">{product.warranty_period} meses</p>
                        </div>
                      </div>
                    )}

                    {product.country_of_origin && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">País de Origem</p>
                          <p className="text-sm text-muted-foreground">{product.country_of_origin}</p>
                        </div>
                      </div>
                    )}

                    {product.brand_model && (
                      <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Modelo</p>
                          <p className="text-sm text-muted-foreground">{product.brand_model}</p>
                        </div>
                      </div>
                    )}

                    {product.shell_sizes && product.shell_sizes.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Ruler className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Tamanhos da Casca</p>
                          <p className="text-sm text-muted-foreground">
                            {product.shell_sizes.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}


                    {product.helmet_numbers && product.helmet_numbers.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Ruler className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Numeração Disponível</p>
                          <p className="text-sm text-muted-foreground">
                            {product.helmet_numbers.sort((a, b) => a - b).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.certifications && product.certifications.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-2">Certificações</p>
                        <div className="flex flex-wrap gap-2">
                          {product.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.safety_standards && product.safety_standards.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-2">Padrões de Segurança</p>
                        <div className="flex flex-wrap gap-2">
                          {product.safety_standards.map((standard, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.color_options && product.color_options.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-2">Opções de Cores</p>
                        <div className="flex flex-wrap gap-2">
                          {product.color_options.map((color, index) => (
                            <Badge key={index} variant="outline">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.additional_features && product.additional_features.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-2">Recursos Adicionais</p>
                        <div className="flex flex-wrap gap-2">
                          {product.additional_features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="font-medium mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <ProductReviews productId={product.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Size Selection Modal */}
      {product && (
        <SizeSelectionModal
          isOpen={showSizeModal}
          onClose={() => setShowSizeModal(false)}
          onConfirm={handleSizeSelection}
          productName={product.name}
          quantity={quantity}
          availableSizes={product.helmet_numbers || []}
          productImage={product.image_url}
        />
      )}

      {/* Helmet Numbering Modal */}
      {product && (
        <HelmetNumberingModal
          isOpen={showHelmetNumberingModal}
          onClose={() => setShowHelmetNumberingModal(false)}
          onConfirm={handleHelmetNumberingSelection}
          productName={product.name}
          quantity={quantity}
          availableSizes={product.helmet_numbers || []}
          productImage={product.image_url}
        />
      )}
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <ProductDetailContent />
    </ErrorBoundary>
  );
};

export default ProductDetailPage;
