import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, Search, Filter, X, Package, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Image, Info, Settings, Tag, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleImageUpload } from '@/components/SimpleImageUpload';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { ImageGalleryPreview } from '@/components/ImageGalleryPreview';
import ProductForm from './ProductForm';

interface ProductManagerProps {
  products: any[];
  categories: any[];
  brands: any[];
  toast: any;
}

const ProductManager = ({ products, categories, brands, toast }: ProductManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estados para validação e progresso
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formProgress, setFormProgress] = useState(0);
  const [openSections, setOpenSections] = useState({
    basic: true,
    images: true,
    details: false,
    specifications: false,
    settings: false
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    category_id: 'none',
    brand_id: 'none',
    is_promo: false,
    is_new: false,
    is_active: true,
    image_url: '',
    gallery_images: [] as string[],
    specifications: '',
    available_sizes: [] as number[],
    weight: '',
    material: '',
    helmet_type: 'full_face',
    helmet_numbers: [] as number[],
    color_options: [] as string[],
    warranty_period: '',
    country_of_origin: ''
  });

  // Filtrar produtos
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active) ||
                         (statusFilter === 'promo' && product.is_promo) ||
                         (statusFilter === 'new' && product.is_new) ||
                         (statusFilter === 'low_stock' && product.stock_quantity < 10);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Validação em tempo real
  const validateField = (field: string, value: any) => {
    const errors: Record<string, string> = { ...formErrors };
    
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) {
          errors.name = 'Nome deve ter pelo menos 3 caracteres';
        } else {
          delete errors.name;
        }
        break;
      case 'price':
        if (!value || parseFloat(value) <= 0) {
          errors.price = 'Preço deve ser maior que zero';
        } else {
          delete errors.price;
        }
        break;
      case 'category_id':
        if (!value || value === 'none') {
          errors.category_id = 'Categoria é obrigatória';
        } else {
          delete errors.category_id;
        }
        break;
      case 'stock_quantity':
        if (value && parseInt(value) < 0) {
          errors.stock_quantity = 'Estoque não pode ser negativo';
        } else {
          delete errors.stock_quantity;
        }
        break;
      case 'weight':
        if (value && parseFloat(value) < 0) {
          errors.weight = 'Peso não pode ser negativo';
        } else {
          delete errors.weight;
        }
        break;
      case 'warranty_period':
        if (value && parseInt(value) < 0) {
          errors.warranty_period = 'Garantia não pode ser negativa';
        } else {
          delete errors.warranty_period;
        }
        break;
    }
    
    setFormErrors(errors);
  };

  // Calcular progresso do formulário - memoizado
  const calculateFormProgress = useCallback(() => {
    const requiredFields = ['name', 'price', 'category_id'];
    const optionalFields = ['description', 'image_url', 'brand_id', 'stock_quantity', 'weight', 'material', 'helmet_type'];
    
    let completedRequired = 0;
    let completedOptional = 0;
    
    requiredFields.forEach(field => {
      if (productForm[field as keyof typeof productForm] && 
          productForm[field as keyof typeof productForm] !== 'none' &&
          productForm[field as keyof typeof productForm] !== '') {
        completedRequired++;
      }
    });
    
    optionalFields.forEach(field => {
      if (productForm[field as keyof typeof productForm] && 
          productForm[field as keyof typeof productForm] !== '') {
        completedOptional++;
      }
    });
    
    const requiredWeight = 0.7; // 70% para campos obrigatórios
    const optionalWeight = 0.3; // 30% para campos opcionais
    
    const requiredProgress = (completedRequired / requiredFields.length) * requiredWeight;
    const optionalProgress = (completedOptional / optionalFields.length) * optionalWeight;
    
    return Math.round((requiredProgress + optionalProgress) * 100);
  }, [productForm]);

  // Atualizar progresso quando o formulário muda - memoizado para evitar re-renderizações
  const memoizedProgress = useMemo(() => {
    return calculateFormProgress();
  }, [calculateFormProgress]);

  useEffect(() => {
    setFormProgress(memoizedProgress);
  }, [memoizedProgress]);

  // Handlers memoizados para evitar re-renderizações desnecessárias
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductForm(prev => ({ ...prev, name: value }));
    validateField('name', value);
  }, [validateField]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductForm(prev => ({ ...prev, price: value }));
    validateField('price', value);
  }, [validateField]);

  const handleCategoryChange = useCallback((value: string) => {
    setProductForm(prev => ({ ...prev, category_id: value }));
    validateField('category_id', value);
  }, [validateField]);

  const handleBrandChange = useCallback((value: string) => {
    setProductForm(prev => ({ ...prev, brand_id: value }));
  }, []);

  const handleStockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductForm(prev => ({ ...prev, stock_quantity: value }));
    validateField('stock_quantity', value);
  }, [validateField]);

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductForm(prev => ({ ...prev, weight: value }));
    validateField('weight', value);
  }, [validateField]);

  const handleWarrantyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductForm(prev => ({ ...prev, warranty_period: value }));
    validateField('warranty_period', value);
  }, [validateField]);

  // Handlers memoizados para Collapsible
  const handleBasicSectionToggle = useCallback((open: boolean) => {
    setOpenSections(prev => ({ ...prev, basic: open }));
  }, []);

  const handleImagesSectionToggle = useCallback((open: boolean) => {
    setOpenSections(prev => ({ ...prev, images: open }));
  }, []);

  const handleDetailsSectionToggle = useCallback((open: boolean) => {
    setOpenSections(prev => ({ ...prev, details: open }));
  }, []);

  const handleSpecificationsSectionToggle = useCallback((open: boolean) => {
    setOpenSections(prev => ({ ...prev, specifications: open }));
  }, []);

  const handleSettingsSectionToggle = useCallback((open: boolean) => {
    setOpenSections(prev => ({ ...prev, settings: open }));
  }, []);

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      original_price: '',
      stock_quantity: '',
      category_id: '',
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
      helmet_type: '',
      helmet_numbers: [],
      color_options: [],
      warranty_period: '',
      country_of_origin: ''
    });
    setFormErrors({});
    setFormProgress(0);
    setOpenSections({
      basic: true,
      images: true,
      details: false,
      specifications: false,
      settings: false
    });
  };

  const handleCreateProduct = async (formData: any) => {
    
    // Validar campos obrigatórios
    const requiredFields = ['name', 'price', 'category_id'];
    const errors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      validateField(field, productForm[field as keyof typeof productForm]);
    });
    
    // Verificar se há erros
    if (Object.keys(formErrors).length > 0) {
      toast({
        title: "Erro de Validação!",
        description: "Corrija os erros antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Erro!",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Erro!",
        description: "Preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category_id || formData.category_id === 'none') {
      toast({
        title: "Erro!",
        description: "Categoria é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gallery_images || formData.gallery_images.length === 0) {
      toast({
        title: "Aviso!",
        description: "Recomendamos adicionar pelo menos uma imagem para o produto.",
        variant: "destructive",
      });
      // Não bloqueia a criação, apenas avisa
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id,
          brand_id: formData.brand_id || null,
          is_promo: formData.is_promo,
          is_new: formData.is_new,
          is_active: formData.is_active,
          image_url: formData.gallery_images && formData.gallery_images.length > 0 ? formData.gallery_images[0] : null,
          gallery: formData.gallery_images.length > 0 ? formData.gallery_images : null,
          specifications: formData.specifications.trim() || null,
          available_sizes: formData.available_sizes.length > 0 ? formData.available_sizes : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          material: formData.material.trim() || null,
          helmet_type: formData.helmet_type.trim() || null,
          helmet_numbers: formData.helmet_numbers && formData.helmet_numbers.length > 0 ? formData.helmet_numbers : null,
          color_options: formData.color_options.length > 0 ? formData.color_options : null,
          warranty_period: formData.warranty_period ? parseInt(formData.warranty_period) : null,
          country_of_origin: formData.country_of_origin.trim() || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso!",
      });

      resetForm();
      setIsCreating(false);

    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro!",
        description: error.message || "Erro ao criar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price ? product.original_price.toString() : '',
      stock_quantity: product.stock_quantity?.toString() || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      is_promo: product.is_promo || false,
      is_new: product.is_new || false,
      is_active: product.is_active !== false,
      image_url: product.image_url || '',
      gallery_images: product.gallery || [],
      specifications: product.specifications || '',
      available_sizes: product.available_sizes || [],
      weight: product.weight?.toString() || '',
      material: product.material || '',
      helmet_type: product.helmet_type || '',
      helmet_numbers: product.helmet_numbers || [],
      color_options: product.color_options || [],
      warranty_period: product.warranty_period?.toString() || '',
      country_of_origin: product.country_of_origin || ''
    });
  };

  const handleUpdateProduct = async (formData: any) => {
    
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id,
          brand_id: formData.brand_id || null,
          is_promo: formData.is_promo,
          is_new: formData.is_new,
          is_active: formData.is_active,
          image_url: formData.gallery_images && formData.gallery_images.length > 0 ? formData.gallery_images[0] : null,
          gallery: formData.gallery_images.length > 0 ? formData.gallery_images : null,
          specifications: formData.specifications.trim() || null,
          available_sizes: formData.available_sizes.length > 0 ? formData.available_sizes : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          material: formData.material.trim() || null,
          helmet_type: formData.helmet_type.trim() || null,
          helmet_numbers: formData.helmet_numbers && formData.helmet_numbers.length > 0 ? formData.helmet_numbers : null,
          color_options: formData.color_options.length > 0 ? formData.color_options : null,
          warranty_period: formData.warranty_period ? parseInt(formData.warranty_period) : null,
          country_of_origin: formData.country_of_origin.trim() || null
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso!",
      });

      resetForm();
      setEditingProduct(null);

    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro!",
        description: error.message || "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso!",
      });

      setDeletingProduct(null);

    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro!",
        description: "Erro ao excluir produto. Tente novamente.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Gerenciamento de Produtos</h2>
          <p className="text-gray-400 mt-2">Gerencie seu catálogo de capacetes</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-2">
            {filteredProducts.length} Produtos
          </Badge>
          
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-brand-green to-brand-green-dark hover:from-brand-green-dark hover:to-brand-green text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[98vh] overflow-y-auto bg-brand-dark-light border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-brand-green" />
                  Criar Novo Produto
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Preencha as informações abaixo para adicionar um novo produto ao seu catálogo
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                categories={categories || []}
                brands={brands || []}
                onSubmit={handleCreateProduct}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Filtros */}
      <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-600 bg-brand-dark-lighter text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-gray-600 bg-brand-dark-lighter text-white">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-600 bg-brand-dark-lighter text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="promo">Promoção</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-brand-dark-light shadow-xl border-0 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-400">Comece criando seu primeiro produto ou ajuste os filtros.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="bg-brand-dark-light shadow-xl border-0 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="relative group">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Overlay com informações de imagens */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <span>Imagem principal</span>
                    {product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-brand-green">+{product.gallery.length}</span>
                        <span>na galeria</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.is_promo && (
                    <Badge className="bg-red-500/90 text-white">Promoção</Badge>
                  )}
                  {product.is_new && (
                    <Badge className="bg-green-500/90 text-white">Novo</Badge>
                  )}
                  {!product.is_active && (
                    <Badge className="bg-gray-500/90 text-white">Inativo</Badge>
                  )}
                  {product.stock_quantity < 10 && (
                    <Badge className="bg-orange-500/90 text-white">Estoque Baixo</Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-400">
                      {categories?.find(c => c.id === product.category_id)?.name || 'Sem categoria'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-brand-green">{formatPrice(product.price)}</p>
                      {product.original_price && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(product.original_price)}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Estoque: {product.stock_quantity || 0}
                    </p>
                  </div>

                  {product.available_sizes && product.available_sizes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tamanhos:</p>
                      <div className="flex gap-1 flex-wrap">
                        {product.available_sizes.slice(0, 4).map((size: number) => (
                          <span key={size} className="text-xs bg-brand-green/20 text-brand-green px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                        {product.available_sizes.length > 4 && (
                          <span className="text-xs text-gray-400">+{product.available_sizes.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {product.helmet_numbers && product.helmet_numbers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Numerações:</p>
                      <div className="flex gap-1 flex-wrap">
                        {product.helmet_numbers.slice(0, 6).map((number: number) => (
                          <span key={number} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-medium">
                            #{number}
                          </span>
                        ))}
                        {product.helmet_numbers.length > 6 && (
                          <span className="text-xs text-gray-400">+{product.helmet_numbers.length - 6}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {product.specifications && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Especificações:</p>
                      <div className="text-xs text-gray-300 bg-gray-700/30 px-2 py-1 rounded max-h-16 overflow-hidden">
                        {product.specifications.length > 100 
                          ? `${product.specifications.substring(0, 100)}...` 
                          : product.specifications
                        }
                      </div>
                    </div>
                  )}

                  {/* Preview da Galeria */}
                  {product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Galeria de Imagens:</p>
                        <span className="text-xs text-brand-green font-medium">
                          {product.gallery.length}/8 imagens
                        </span>
                      </div>
                      <ImageGalleryPreview 
                        images={product.gallery} 
                        productName={product.name}
                        maxPreview={4}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 border-brand-green/50 text-brand-green hover:bg-brand-green/10"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingProduct(product)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-7xl max-h-[98vh] overflow-y-auto bg-brand-dark-light border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-green" />
                Editar Produto
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Atualize as informações do produto "{editingProduct?.name}"
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              categories={categories || []}
              brands={brands || []}
              initialData={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                resetForm();
                setEditingProduct(null);
              }}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Exclusão */}
      {deletingProduct && (
        <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
          <DialogContent className="bg-brand-dark-light border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tem certeza que deseja excluir o produto <strong>"{deletingProduct.name}"</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteProduct}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductManager;
