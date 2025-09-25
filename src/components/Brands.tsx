import { Shield, Globe, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtime } from "@/contexts/RealtimeContext";

const getIconComponent = (index: number) => {
  const icons = [Shield, Globe, Star, Award];
  return icons[index % icons.length];
};

const BrandsContent = () => {
  const { brands, isLoading } = useRealtime();

  // Usar marcas do banco de dados
  const featuredBrands = brands.filter(brand => brand.is_active !== false).slice(0, 8);

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 text-accent-neon text-sm font-semibold">
            <div className="w-8 h-px bg-accent-neon" />
            <span>MARCAS</span>
            <div className="w-8 h-px bg-accent-neon" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-gradient-hero">Marcas Confiáveis</span>
          </h2>
          
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Trabalhamos com as melhores marcas do mercado para garantir qualidade e segurança.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <Card className="border-animated">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            featuredBrands.map((brand, index) => {
              const IconComponent = getIconComponent(index);
              return (
                <Card 
                  key={brand.id}
                  className="group cursor-pointer border-animated card-hover overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    {/* Icon with Gradient Background */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent-neon/20 to-accent-neon/40 flex items-center justify-center text-accent-neon shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8" />
                    </div>

                    {/* Brand Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold group-hover:text-accent-neon transition-colors">
                        {brand.name}
                      </h3>
                      {brand.country_of_origin && (
                        <Badge variant="outline" className="text-xs">
                          {brand.country_of_origin}
                        </Badge>
                      )}
                      {brand.founded_year && (
                        <p className="text-xs text-white/60">
                          Desde {brand.founded_year}
                        </p>
                      )}
                    </div>

                    {/* Hover Effect */}
                    <div className="pt-4">
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent-neon/50 to-accent-neon transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-white/80">
            Quer ver todos os produtos de uma marca específica?{" "}
            <a href="/catalogo" className="text-accent-neon font-semibold hover:underline">
              Explore nosso catálogo completo
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrandsContent;
