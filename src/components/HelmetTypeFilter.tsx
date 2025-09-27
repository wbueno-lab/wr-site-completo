import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HelmetType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface HelmetTypeFilterProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

// Imagens para cada tipo de capacete - usando as imagens enviadas pelo usuário
const helmetImages = {
  fechado: "/Capacete-Fechado.png",
  articulado: "/Capacete-Articulado.png", 
  viseira_solar: "/Capacete-Com-Viseira-Solar.png",
  aberto: "/Capacete-Aberto.png",
  off_road: "/Capacete-Off-Road.png"
};

// Componentes de imagens para cada tipo de capacete
const HelmetIcons = {
  Fechado: () => (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/5 flex items-center justify-center">
      <img 
        src={helmetImages.fechado}
        alt="Capacete Fechado"
        className="w-10 h-10 object-contain object-center"
        onError={(e) => {
          // Fallback para SVG se a imagem não carregar
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15C30 15 15 30 15 50C15 60 18 68 23 74H77C82 68 85 60 85 50C85 30 70 15 50 15Z" 
                stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1"/>
          <path d="M23 74L25 85H75L77 74" stroke="currentColor" strokeWidth="3" fill="none"/>
          <path d="M28 45L72 45C70 62 68 70 65 74H35C32 70 30 62 28 45Z" 
                stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.05"/>
        </svg>
      </div>
    </div>
  ),
  Articulado: () => (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/5 flex items-center justify-center">
      <img 
        src={helmetImages.articulado}
        alt="Capacete Articulado"
        className="w-10 h-10 object-contain object-center"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15C30 15 15 30 15 50C15 58 17 65 21 71H79C83 65 85 58 85 50C85 30 70 15 50 15Z" 
                stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1"/>
          <path d="M30 71C32 76 35 82 40 85H60C65 82 68 76 70 71" 
                stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="6,3"/>
          <circle cx="25" cy="68" r="2.5" fill="currentColor"/>
          <circle cx="75" cy="68" r="2.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  ),
  ViseiraSolar: () => (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/5 flex items-center justify-center">
      <img 
        src={helmetImages.viseira_solar}
        alt="Capacete com Viseira Solar"
        className="w-10 h-10 object-contain object-center"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15C30 15 15 30 15 50C15 60 18 68 23 74H77C82 68 85 60 85 50C85 30 70 15 50 15Z" 
                stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1"/>
          <path d="M32 50L68 50C67 58 66 62 65 65H35C34 62 33 58 32 50Z" 
                stroke="currentColor" strokeWidth="2" fill="#FFA500" fillOpacity="0.4"/>
          <circle cx="20" cy="25" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M17 20L23 20M20 17L20 23" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
    </div>
  ),
  Aberto: () => (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/5 flex items-center justify-center">
      <img 
        src={helmetImages.aberto}
        alt="Capacete Aberto"
        className="w-10 h-10 object-contain object-center"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15C30 15 15 30 15 50C15 58 17 65 21 70H79C83 65 85 58 85 50C85 30 70 15 50 15Z" 
                stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1"/>
          <path d="M21 70C23 75 27 78 33 80H67C73 78 77 75 79 70" 
                stroke="currentColor" strokeWidth="3" fill="none"/>
          <circle cx="38" cy="30" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="62" cy="30" r="2" fill="currentColor" opacity="0.6"/>
        </svg>
      </div>
    </div>
  ),
  OffRoad: () => (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/5 flex items-center justify-center">
      <img 
        src={helmetImages.off_road}
        alt="Capacete Off-Road"
        className="w-10 h-10 object-contain object-center"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15C30 15 15 30 15 50C15 60 18 68 23 74H77C82 68 85 60 85 50C85 30 70 15 50 15Z" 
                stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1"/>
          <path d="M32 25L50 35L68 25C65 20 61 17 55 15H45C39 17 35 20 32 25Z" 
                stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15"/>
          <ellipse cx="42" cy="50" rx="7" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/>
          <ellipse cx="58" cy="50" rx="7" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>
    </div>
  )
};

const helmetTypes: HelmetType[] = [
  {
    id: "fechado",
    name: "Fechado",
    icon: <HelmetIcons.Fechado />,
    description: "Capacete integral com proteção total"
  },
  {
    id: "articulado",
    name: "Articulado",
    icon: <HelmetIcons.Articulado />,
    description: "Capacete modular com queixeira móvel"
  },
  {
    id: "viseira_solar",
    name: "C/ Viseira Solar",
    icon: <HelmetIcons.ViseiraSolar />,
    description: "Capacete com viseira solar interna"
  },
  {
    id: "aberto",
    name: "Aberto",
    icon: <HelmetIcons.Aberto />,
    description: "Capacete aberto estilo jet"
  },
  {
    id: "off_road",
    name: "Off-Road",
    icon: <HelmetIcons.OffRoad />,
    description: "Capacete para trilha e motocross"
  }
];

const HelmetTypeFilter = ({ selectedTypes, onTypeChange }: HelmetTypeFilterProps) => {
  // Componente atualizado com novos ícones SVG
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
            
            return (
              <div key={`${type.id}-v2`} className="space-y-2">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 w-full ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "bg-background hover:bg-muted"
                  }`}
                  onClick={() => handleTypeToggle(type.id)}
                >
                  <div className="flex items-center justify-center">{type.icon}</div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{type.name}</div>
                  </div>
                </Button>
                
              </div>
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
            <div className="text-3xl">⊞</div>
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
                    <div className="w-4 h-4 flex items-center justify-center overflow-hidden rounded">
                      {type?.icon && (
                        <div className="scale-[0.3] origin-center">
                          {type.icon}
                        </div>
                      )}
                    </div>
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
