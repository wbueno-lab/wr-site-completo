import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Brand {
  id: string;
  name: string;
  description?: string;
  country_of_origin?: string;
  product_count?: number;
}

interface BrandFilterProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandChange: (brandIds: string[]) => void;
  isLoading?: boolean;
  products?: any[]; // Para calcular contagem de produtos
}

const BrandFilter = ({ 
  brands, 
  selectedBrands, 
  onBrandChange, 
  isLoading = false,
  products = []
}: BrandFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands);

  // Calcular contagem de produtos por marca
  const getProductCount = (brandId: string) => {
    // Se for uma marca temporária, simular contagem baseada no nome da marca
    if (brandId.startsWith('temp-brand-')) {
      const brand = brands.find(b => b.id === brandId);
      if (brand) {
        return products.filter(product => 
          product.is_active && 
          product.name.toLowerCase().includes(brand.name.toLowerCase())
        ).length;
      }
    }
    
    // Para marcas reais, contar produtos que têm brand_id correspondente
    // ou que contêm o nome da marca no nome do produto
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return 0;
    
    return products.filter(product => {
      if (!product.is_active) return false;
      
      // Se o produto tem brand_id, verificar se corresponde
      if (product.brand_id === brandId) return true;
      
      // Se não tem brand_id, verificar se o nome contém o nome da marca
      return product.name.toLowerCase().includes(brand.name.toLowerCase());
    }).length;
  };

  // Filtrar marcas baseado na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.country_of_origin?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const handleBrandToggle = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter(id => id !== brandId));
    } else {
      onBrandChange([...selectedBrands, brandId]);
    }
  };

  const clearAllBrands = () => {
    onBrandChange([]);
  };

  const selectAllBrands = () => {
    onBrandChange(filteredBrands.map(brand => brand.id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Marcas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Marcas</CardTitle>
          {selectedBrands.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedBrands.length} selecionada{selectedBrands.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar marcas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ações rápidas */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllBrands}
            disabled={filteredBrands.length === 0}
            className="text-xs"
          >
            Selecionar Todas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllBrands}
            disabled={selectedBrands.length === 0}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>

        {/* Lista de marcas */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nenhuma marca encontrada
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={() => handleBrandToggle(brand.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm font-medium cursor-pointer block"
                  >
                    {brand.name}
                  </label>
                  {brand.country_of_origin && (
                    <p className="text-xs text-muted-foreground">
                      {brand.country_of_origin}
                    </p>
                  )}
                  {(() => {
                    const count = getProductCount(brand.id);
                    return count > 0 && (
                      <p className="text-xs text-accent-neon">
                        {count} produto{count !== 1 ? 's' : ''}
                      </p>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Marcas selecionadas */}
        {selectedBrands.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map((brandId) => {
                const brand = brands.find(b => b.id === brandId);
                return brand ? (
                  <Badge
                    key={brandId}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleBrandToggle(brandId)}
                  >
                    {brand.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandFilter;
