import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HelmetSizeFilterProps {
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
}

const helmetSizes = ["54", "56", "58", "60", "62", "64"];

const HelmetSizeFilter = ({ selectedSizes, onSizeChange }: HelmetSizeFilterProps) => {

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizeChange(selectedSizes.filter(s => s !== size));
    } else {
      onSizeChange([...selectedSizes, size]);
    }
  };

  const handleShowAll = () => {
    onSizeChange([]);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Compre por tamanho:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {helmetSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            
            return (
              <div key={size} className="space-y-2">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`h-16 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-105 w-full ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "bg-background hover:bg-muted"
                  }`}
                  onClick={() => handleSizeToggle(size)}
                >
                  <div className="font-bold text-lg">{size}</div>
                </Button>
                
              </div>
            );
          })}
          
          {/* Botão Ver todos */}
          <Button
            variant={selectedSizes.length === 0 ? "default" : "outline"}
            className={`h-16 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-105 ${
              selectedSizes.length === 0 
                ? "bg-muted text-muted-foreground border-2 border-dashed" 
                : "bg-background hover:bg-muted"
            }`}
            onClick={handleShowAll}
          >
            <div className="font-bold text-sm">Ver todos</div>
          </Button>
        </div>
        
        {selectedSizes.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Tamanhos selecionados:</span>
              {selectedSizes.map((size) => (
                <Badge key={size} variant="default" className="flex items-center gap-1">
                  <span>{size}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleSizeToggle(size)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
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

export default HelmetSizeFilter;
