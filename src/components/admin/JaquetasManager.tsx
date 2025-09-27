import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Edit, Trash2, Package, ShieldCheck, Star, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface JaquetasManagerProps {
  products: any[];
  categories: any[];
  brands: any[];
  toast: any;
}

const JaquetasManager = ({ products, categories, brands, toast }: JaquetasManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Encontrar a categoria de jaquetas
  const jaquetasCategory = categories?.find(cat => cat.slug === 'jaquetas');
  
  // Filtrar apenas produtos de jaquetas
  const jaquetasProducts = products?.filter(product => 
    product.category_id === jaquetasCategory?.id &&
    (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || 
     (statusFilter === 'active' && product.is_active) ||
     (statusFilter === 'inactive' && !product.is_active))
  ) || [];

  // Filtrar marcas que fazem jaquetas
  const jacketBrands = brands?.filter(brand => 
    brand.product_types?.includes('jaquetas') || 
    // Fallback para marcas antigas sem product_types definido
    ['Alpinestars', 'Texx', 'X11', 'Norisk'].includes(brand.name)
  ) || [];

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    brand_id: '',
    is_promo: false,
    is_new: false,
    is_active: true,
    image_url: '',
    gallery_images: [] as string[],
    specifications: '',
    available_sizes: [] as string[],
    weight: '',
    material: '',
    jacket_type: 'textil',
    protection_level: '',
    color_options: [] as string[],
    warranty_period: '',
    country_of_origin: ''
  });

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      brand_id: '',
      is_promo: false,
      is_new: false,
      is_active: true,
      image_url: '',
      gallery_images: [],
      specifications: '',
      available_sizes: [],
      weight: '',
      material: '',
      jacket_type: 'textil',
      protection_level: '',
      color_options: [],
      warranty_period: '',
      country_of_origin: ''
    });
  };

  const handleCreateProduct = async () => {
    if (!jaquetasCategory) {
      toast({
        title: "Erro",
        description: "Categoria de jaquetas não encontrada.",
        variant: "destructive",
      });
      return;
    }

    if (!productForm.name || !productForm.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productForm.name.trim(),
          description: productForm.description.trim() || null,
          price: parseFloat(productForm.price),
          original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
          category_id: jaquetasCategory.id,
          brand_id: productForm.brand_id || null,
          is_promo: productForm.is_promo,
          is_new: productForm.is_new,
          is_active: productForm.is_active,
          image_url: productForm.gallery_images && productForm.gallery_images.length > 0 ? productForm.gallery_images[0] : null,
          gallery: productForm.gallery_images.length > 0 ? productForm.gallery_images : null,
          specifications: productForm.specifications.trim() || null,
          available_sizes: productForm.available_sizes.length > 0 ? productForm.available_sizes : null,
          weight: productForm.weight ? parseFloat(productForm.weight) : null,
          material: productForm.material.trim() || null,
          jacket_type: productForm.jacket_type.trim() || null,
          protection_level: productForm.protection_level.trim() || null,
          color_options: productForm.color_options.length > 0 ? productForm.color_options : null,
          warranty_period: productForm.warranty_period ? parseInt(productForm.warranty_period) : null,
          country_of_origin: productForm.country_of_origin.trim() || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Jaqueta criada com sucesso!",
      });

      resetForm();
      setIsCreating(false);

    } catch (error: any) {
      console.error('Erro ao criar jaqueta:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar jaqueta",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Jaqueta excluída com sucesso!",
      });

    } catch (error: any) {
      console.error('Erro ao excluir jaqueta:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir jaqueta",
        variant: "destructive",
      });
    }
  };

  if (!jaquetasCategory) {
    return (
      <Card className="bg-brand-dark-light border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Jaquetas</CardTitle>
          <CardDescription className="text-gray-400">
            Categoria de jaquetas não encontrada. Verifique se a categoria foi criada no banco de dados.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-brand-dark-light border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-green" />
                Gerenciar Jaquetas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie o catálogo de jaquetas de motociclista
              </CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="bg-brand-green hover:bg-brand-green-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Jaqueta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-brand-dark-light border-gray-700 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Nova Jaqueta</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Preencha os dados da nova jaqueta
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nome *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Nome da jaqueta"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand_select" className="text-white">Marca</Label>
                      <Select value={productForm.brand_id} onValueChange={(value) => setProductForm({...productForm, brand_id: value})}>
                        <SelectTrigger id="brand_select" className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {jacketBrands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id} className="text-white">
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Descrição da jaqueta"
                      rows={3}
                    />
                  </div>

                  {/* Preços e Estoque */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-white">Preço *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="original_price" className="text-white">Preço Original</Label>
                      <Input
                        id="original_price"
                        name="original_price"
                        type="number"
                        step="0.01"
                        value={productForm.original_price}
                        onChange={(e) => setProductForm({...productForm, original_price: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-white">Estoque</Label>
                      <Input
                        id="stock"
                        name="stock_quantity"
                        type="number"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Características específicas da jaqueta */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jacket_type_select" className="text-white">Tipo de Jaqueta</Label>
                      <Select value={productForm.jacket_type} onValueChange={(value) => setProductForm({...productForm, jacket_type: value})}>
                        <SelectTrigger id="jacket_type_select" className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="textil" className="text-white">Têxtil</SelectItem>
                          <SelectItem value="couro" className="text-white">Couro</SelectItem>
                          <SelectItem value="mesh" className="text-white">Mesh</SelectItem>
                          <SelectItem value="impermeavel" className="text-white">Impermeável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="material" className="text-white">Material</Label>
                      <Input
                        id="material"
                        name="material"
                        value={productForm.material}
                        onChange={(e) => setProductForm({...productForm, material: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Ex: Couro bovino, Cordura"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="protection_level" className="text-white">Nível de Proteção</Label>
                    <Input
                      id="protection_level"
                      name="protection_level"
                      value={productForm.protection_level}
                      onChange={(e) => setProductForm({...productForm, protection_level: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Ex: CE Nível 1, CE Nível 2"
                    />
                  </div>

                  {/* Configurações */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_new"
                        checked={productForm.is_new}
                        onCheckedChange={(checked) => setProductForm({...productForm, is_new: checked})}
                      />
                      <Label htmlFor="is_new" className="text-white">Novo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_promo"
                        checked={productForm.is_promo}
                        onCheckedChange={(checked) => setProductForm({...productForm, is_promo: checked})}
                      />
                      <Label htmlFor="is_promo" className="text-white">Promoção</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={productForm.is_active}
                        onCheckedChange={(checked) => setProductForm({...productForm, is_active: checked})}
                      />
                      <Label htmlFor="is_active" className="text-white">Ativo</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateProduct} className="bg-brand-green hover:bg-brand-green-dark">
                      Criar Jaqueta
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card className="bg-brand-dark-light border-gray-700">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar jaquetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white" id="status_filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white">Todos os status</SelectItem>
                <SelectItem value="active" className="text-white">Ativo</SelectItem>
                <SelectItem value="inactive" className="text-white">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Jaquetas */}
      <div className="grid gap-4">
        {jaquetasProducts.length === 0 ? (
          <Card className="bg-brand-dark-light border-gray-700">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma jaqueta encontrada com os filtros aplicados.' 
                  : 'Nenhuma jaqueta cadastrada ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          jaquetasProducts.map((product) => (
            <Card key={product.id} className="bg-brand-dark-light border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-white font-semibold">{product.name}</h3>
                      <p className="text-gray-400 text-sm">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {product.is_new && <Badge className="bg-green-600">Novo</Badge>}
                        {product.is_promo && <Badge className="bg-red-600">Promoção</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">R$ {product.price}</p>
                    {product.original_price && (
                      <p className="text-gray-400 line-through text-sm">R$ {product.original_price}</p>
                    )}
                    <p className="text-gray-400 text-sm">Estoque: {product.stock_quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JaquetasManager;
