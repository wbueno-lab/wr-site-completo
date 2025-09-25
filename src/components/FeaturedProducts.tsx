import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import SimpleProductCard from "./SimpleProductCard";
import ForceQualityProductCard from "./ForceQualityProductCard";
import ImageDebugger from "./ImageDebugger";
import { useRealtime } from "@/contexts/RealtimeContext";

const FeaturedProductsContent = () => {
  const { products, isLoading } = useRealtime();
  
  // Filter and limit products for featured display
  const featuredProducts = products
    .filter(product => product.is_active)
    .slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 text-accent-neon text-sm font-semibold">
            <div className="w-8 h-px bg-accent-neon" />
            <span>PRODUTOS EM DESTAQUE</span>
            <div className="w-8 h-px bg-accent-neon" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-gradient-hero">Escolha Premium</span>
          </h2>
          
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Conheça nossa seleção especial de capacetes com a melhor relação custo-benefício e tecnologia avançada.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-80 w-full"></div>
              </div>
            ))
          ) : (
            featuredProducts.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                  
                  <ForceQualityProductCard 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.original_price,
                      image: product.image_url,
                      image_url: product.image_url,
                      image_thumbnail: (product as any).image_thumbnail,
                      image_medium: (product as any).image_medium,
                      image_large: (product as any).image_large,
                      category: (product as any).categories?.name || '',
                      brand: (product as any).brands?.name || '',
                      isNew: product.is_new,
                      isPromo: product.is_promo,
                      galleryImages: Array.isArray(product.gallery_images) ? product.gallery_images as string[] : (Array.isArray(product.gallery) ? product.gallery as string[] : []),
                      helmet_numbers: (product as any).helmet_numbers || [],
                    }} 
                  />
                </div>
              ))
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link to="/catalogo">
            <Button variant="premium" size="xl" className="group">
              Ver Todos os Produtos
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsContent;