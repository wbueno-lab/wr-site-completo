import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import ProductCard from "@/components/ProductCard";
import SimpleProductCard from "@/components/SimpleProductCard";
import ForceQualityProductCard from "@/components/ForceQualityProductCard";
import JacketBrandFilter from "@/components/JacketBrandFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, Grid, List, ChevronDown, X, Shirt } from "lucide-react";
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
  is_active?: boolean;
  brand_id?: string;
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

const VestuarioPage = () => {
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
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showPromoOnly, setShowPromoOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Processar parâmetros de URL para filtros automáticos
  useEffect(() => {
    const marcaParam = searchParams.get("marca");
    const categoryParam = searchParams.get("category");
    
    if (marcaParam) {
      setSelectedBrands([marcaParam]);
    }
    
    // Filtrar por categoria específica se vier da URL
    if (categoryParam) {
      setSearchQuery(categoryParam);
    }
  }, [searchParams]);

  // Calculate max price from products
  useEffect(() => {
    if (allProducts.length > 0) {
      const maxProductPrice = Math.max(...allProducts.map(p => p.price));
      setMaxPrice(Math.ceil(maxProductPrice / 100) * 100);
      setPriceRange([0, Math.ceil(maxProductPrice / 100) * 100]);
    }
  }, [allProducts]);

  // Filtrar produtos relacionados a vestuário
  const vestuarioProducts = useMemo(() => {
    return allProducts.filter(product => {
      const productName = product.name.toLowerCase();
      const categoryName = product.categories?.name?.toLowerCase() || '';
      
      // Palavras-chave relacionadas a vestuário
      const vestuarioKeywords = [
        'jaqueta', 'jaquetas', 'casaco', 'casacos',
        'blusa', 'blusas', 'camisa', 'camisas',
        'camiseta', 'camisetas', 'moletom', 'moletons',
        'colete', 'coletes', 'luva', 'luvas',
        'calça', 'calças', 'bermuda', 'bermudas',
        'shorts', 'proteção', 'proteções',
        'vestuário', 'roupa', 'roupas',
        // Subcategorias específicas
        'bota', 'botas', 'balaclava', 'balaclavas',
        'segunda', 'pele', 'capa', 'chuva',
        'impermeável', 'impermeavel',
        // Categorias mantidas
        'macacão', 'macacoes'
      ];
      
      return vestuarioKeywords.some(keyword => 
        productName.includes(keyword) || categoryName.includes(keyword)
      );
    });
  }, [allProducts]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = vestuarioProducts.filter(product => product.is_active !== false);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brands?.name.toLowerCase().includes(query) ||
        product.categories?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categories?.name === selectedCategory);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brands?.name || "")
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // New products filter
    if (showNewOnly) {
      filtered = filtered.filter(product => product.is_new);
    }

    // Promo products filter
    if (showPromoOnly) {
      filtered = filtered.filter(product => product.is_promo);
    }

    return filtered;
  }, [vestuarioProducts, searchQuery, selectedCategory, selectedBrands, priceRange, showNewOnly, showPromoOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
        return sorted.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setShowNewOnly(false);
    setShowPromoOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || 
    selectedBrands.length > 0 || showNewOnly || showPromoOnly ||
    priceRange[0] > 0 || priceRange[1] < maxPrice;

  // Get unique categories from vestuario products
  const vestuarioCategories = useMemo(() => {
    const categorySet = new Set<string>();
    vestuarioProducts.forEach(product => {
      if (product.categories?.name) {
        categorySet.add(product.categories.name);
      }
    });
    return Array.from(categorySet).map(name => ({ id: name, name }));
  }, [vestuarioProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-neon mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando produtos de vestuário...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shirt className="h-8 w-8 text-accent-neon" />
            <h1 className="text-3xl font-bold">Vestuário Motociclístico</h1>
          </div>
          <p className="text-muted-foreground">
            Encontre jaquetas, luvas, calças e todos os equipamentos de proteção para motociclistas.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="lg:sticky lg:top-24">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Buscar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar vestuário..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {vestuarioCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Brands */}
                <JacketBrandFilter
                  brands={brands}
                  selectedBrands={selectedBrands}
                  onBrandChange={setSelectedBrands}
                />

                {/* Price Range */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Faixa de Preço</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>R$ {priceRange[0]}</span>
                      <span>R$ {priceRange[1]}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filtros Especiais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-only"
                        checked={showNewOnly}
                        onCheckedChange={setShowNewOnly}
                      />
                      <label htmlFor="new-only" className="text-sm font-medium">
                        Apenas novidades
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="promo-only"
                        checked={showPromoOnly}
                        onCheckedChange={setShowPromoOnly}
                      />
                      <label htmlFor="promo-only" className="text-sm font-medium">
                        Apenas promoções
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome (A-Z)</SelectItem>
                    <SelectItem value="price-asc">Menor preço</SelectItem>
                    <SelectItem value="price-desc">Maior preço</SelectItem>
                    <SelectItem value="newest">Mais novos</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center border rounded-md">
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
            </div>

            {/* Products */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Shirt className="h-24 w-24 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {sortedProducts.map((product) => (
                  <div key={product.id}>
                    {viewMode === "grid" ? (
                      <ProductCard product={product} />
                    ) : (
                      <SimpleProductCard product={product} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VestuarioPage;
