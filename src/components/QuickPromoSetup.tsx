import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Zap } from 'lucide-react';

const QuickPromoSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const promoProducts = [
    {
      name: 'Capacete WR Pro Max - Promoção Especial',
      description: 'Capacete premium com tecnologia avançada de proteção. Material de alta qualidade e design moderno.',
      price: 299.90,
      original_price: 399.90,
      stock_quantity: 15,
      is_new: false,
      is_promo: true,
      image_url: '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
    },
    {
      name: 'Capacete WR Sport - Oferta Limitada',
      description: 'Capacete esportivo com ventilação otimizada e sistema de retenção ajustável.',
      price: 199.90,
      original_price: 279.90,
      stock_quantity: 20,
      is_new: false,
      is_promo: true,
      image_url: '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
    },
    {
      name: 'Capacete WR Classic - Desconto Especial',
      description: 'Capacete clássico com proteção confiável e conforto excepcional.',
      price: 149.90,
      original_price: 199.90,
      stock_quantity: 25,
      is_new: false,
      is_promo: true,
      image_url: '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'
    }
  ];

  const addPromoProducts = async () => {
    setIsLoading(true);
    
    try {
      // Primeiro, buscar uma categoria existente
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

      if (catError) throw catError;
      if (!categories || categories.length === 0) {
        throw new Error('Nenhuma categoria encontrada');
      }

      const categoryId = categories[0].id;

      // Adicionar produtos promocionais
      const productsToInsert = promoProducts.map(product => ({
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        stock_quantity: product.stock_quantity,
        is_new: product.is_new,
        is_promo: product.is_promo,
        image_url: product.image_url,
        category_id: categoryId,
        is_active: true,
        sku: `WR-PROMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      toast({
        title: "Produtos promocionais adicionados!",
        description: `${promoProducts.length} produtos promocionais foram criados com sucesso.`
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Zap className="h-5 w-5" />
          Configuração Rápida de Promoções
        </CardTitle>
        <CardDescription>
          Adicione produtos promocionais rapidamente para testar a página de promoções
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoProducts.map((product, index) => (
              <div key={index} className="p-4 bg-card/50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-red-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    R$ {product.original_price?.toFixed(2)}
                  </span>
                  <Badge className="bg-red-500 text-white text-xs">
                    -{Math.round(((product.original_price! - product.price) / product.original_price!) * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{product.description}</p>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={addPromoProducts}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? 'Adicionando...' : 'Adicionar Produtos Promocionais'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickPromoSetup;
