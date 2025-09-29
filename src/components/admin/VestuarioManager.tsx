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
import { Plus, Search, Edit, Trash2, Package, Shirt, Star, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface VestuarioManagerProps {
  products: any[];
  categories: any[];
  brands: any[];
  toast: any;
}

const VestuarioManager = ({ products, categories, brands, toast }: VestuarioManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Encontrar a categoria de vestuário
  const vestuarioCategory = categories?.find(cat => cat.slug === 'vestuario');
  
  // Filtrar apenas produtos de vestuário
  const vestuarioProducts = products?.filter(product => 
    product.category_id === vestuarioCategory?.id &&
    (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || 
     (statusFilter === 'active' && product.is_active) ||
     (statusFilter === 'inactive' && !product.is_active))
  ) || [];

  // Filtrar marcas que fazem vestuário/jaquetas
  const vestuarioBrands = brands?.filter(brand => 
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
    clothing_type: 'calca',
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
      clothing_type: 'calca',
      protection_level: '',
      color_options: [],
      warranty_period: '',
      country_of_origin: ''
    });
  };

  const handleCreateProduct = async () => {
    if (!vestuarioCategory) {
      toast({
        title: "Erro",
        description: "Categoria de vestuário não encontrada.",
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

    // Validar tamanho dos campos para evitar erro de VARCHAR(500)
    const fieldsToValidate = [
      { field: 'material', value: productForm.material, name: 'Material' },
      { field: 'protection_level', value: productForm.protection_level, name: 'Nível de Proteção' },
      { field: 'country_of_origin', value: productForm.country_of_origin, name: 'País de Origem' }
    ];

    for (const { field, value, name } of fieldsToValidate) {
      if (value && value.length > 500) {
        toast({
          title: "Erro",
          description: `${name} deve ter no máximo 500 caracteres. Atual: ${value.length}`,
          variant: "destructive",
        });
        return;
      }
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
          category_id: vestuarioCategory.id,
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
          clothing_type: productForm.clothing_type.trim() || null,
          protection_level: productForm.protection_level.trim() || null,
          color_options: productForm.color_options.length > 0 ? productForm.color_options : null,
          warranty_period: productForm.warranty_period ? parseInt(productForm.warranty_period) : null,
          country_of_origin: productForm.country_of_origin.trim() || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item de vestuário criado com sucesso!",
      });

      resetForm();
      setIsCreating(false);

    } catch (error: any) {
      console.error('Erro ao criar item de vestuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar item de vestuário",
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
        description: "Item de vestuário excluído com sucesso!",
      });

    } catch (error: any) {
      console.error('Erro ao excluir item de vestuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir item de vestuário",
        variant: "destructive",
      });
    }
  };

  if (!vestuarioCategory) {
    return (
      <Card className="bg-brand-dark-light border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Vestuário</CardTitle>
          <CardDescription className="text-gray-400">
            Categoria de vestuário não encontrada. Verifique se a categoria foi criada no banco de dados.
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
                <Shirt className="h-5 w-5 text-brand-green" />
                Gerenciar Vestuário
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie o catálogo de vestuário e equipamentos de proteção
              </CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="bg-brand-green hover:bg-brand-green-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-brand-dark-light border-gray-700 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Novo Item de Vestuário</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Preencha os dados do novo item de vestuário
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
                        placeholder="Nome do item"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vestuario_brand_select" className="text-white">Marca</Label>
                      <Select value={productForm.brand_id} onValueChange={(value) => setProductForm({...productForm, brand_id: value})}>
                        <SelectTrigger id="vestuario_brand_select" className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {vestuarioBrands?.map((brand) => (
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
                      placeholder="Descrição do item"
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

                  {/* Características específicas do vestuário */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clothing_type_select" className="text-white">Tipo de Vestuário</Label>
                      <Select value={productForm.clothing_type} onValueChange={(value) => setProductForm({...productForm, clothing_type: value})}>
                        <SelectTrigger id="clothing_type_select" className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="calca" className="text-white">Calça</SelectItem>
                          <SelectItem value="camiseta" className="text-white">Camiseta</SelectItem>
                          <SelectItem value="luvas" className="text-white">Luvas</SelectItem>
                          <SelectItem value="botas" className="text-white">Botas</SelectItem>
                          <SelectItem value="colete" className="text-white">Colete</SelectItem>
                          <SelectItem value="protetor" className="text-white">Protetor</SelectItem>
                          <SelectItem value="acessorio" className="text-white">Acessório</SelectItem>
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
                        placeholder="Ex: Couro, Kevlar, Cordura"
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
                      placeholder="Ex: CE Nível 1, CE Nível 2, Básica"
                    />
                  </div>

                  {/* Tamanhos Disponíveis */}
                  <div>
                    <Label htmlFor="sizes_section" className="text-white">Tamanhos Disponíveis</Label>
                    <div id="sizes_section" className="flex flex-wrap gap-2 mt-2" role="group" aria-labelledby="sizes_section">
                      {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', '36', '38', '40', '42', '44', '46'].map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={productForm.available_sizes.includes(size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const sizes = productForm.available_sizes.includes(size)
                              ? productForm.available_sizes.filter(s => s !== size)
                              : [...productForm.available_sizes, size];
                            setProductForm({...productForm, available_sizes: sizes});
                          }}
                          className={productForm.available_sizes.includes(size) ? "bg-brand-green" : ""}
                          aria-pressed={productForm.available_sizes.includes(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
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
                      Criar Item
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
                  placeholder="Buscar itens de vestuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white" id="vestuario_status_filter">
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

      {/* Lista de Itens de Vestuário */}
      <div className="grid gap-4">
        {vestuarioProducts.length === 0 ? (
          <Card className="bg-brand-dark-light border-gray-700">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum item encontrado com os filtros aplicados.' 
                  : 'Nenhum item de vestuário cadastrado ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          vestuarioProducts.map((product) => (
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
                        {product.clothing_type && (
                          <Badge variant="outline" className="text-gray-300">
                            {product.clothing_type}
                          </Badge>
                        )}
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

export default VestuarioManager;
