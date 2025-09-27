import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtime } from "@/contexts/RealtimeContext";
import { useNavigate } from "react-router-dom";

// Mapeamento dos ícones das marcas
const getBrandIcon = (brandName: string) => {
  const iconMap: Record<string, string> = {
    'AGV': '/ICONE AGV.png',
    'ASX': '/ICONE-ASX.png',
    'BIEFFE': '/ICONE BIEFFE.png',
    'FW3': '/ICONE FW3.png',
    'KYT': '/ICONE-KYT.png',
    'LS2': '/ICONE-LS2.png',
    'NORISK': '/ICONE NORISK.png',
    'PEELS': '/ICONE PEELS.png'
  };
  
  return iconMap[brandName.toUpperCase()] || '/ICONE-LS2.png';
};

const BrandsContent = () => {
  const { brands, isLoading } = useRealtime();
  const navigate = useNavigate();

  // Usar marcas do banco de dados, excluindo AXXIS
  const featuredBrands = brands
    .filter(brand => brand.is_active !== false && brand.name.toUpperCase() !== 'AXXIS')
    .slice(0, 8);

  // Função para navegar para o catálogo com filtro de marca
  const handleBrandClick = (brandId: string, brandName: string) => {
    navigate(`/catalogo?marca=${brandId}&nome=${encodeURIComponent(brandName)}`);
  };

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
              const brandIconPath = getBrandIcon(brand.name);
              return (
                <Card 
                  key={brand.id}
                  className="group cursor-pointer border-animated card-hover overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleBrandClick(brand.id, brand.name)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    {/* Brand Icon */}
                    <div className={`mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                      brand.name.toUpperCase() === 'NORISK' ? 'w-20 h-20' : 'w-16 h-16'
                    }`}>
                      <img 
                        src={brandIconPath}
                        alt={`${brand.name} logo`}
                        className={`object-contain ${
                          brand.name.toUpperCase() === 'NORISK' ? 'w-20 h-20' : 'w-16 h-16'
                        }`}
                        onError={(e) => {
                          // Fallback para um ícone padrão se a imagem não carregar
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Brand Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold group-hover:text-accent-neon transition-colors">
                        {brand.name}
                      </h3>
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
