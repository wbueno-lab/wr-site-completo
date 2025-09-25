import { Bike, Mountain, Car, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useRealtime } from "@/contexts/RealtimeContext";

const getIconComponent = (iconName: string) => {
  const icons = { Bike, Shield, Mountain, Car };
  return icons[iconName as keyof typeof icons] || Shield;
};

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  product_count: number;
}

const CategoriesContent = () => {
  const { categories, isLoading } = useRealtime();

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 text-accent-neon text-sm font-semibold">
            <div className="w-8 h-px bg-accent-neon" />
            <span>CATEGORIAS</span>
            <div className="w-8 h-px bg-accent-neon" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-gradient-hero">Encontre o Seu Estilo</span>
          </h2>
          
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Explore nossa ampla variedade de capacetes organizados por categoria para encontrar o modelo perfeito.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <Card className="border-animated">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            categories.map((category, index) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Link key={category.id} to={`/catalogo?category=${category.id}`}>
                  <Card 
                    className="group cursor-pointer border-animated card-hover overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      {/* Icon with Gradient Background */}
                      <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8" />
                      </div>

                      {/* Category Info */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold group-hover:text-accent-neon transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-white/70">
                          {category.description}
                        </p>
                        <p className="text-xs font-semibold text-accent-neon">
                          {category.product_count}+ modelos
                        </p>
                      </div>

                      {/* Hover Effect */}
                      <div className="pt-4">
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${category.color} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-white/80">
            Não encontrou o que procura?{" "}
            <Link to="/contato" className="text-accent-neon font-semibold hover:underline">
              Entre em contato conosco
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CategoriesContent;