import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, MessageSquare, Tag, Package, Eye, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from "@/components/ui/use-toast";
import ProductReviews from "./ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { optimizeImageUrl } from "@/lib/imageOptimization";
import { OptimizedImage } from "./OptimizedImage";
import { HighQualityImage } from "./HighQualityImage";
import { MaxQualityImage } from "./MaxQualityImage";
import SizeSelectionModal from "./SizeSelectionModal";
import HelmetNumberingModal from "./HelmetNumberingModal";
import ImageGallery from "./ImageGallery";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  gallery_images?: string[];
  image_thumbnail?: string;
  image_medium?: string;
  image_large?: string;
  description?: string;
  is_new: boolean;
  is_promo: boolean;
  stock_quantity: number;
  available_sizes?: string[]; // Alterado de number[] para string[]
  helmet_numbers?: number[];
  categories?: {
    name: string;
  };
  sku?: string;
  material?: string;
  helmet_type?: string;
  shell_material?: string;
  liner_material?: string;
  ventilation_system?: string;
  visor_type?: string;
  chin_strap_type?: string;
  retention_system?: string;
  impact_absorption?: string;
  penetration_resistance?: string;
  warranty_period?: number;
  country_of_origin?: string;
  brand_model?: string;
  shell_sizes?: string[];
  certifications?: string[];
  safety_standards?: string[];
  color_options?: string[];
  additional_features?: string[];
  tags?: string[];
}

