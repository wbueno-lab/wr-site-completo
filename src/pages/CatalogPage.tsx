import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import ProductCard from "@/components/ProductCard";
import SimpleProductCard from "@/components/SimpleProductCard";
import ForceQualityProductCard from "@/components/ForceQualityProductCard";
import BrandFilter from "@/components/BrandFilter";
import HelmetTypeFilter from "@/components/HelmetTypeFilter";
import HelmetSizeFilter from "@/components/HelmetSizeFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, Grid, List, ChevronDown, X } from "lucide-react";
import { useRealtime } from "@/contexts/RealtimeContext";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  gallery_images?: string[];
  is_new: boolean;
  is_promo: boolean;
  brand_id?: string;
  helmet_numbers?: number[];
  helmet_type?: string;
  shell_sizes?: string[];
  categories?: {
    name: string;
  };
  brands?: {
    id: string;
    name: string;
    country_of_origin?: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Verificação de segurança para o contexto
  let realtimeData;
  try {
    realtimeData = useRealtime();
  } catch (error) {
    console.error('❌ Erro ao acessar RealtimeContext:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro de Contexto</h1>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados. Tente recarregar a página.
          </p>
        </div>
      </div>
    );
  }
  
  const { products: allProducts, categories, brands, isLoading } = realtimeData;
  
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedHelmetTypes, setSelectedHelmetTypes] = useState<string[]>([]);
  const [selectedHelmetSizes, setSelectedHelmetSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showPromoOnly, setShowPromoOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Calculate max price from products
  useEffect(() => {
    if (allProducts.length > 0) {
      const maxProductPrice = Math.max(...allProducts.map(p => p.price));
      setMaxPrice(Math.ceil(maxProductPrice));
      setPriceRange([0, Math.ceil(maxProductPrice)]);
    }
  }, [allProducts]);

  // Filter and sort products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => product.is_active);

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        // Se o produto tem brand_id, verificar se está na lista selecionada
        if (product.brand_id && selectedBrands.includes(product.brand_id)) {
          return true;
        }
        
        // Para produtos sem brand_id ou marcas temporárias, verificar se o nome do produto contém o nome da marca
        const selectedBrandNames = selectedBrands
          .map(brandId => brands.find(b => b.id === brandId)?.name)
          .filter(Boolean);
        
        return selectedBrandNames.some(brandName => 
          product.name.toLowerCase().includes(brandName!.toLowerCase())
        );
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply new products filter
    if (showNewOnly) {
      filtered = filtered.filter(product => product.is_new);
    }

    // Apply promo filter
    if (showPromoOnly) {
      filtered = filtered.filter(product => product.is_promo);
    }

    // Apply helmet type filter
    if (selectedHelmetTypes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.helmet_type) return false;
        // Mapear tipos do banco para os IDs dos filtros
        const typeMapping: Record<string, string[]> = {
          'fechado': ['integral', 'fechado', 'full-face'],
          'articulado': ['modular', 'articulado', 'flip-up'],
          'viseira_solar': ['viseira solar', 'sun visor', 'solar'],
          'aberto': ['aberto', 'jet', 'open-face'],
          'off_road': ['off-road', 'motocross', 'trilha', 'enduro']
        };
        
        return selectedHelmetTypes.some(selectedType => {
          const mappedTypes = typeMapping[selectedType] || [selectedType];
          return mappedTypes.some(mappedType => 
            product.helmet_type!.toLowerCase().includes(mappedType.toLowerCase())
          );
        });
      });
    }

    // Apply helmet size filter
    if (selectedHelmetSizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.shell_sizes || !Array.isArray(product.shell_sizes)) return false;
        return selectedHelmetSizes.some(selectedSize => 
          product.shell_sizes!.includes(selectedSize)
        );
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [allProducts, selectedCategory, selectedBrands, selectedHelmetTypes, selectedHelmetSizes, searchQuery, priceRange, showNewOnly, showPromoOnly, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filteredProducts useMemo
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      
      <div className="container px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-hero mb-4">
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground">
            Explore nossa linha completa de capacetes premium
          </p>
        </div>

        {/* Helmet Type Filters */}
        <div className="mb-6">
          <HelmetTypeFilter
            selectedTypes={selectedHelmetTypes}
            onTypeChange={setSelectedHelmetTypes}
            productCounts={(() => {
              const counts: Record<string, number> = {};
              const typeMapping: Record<string, string[]> = {
                'fechado': ['integral', 'fechado', 'full-face'],
                'articulado': ['modular', 'articulado', 'flip-up'],
                'viseira_solar': ['viseira solar', 'sun visor', 'solar'],
                'aberto': ['aberto', 'jet', 'open-face'],
                'off_road': ['off-road', 'motocross', 'trilha', 'enduro']
              };
              
              Object.keys(typeMapping).forEach(filterType => {
                counts[filterType] = allProducts.filter(product => {
                  if (!product.helmet_type) return false;
                  const mappedTypes = typeMapping[filterType];
                  return mappedTypes.some(mappedType => 
                    product.helmet_type!.toLowerCase().includes(mappedType.toLowerCase())
                  );
                }).length;
              });
              
              return counts;
            })()}
          />
        </div>

        {/* Helmet Size Filters */}
        <div className="mb-6">
          <HelmetSizeFilter
            selectedSizes={selectedHelmetSizes}
            onSizeChange={setSelectedHelmetSizes}
            productCounts={(() => {
              const counts: Record<string, number> = {};
              const sizes = ["54", "56", "58", "60", "62", "64"];
              
              sizes.forEach(size => {
                counts[size] = allProducts.filter(product => 
                  product.shell_sizes && Array.isArray(product.shell_sizes) && 
                  product.shell_sizes.includes(size)
                ).length;
              });
              
              return counts;
            })()}
          />
        </div>


        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar capacetes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Filtros Avançados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Faixa de Preço</label>
                    <div className="space-y-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={maxPrice}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>R$ {priceRange[0].toFixed(0)}</span>
                        <span>R$ {priceRange[1].toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Status */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Status do Produto</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="new-only"
                          checked={showNewOnly}
                          onCheckedChange={(checked) => setShowNewOnly(checked === true)}
                        />
                        <label htmlFor="new-only" className="text-sm">
                          Apenas Novos
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="promo-only"
                          checked={showPromoOnly}
                          onCheckedChange={(checked) => setShowPromoOnly(checked === true)}
                        />
                        <label htmlFor="promo-only" className="text-sm">
                          Apenas Promoções
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Ações</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedBrands([]);
                        setSelectedHelmetTypes([]);
                        setSelectedHelmetSizes([]);
                        setPriceRange([0, maxPrice]);
                        setShowNewOnly(false);
                        setShowPromoOnly(false);
                        setSortBy("name");
                      }}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filters Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar com filtros */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Filtro por Marcas */}
            <BrandFilter
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandChange={setSelectedBrands}
              isLoading={isLoading}
              products={allProducts}
            />
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-80 w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((product, index) => (
                  <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                    <ForceQualityProductCard 
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        originalPrice: product.original_price,
                        image: product.image_url || '/placeholder.svg',
                        image_url: product.image_url,
                        image_thumbnail: (product as any).image_thumbnail,
                        image_medium: (product as any).image_medium,
                        image_large: (product as any).image_large,
                        category: (product as any).categories?.name || '',
                        brand: (product as any).brands?.name || (() => {
                          // Para marcas temporárias, tentar encontrar pelo nome do produto
                          const matchingBrand = brands.find(brand => 
                            product.name.toLowerCase().includes(brand.name.toLowerCase())
                          );
                          return matchingBrand?.name || '';
                        })(),
                        isNew: product.is_new,
                        isPromo: product.is_promo,
                        galleryImages: Array.isArray(product.gallery_images) ? product.gallery_images as string[] : [],
                        helmet_numbers: product.helmet_numbers || [],
                      }} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou termo de busca
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrands([]);
                  setSelectedHelmetTypes([]);
                  setSelectedHelmetSizes([]);
                  setSortBy("name");
                }}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
