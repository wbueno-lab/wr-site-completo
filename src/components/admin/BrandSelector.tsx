import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, CheckCircle, Building2 } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
}

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrandId: string;
  onBrandSelect: (brandId: string) => void;
  allowNoBrand?: boolean;
  className?: string;
}

const BrandSelector = ({ 
  brands, 
  selectedBrandId, 
  onBrandSelect, 
  allowNoBrand = true,
  className = ""
}: BrandSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);


  // Filtrar marcas baseado na busca - memorizado para evitar re-cálculos desnecessários
  const filteredBrands = useMemo(() => {
    if (!brands || brands.length === 0) return [];
    
    // Primeiro filtrar AXXIS, depois aplicar busca
    const brandsWithoutAXXIS = brands.filter(brand => brand.name.toUpperCase() !== 'AXXIS');
    
    if (!searchTerm || searchTerm.trim() === '') return brandsWithoutAXXIS;
    
    return brandsWithoutAXXIS.filter(brand => 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  // Mostrar apenas as primeiras 6 marcas por padrão, ou todas se showAll for true
  // Se há busca ativa, sempre mostrar todos os resultados filtrados
  const displayBrands = useMemo(() => {
    if (searchTerm && searchTerm.length > 0) {
      return filteredBrands;
    }
    return showAll ? filteredBrands : filteredBrands.slice(0, 6);
  }, [filteredBrands, searchTerm, showAll]);

  const hasMoreBrands = useMemo(() => {
    return !searchTerm && brands && brands.length > 6;
  }, [searchTerm, brands]);

  const handleBrandSelect = useCallback((brandId: string) => {
    onBrandSelect(brandId);
  }, [onBrandSelect]);

  const handleNoBrandSelect = useCallback(() => {
    onBrandSelect('none');
  }, [onBrandSelect]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
    setShowAll(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com busca */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-white flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand-green" />
          Selecionar Marca
        </Label>
        
        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar marca..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 h-10 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Opção "Sem marca" */}
      {allowNoBrand && (
        <div 
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            selectedBrandId === 'none' 
              ? 'border-brand-green bg-brand-green/10' 
              : 'border-gray-600 bg-brand-dark-lighter hover:border-brand-green/50'
          }`}
          onClick={handleNoBrandSelect}
        >
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selectedBrandId === 'none'}
              className="border-brand-green data-[state=checked]:bg-brand-green"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Sem marca</span>
                {selectedBrandId === 'none' && (
                  <CheckCircle className="h-4 w-4 text-brand-green" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Produto sem marca específica</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de marcas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {searchTerm ? 
              `${filteredBrands.length} marca${filteredBrands.length !== 1 ? 's' : ''} encontrada${filteredBrands.length !== 1 ? 's' : ''}` :
              `${brands?.length || 0} marca${(brands?.length || 0) !== 1 ? 's' : ''} disponível${(brands?.length || 0) !== 1 ? 'is' : ''}`
            }
          </span>
          {hasMoreBrands && !showAll && !searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="text-brand-green hover:text-brand-green-dark text-xs"
            >
              Ver todas ({brands?.length || 0})
            </Button>
          )}
        </div>

        {displayBrands.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">Nenhuma marca encontrada</p>
            <p className="text-xs text-gray-500 mt-1">Tente ajustar o termo de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayBrands.map((brand) => (
              <div
                key={brand.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                  selectedBrandId === brand.id
                    ? 'border-brand-green bg-brand-green/10'
                    : 'border-gray-600 bg-brand-dark-lighter hover:border-brand-green/50'
                }`}
                onClick={() => handleBrandSelect(brand.id)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedBrandId === brand.id}
                    className="border-brand-green data-[state=checked]:bg-brand-green"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {brand.name}
                      </span>
                      {selectedBrandId === brand.id && (
                        <CheckCircle className="h-4 w-4 text-brand-green flex-shrink-0" />
                      )}
                    </div>
                    {brand.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão para mostrar menos marcas */}
        {showAll && hasMoreBrands && !searchTerm && (
          <div className="text-center pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Mostrar menos
            </Button>
          </div>
        )}
      </div>

      {/* Marca selecionada - resumo */}
      {selectedBrandId && selectedBrandId !== 'none' && (
        <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-brand-green" />
            <span className="text-sm font-medium text-white">
              Marca selecionada: {brands?.find(b => b.id === selectedBrandId)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSelector;
