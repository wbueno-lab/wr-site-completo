import { useState, useEffect } from "react";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Percent, Clock, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  is_new: boolean;
  is_promo: boolean;
  categories?: {
    name: string;
  };
}

const PromotionsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            original_price,
            image_url,
            is_new,
            is_promo,
            categories (
              name
            )
          `)
          .eq('is_active', true)
          .eq('is_promo', true)
          .order('created_at', { ascending: false })
          .range(0, itemsPerPage - 1);

        if (error) throw error;
        setProducts(data || []);
        setHasMore(data?.length === itemsPerPage);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          is_new,
          is_promo,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .eq('is_promo', true)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (data) {
        setProducts(prev => [...prev, ...data]);
        setHasMore(data.length === itemsPerPage);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more promotions:', error);
    } finally {
      setLoadingMore(false);
    }
  };
  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-destructive/10 via-accent-neon/10 to-destructive/10">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 text-destructive text-sm font-semibold">
              <div className="w-8 h-px bg-destructive" />
              <span>OFERTAS ESPECIAIS</span>
              <div className="w-8 h-px bg-destructive" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient-hero">Promoções</span>{" "}
              <span className="text-destructive">Imperdíveis</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Aproveite nossas ofertas especiais com descontos exclusivos em capacetes premium.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
              <div className="flex items-center justify-center space-x-3 text-foreground">
                <div className="p-2 rounded-full bg-destructive/20">
                  <Percent className="h-5 w-5 text-destructive" />
                </div>
                <span className="font-semibold">Até 50% OFF</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 text-foreground">
                <div className="p-2 rounded-full bg-destructive/20">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <span className="font-semibold">Ofertas Limitadas</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 text-foreground">
                <div className="p-2 rounded-full bg-destructive/20">
                  <Star className="h-5 w-5 text-destructive" />
                </div>
                <span className="font-semibold">Produtos Premium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-12">
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-80 w-full"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                  <div className="relative">
                  <ProductCard 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.original_price,
                      image: product.image_url,
                      category: product.categories?.name || '',
                      isNew: product.is_new,
                      isPromo: product.is_promo,
                      galleryImages: Array.isArray(product.gallery_images) ? product.gallery_images as string[] : [],
                    }} 
                  />
                    
                    {/* Discount Badge */}
                    {product.original_price && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-destructive text-destructive-foreground font-bold text-sm px-3 py-1">
                          -{calculateDiscount(product.original_price, product.price)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais produtos'
                  )}
                </Button>
              </div>
            )}

            {/* CTA Section */}
            <div className="text-center bg-muted/30 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Não perca essas ofertas!</h3>
              <p className="text-muted-foreground mb-6">
                Cadastre-se para receber notificações sobre novas promoções
              </p>
              <Button variant="premium" size="lg" className="group">
                Cadastrar-se
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma promoção ativa</h3>
            <p className="text-muted-foreground mb-4">
              No momento não temos promoções disponíveis. Volte em breve!
            </p>
            <Button variant="outline">
              Ver Catálogo Completo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;
