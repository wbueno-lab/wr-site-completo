import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HelmetType {
  id: string;
  name: string;
  icon: string;
  description: string;
  count?: number;
}

interface HelmetTypeFilterProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  productCounts: Record<string, number>;
}

const helmetTypes: HelmetType[] = [
  {
    id: "fechado",
    name: "Fechado",
    icon: "🏍️",
    description: "Capacete integral com proteção total"
  },
  {
    id: "articulado",
    name: "Articulado",
    icon: "🔄",
    description: "Capacete modular com queixeira móvel"
  },
  {
    id: "viseira_solar",
    name: "C/ Viseira Solar",
    icon: "🕶️",
    description: "Capacete com viseira solar interna"
  },
  {
    id: "aberto",
    name: "Aberto",
    icon: "🪖",
    description: "Capacete aberto estilo jet"
  },
  {
    id: "off_road",
    name: "Off-Road",
    icon: "🏔️",
    description: "Capacete para trilha e motocross"
  }
];

const HelmetTypeFilter = ({ selectedTypes, onTypeChange, productCounts }: HelmetTypeFilterProps) => {
  const handleTypeToggle = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypeChange(selectedTypes.filter(t => t !== typeId));
    } else {
      onTypeChange([...selectedTypes, typeId]);
    }
  };

  const handleShowAll = () => {
    onTypeChange([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Compre por modelo:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {helmetTypes.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            const productCount = productCounts[type.id] || 0;
            
            return (
              <Button
                key={type.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 ${
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => handleTypeToggle(type.id)}
              >
                <div className="text-2xl">{type.icon}</div>
                <div className="text-center">
                  <div className="font-medium text-sm">{type.name}</div>
                  {productCount > 0 && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {productCount}
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
          
          {/* Botão Ver todos */}
          <Button
            variant={selectedTypes.length === 0 ? "default" : "outline"}
            className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 ${
              selectedTypes.length === 0 
                ? "bg-muted text-muted-foreground border-2 border-dashed" 
                : "bg-background hover:bg-muted"
            }`}
            onClick={handleShowAll}
          >
            <div className="text-2xl">➕</div>
            <div className="text-center">
              <div className="font-medium text-sm">Ver todos</div>
            </div>
          </Button>
        </div>
        
        {selectedTypes.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {selectedTypes.map((typeId) => {
                const type = helmetTypes.find(t => t.id === typeId);
                return (
                  <Badge key={typeId} variant="default" className="flex items-center gap-1">
                    <span>{type?.icon}</span>
                    <span>{type?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleTypeToggle(typeId)}
                    >
                      ×
                    </Button>
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar todos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HelmetTypeFilter;
