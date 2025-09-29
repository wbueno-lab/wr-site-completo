import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Edit, ChevronDown, ChevronRight, Tag, Image, Truck, Settings } from 'lucide-react';
import { MultiImageUpload } from '@/components/MultiImageUpload';

interface ProductFormProps {
  categories: any[];
  brands: any[];
  onSubmit: (data: any) => void;
  isEdit?: boolean;
  initialData?: any;
  onCancel?: () => void;
}

const ProductForm = ({ categories, brands, onSubmit, isEdit = false, initialData, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    original_price: initialData?.original_price?.toString() || '',
    stock_quantity: initialData?.stock_quantity?.toString() || '',
    category_id: initialData?.category_id || '',
    brand_id: initialData?.brand_id || '',
    is_promo: initialData?.is_promo || false,
    is_new: initialData?.is_new || false,
    is_active: initialData?.is_active !== false,
    image_url: initialData?.image_url || '',
    gallery_images: initialData?.gallery || [],
    specifications: initialData?.specifications || '',
    available_sizes: initialData?.available_sizes || [],
    weight: initialData?.weight?.toString() || '',
    material: initialData?.material || '',
    helmet_type: initialData?.helmet_type || 'fechado',
    helmet_numbers: initialData?.helmet_numbers || [],
    color_options: initialData?.color_options || [],
    warranty_period: initialData?.warranty_period?.toString() || '',
    country_of_origin: initialData?.country_of_origin || ''
  });

  const [openSections, setOpenSections] = useState({
    basic: true,
    images: true,
    details: false,
    specifications: false,
    settings: false
  });

  // Handlers estáveis
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handler para gerenciar numerações e tamanhos de capacetes
  const handleSizeChange = useCallback((value: string) => {
    // Agora available_sizes é string[], então trabalhar diretamente com strings
    setFormData(prev => ({
      ...prev,
      available_sizes: prev.available_sizes.includes(value)
        ? prev.available_sizes.filter(s => s !== value)
        : [...prev.available_sizes, value].sort((a, b) => {
          // Ordenar numericamente mesmo sendo strings
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          return numA - numB;
        })
    }));
  }, []);

  const handleHelmetNumberChange = useCallback((number: number, checked: boolean) => {
    setFormData(prev => {
      const currentNumbers = prev.helmet_numbers || [];
      if (checked) {
        return {
          ...prev,
          helmet_numbers: [...currentNumbers, number].sort((a, b) => a - b)
        };
      } else {
        return {
          ...prev,
          helmet_numbers: currentNumbers.filter(n => n !== number)
        };
      }
    });
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Handlers para upload de imagens
  const handleGalleryImagesUpload = useCallback((images: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      gallery_images: images,
      // A primeira imagem da galeria será usada como imagem principal
      image_url: images.length > 0 ? images[0] : ''
    }));
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
        <Collapsible 
          open={openSections.basic} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, basic: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-brand-dark-lighter hover:bg-brand-dark-lighter/80 border border-gray-600 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-brand-green" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
                  <p className="text-sm text-gray-400">Nome, categoria, preço e descrição</p>
                </div>
              </div>
              {openSections.basic ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-white">
                  Nome do Produto *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  autoComplete="off"
                  className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                  placeholder="Digite o nome do produto"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category_id" className="text-sm font-semibold text-white">
                  Categoria *
                </Label>
                <Select 
                  value={formData.category_id || ""} 
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger id="category_id" className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="brand_id" className="text-sm font-semibold text-white">Marca</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.brand_id || ""} 
                    onValueChange={(value) => handleInputChange('brand_id', value)}
                  >
                    <SelectTrigger id="brand_id" className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white flex-1">
                      <SelectValue placeholder="Selecione uma marca (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands?.filter(brand => brand.name.toUpperCase() !== 'AXXIS').map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.brand_id && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('brand_id', '')}
                      className="h-12 px-3 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>

              {/* Tipo de Capacete */}
              <div className="space-y-2">
                <Label htmlFor="helmet_type" className="text-sm font-semibold text-white">
                  Tipo de Capacete *
                </Label>
                <Select 
                  value={formData.helmet_type || ""} 
                  onValueChange={(value) => handleInputChange('helmet_type', value)}
                >
                  <SelectTrigger id="helmet_type" className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white">
                    <SelectValue placeholder="Selecione o tipo de capacete" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fechado">
                      <div className="flex items-center gap-2">
                        <span>🏍️</span>
                        <span>Fechado</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="articulado">
                      <div className="flex items-center gap-2">
                        <span>🔄</span>
                        <span>Articulado</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="viseira_solar">
                      <div className="flex items-center gap-2">
                        <span>🕶️</span>
                        <span>C/ Viseira Solar</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="aberto">
                      <div className="flex items-center gap-2">
                        <span>🪖</span>
                        <span>Aberto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="off_road">
                      <div className="flex items-center gap-2">
                        <span>🏔️</span>
                        <span>Off-Road</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Selecione o tipo/modelo do capacete</p>
              </div>

              {/* Preço */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-white">
                  Preço *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                  autoComplete="off"
                  className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                  placeholder="0.00"
                />
              </div>

              {/* Estoque */}
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold text-white">
                  Estoque
                </Label>
                <Input
                  id="stock"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  autoComplete="off"
                  className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                  placeholder="0"
                />
              </div>

              {/* Preço Original */}
              <div className="space-y-2">
                <Label htmlFor="original_price" className="text-sm font-semibold text-white">Preço Original</Label>
                <Input
                  id="original_price"
                  name="original_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  autoComplete="off"
                  className="h-12 border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-400">Para produtos em promoção</p>
              </div>

              {/* Checkboxes de Status */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_promo"
                      checked={formData.is_promo}
                      onCheckedChange={(checked) => handleInputChange('is_promo', checked)}
                      className="border-gray-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <Label 
                      htmlFor="is_promo" 
                      className="text-sm font-medium text-white cursor-pointer select-none"
                    >
                      Produto em Promoção
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_new"
                      checked={formData.is_new}
                      onCheckedChange={(checked) => handleInputChange('is_new', checked)}
                      className="border-gray-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <Label 
                      htmlFor="is_new" 
                      className="text-sm font-medium text-white cursor-pointer select-none"
                    >
                      Produto Novo
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Marque se o produto está em promoção ou é um lançamento
                </p>
              </div>

              {/* Numeração do Capacete */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-white">
                  Numeração do Capacete
                </Label>
                <div className="bg-brand-dark-lighter border-2 border-gray-600 rounded-xl p-4">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {[53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64].map((number) => (
                      <div key={number} className="flex items-center space-x-2">
                        <Checkbox
                          id={`helmet-${number}`}
                          checked={formData.helmet_numbers?.includes(number) || false}
                          onCheckedChange={(checked) => handleHelmetNumberChange(number, checked as boolean)}
                          className="border-gray-400 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green"
                        />
                        <Label 
                          htmlFor={`helmet-${number}`} 
                          className="text-sm text-gray-300 cursor-pointer select-none"
                        >
                          {number}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.helmet_numbers && formData.helmet_numbers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Selecionadas: {formData.helmet_numbers.length} numeração(ões)
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('helmet_numbers', [])}
                          className="h-8 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Limpar Todas
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">Marque as numerações disponíveis para este capacete</p>
              </div>

              {/* Tamanhos Disponíveis */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold text-white">
                  Tamanhos Disponíveis
                </Label>
                <div className="bg-brand-dark-lighter border-2 border-gray-600 rounded-xl p-4">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {[54, 56, 58, 60, 62, 64].map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={formData.available_sizes.includes(size) ? "default" : "outline"}
                        className={`w-full ${
                          formData.available_sizes.includes(size)
                            ? "bg-brand-green hover:bg-brand-green-dark"
                            : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                        onClick={() => handleSizeChange(size.toString())}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  {formData.available_sizes && formData.available_sizes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Selecionados: {formData.available_sizes.length} tamanho(s)
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('available_sizes', [])}
                          className="h-8 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Limpar Todos
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">Selecione os tamanhos disponíveis para este capacete</p>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-white">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                autoComplete="off"
                className="min-h-[100px] border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                placeholder="Descreva o produto..."
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Seção 2: Upload de Imagens */}
        <Collapsible 
          open={openSections.images} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, images: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-brand-dark-lighter hover:bg-brand-dark-lighter/80 border border-gray-600 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-brand-green" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Galeria de Imagens</h3>
                  <p className="text-sm text-gray-400">A primeira imagem será usada como destaque do produto</p>
                </div>
              </div>
              {openSections.images ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            {/* Upload da Galeria de Imagens */}
            <div className="space-y-4">
              <MultiImageUpload
                onImagesUploaded={handleGalleryImagesUpload}
                currentImages={formData.gallery_images}
                maxImages={8}
                showProgress={true}
                enableDragDrop={true}
              />
            </div>

            {/* Informações sobre as imagens */}
            <div className="bg-brand-dark-lighter/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-brand-green mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Dicas para as Imagens</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• <strong>Imagem Principal:</strong> A primeira imagem será usada como destaque do produto</li>
                    <li>• <strong>Galeria:</strong> Até 8 imagens para mostrar diferentes ângulos do produto</li>
                    <li>• <strong>Formato:</strong> JPG, PNG ou WebP com máximo 5MB cada</li>
                    <li>• <strong>Recomendação:</strong> Use imagens de alta qualidade e boa iluminação</li>
                    <li>• <strong>Importante:</strong> Adicione pelo menos uma imagem para o produto</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Seção 3: Especificações Técnicas */}
        <Collapsible 
          open={openSections.specifications} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, specifications: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-brand-dark-lighter hover:bg-brand-dark-lighter/80 border border-gray-600 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-brand-green" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Especificações Técnicas</h3>
                  <p className="text-sm text-gray-400">Detalhes técnicos e características do produto</p>
                </div>
              </div>
              {openSections.specifications ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            {/* Especificações Técnicas */}
            <div className="space-y-2">
              <Label htmlFor="specifications" className="text-sm font-semibold text-white">
                Especificações Técnicas
              </Label>
              <Textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={(e) => handleInputChange('specifications', e.target.value)}
                autoComplete="off"
                className="min-h-[120px] border-2 border-gray-600 focus:border-brand-green rounded-xl bg-brand-dark-lighter text-white"
                placeholder="Digite as especificações técnicas do produto...

Exemplo:
• Material: Fibra de carbono
• Peso: 1.2kg
• Certificação: DOT, ECE 22.05
• Tamanhos disponíveis: 53-64
• Cor: Preto, Branco, Vermelho
• Garantia: 2 anos"
              />
              <p className="text-xs text-gray-400">
                Descreva as características técnicas, materiais, certificações e outras especificações importantes do produto.
              </p>
            </div>

            {/* Informações sobre especificações */}
            <div className="bg-brand-dark-lighter/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-brand-green mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Dicas para Especificações</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• <strong>Material:</strong> Fibra de carbono, policarbonato, etc.</li>
                    <li>• <strong>Peso:</strong> Peso do produto em kg</li>
                    <li>• <strong>Certificações:</strong> DOT, ECE, SNELL, etc.</li>
                    <li>• <strong>Tamanhos:</strong> Faixa de numeração disponível</li>
                    <li>• <strong>Cores:</strong> Opções de cores disponíveis</li>
                    <li>• <strong>Garantia:</strong> Período de garantia oferecido</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-6 border-t border-gray-600">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-brand-green to-brand-green-dark hover:from-brand-green-dark hover:to-brand-green text-white font-semibold py-3 rounded-xl"
          >
            {isEdit ? (
              <>
                <Edit className="h-5 w-5 mr-2" />
                Atualizar Produto
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Criar Produto
              </>
            )}
          </Button>
          
          {isEdit && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