interface QuickViewModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ productId, isOpen, onClose }: QuickViewModalProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showHelmetNumberingModal, setShowHelmetNumberingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const { addToCart, addMultipleToCart } = useCart();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    if (productId && isOpen) {
      fetchProduct();
    }
  }, [productId, isOpen]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || allImages.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextImage();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, allImages.length, onClose]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          gallery_images,
          image_thumbnail,
          image_medium,
          image_large,
          description,
          is_new,
          is_promo,
          stock_quantity,
          available_sizes,
          helmet_numbers,
          categories (
            name
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Preparar todas as imagens disponíveis
      const images = [];
      if (data.image_url) images.push(data.image_url);
      if (data.image_large && data.image_large !== data.image_url) images.push(data.image_large);
      if (data.image_medium && data.image_medium !== data.image_url && data.image_medium !== data.image_large) images.push(data.image_medium);
      if (data.gallery_images && Array.isArray(data.gallery_images)) {
        data.gallery_images.forEach(img => {
          if (img && !images.includes(img)) images.push(img);
        });
      }
      setAllImages(images);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o produto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if product has helmet_numbers and quantity > 1
    if (product.helmet_numbers && product.helmet_numbers.length > 0 && quantity > 1) {
      setShowHelmetNumberingModal(true);
      return;
    }
    
    try {
      await addToCart(product.id, quantity, selectedSize);
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao carrinho`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho",
        variant: "destructive"
      });
    }
  };

  const handleSizeSelection = async (selectedSizes: number[]) => {
    if (!product) return;
    
    try {
      await addMultipleToCart(product.id, quantity, selectedSizes);
      setShowSizeModal(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho",
        variant: "destructive"
      });
    }
  };

  const handleHelmetNumberingSelection = async (selectedSizes: number[]) => {
    if (!product) return;
    
    try {
      await addMultipleToCart(product.id, quantity, selectedSizes);
      setShowHelmetNumberingModal(false);
      toast({
        title: "Produtos adicionados!",
        description: `${quantity} capacete(s) adicionado(s) ao carrinho com numeração específica`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isFavorited ? "Produto removido da sua lista de favoritos" : "Produto adicionado à sua lista de favoritos",
    });
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };


  if (!product && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          Visualização rápida do produto {product?.name}
        </DialogDescription>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : product ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalhes do Produto</TabsTrigger>
              <TabsTrigger value="specifications">Especificações</TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Avaliações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="relative group">
                    <button
                      onClick={() => setShowImageGallery(true)}
                      className="w-full h-96 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <MaxQualityImage 
                        src={allImages[currentImageIndex] || product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                    
                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.is_new && (
                        <Badge className="bg-accent-neon text-primary font-bold">
                          NOVO
                        </Badge>
                      )}
                      {product.is_promo && product.original_price && (
                        <Badge className="bg-destructive text-destructive-foreground font-bold">
                          -{calculateDiscount(product.original_price, product.price)}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-4 right-4 ${isFavorited ? 'text-red-500' : ''}`}
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {/* Thumbnail Navigation */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          <MaxQualityImage 
                            src={image} 
                            alt={`${product.name} - Imagem ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                    <p className="text-muted-foreground">{product.categories?.name}</p>
                  </DialogHeader>

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-primary">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      {product.original_price && (
                        <span className="text-lg text-muted-foreground line-through">
                          R$ {product.original_price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                    {product.original_price && (
                      <p className="text-sm text-green-600 font-semibold">
                        Economize R$ {(product.original_price - product.price).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Descrição</h4>
                      <p className="text-muted-foreground">{product.description}</p>
                    </div>
                  )}

                  {/* Available Sizes */}
                  {product.available_sizes && product.available_sizes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Tamanhos Disponíveis</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.available_sizes
                          .sort((a, b) => {
                            // Sort function that handles both strings and numbers
                            if (typeof a === 'string' && typeof b === 'string') {
                              // Custom sort for clothing sizes
                              const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', '3G', '4G', '5G', '6G', '7G', '8G', '9G', '10G', 'XS', 'S', 'L', 'XL', 'XXL', 'XXXL'];
                              return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                            }
                            return a - b;
                          })
                          .map((size) => (
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Selecione o tamanho desejado
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Características</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Garantia de 1 ano</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <span>Frete grátis para todo o Brasil</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <RotateCcw className="h-4 w-4 text-orange-500" />
                        <span>Troca em até 7 dias</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>Produto premium</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      {product.stock_quantity > 0 
                        ? `${product.stock_quantity} unidades disponíveis` 
                        : 'Produto esgotado'
                      }
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="flex items-center px-4">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= product.stock_quantity}
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock_quantity === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Especificações Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.sku && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">SKU</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                    </div>
                  )}
                  
                  {product.material && (
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Material</p>
                        <p className="text-xs text-muted-foreground">{product.material}</p>
                      </div>
                    </div>
                  )}

                  {product.helmet_type && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Tipo de Capacete</p>
                        <p className="text-xs text-muted-foreground">{product.helmet_type}</p>
                      </div>
                    </div>
                  )}

                  {product.shell_material && (
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Material da Casca</p>
                        <p className="text-xs text-muted-foreground">{product.shell_material}</p>
                      </div>
                    </div>
                  )}

                  {product.ventilation_system && (
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Sistema de Ventilação</p>
                        <p className="text-xs text-muted-foreground">{product.ventilation_system}</p>
                      </div>
                    </div>
                  )}

                  {product.visor_type && (
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Tipo de Viseira</p>
                        <p className="text-xs text-muted-foreground">{product.visor_type}</p>
                      </div>
                    </div>
                  )}

                  {product.warranty_period && (
                    <div className="flex items-center gap-3">
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Garantia</p>
                        <p className="text-xs text-muted-foreground">{product.warranty_period} meses</p>
                      </div>
                    </div>
                  )}

                  {product.country_of_origin && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">País de Origem</p>
                        <p className="text-xs text-muted-foreground">{product.country_of_origin}</p>
                      </div>
                    </div>
                  )}

                  {product.certifications && product.certifications.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-sm mb-2">Certificações</p>
                      <div className="flex flex-wrap gap-1">
                        {product.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.safety_standards && product.safety_standards.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-sm mb-2">Padrões de Segurança</p>
                      <div className="flex flex-wrap gap-1">
                        {product.safety_standards.map((standard, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {standard}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>

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

      {/* Image Gallery Modal */}
      <ImageGallery
        images={allImages}
        productName={product?.name || ''}
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        initialIndex={currentImageIndex}
      />
    </Dialog>
  );
};

export default QuickViewModal;
