import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Home,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShippingAddressData {
  fullName: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ShippingAddressFormProps {
  onSubmit: (addressData: ShippingAddressData) => void;
  initialData?: ShippingAddressData | null;
  isLoading?: boolean;
}

const ShippingAddressForm = ({ 
  onSubmit, 
  initialData,
  isLoading = false 
}: ShippingAddressFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ShippingAddressData>(
    initialData || {
      fullName: '',
      email: '',
      phone: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state) {
      newErrors.state = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formatar CEP
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Buscar CEP
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MapPin className="h-5 w-5 text-brand-green" />
          Endereço de Entrega
        </CardTitle>
        <p className="text-sm text-gray-300">
          Informe os dados para entrega do seu pedido
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-white">
              <User className="h-4 w-4 text-white" />
              Dados Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white font-medium">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={errors.fullName ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="Seu nome completo"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white font-medium">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                  className={errors.phone ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2 text-white">
              <Home className="h-4 w-4 text-white" />
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-white font-medium">CEP *</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData(prev => ({ ...prev, cep: formatCep(e.target.value) }))}
                  onBlur={handleCepBlur}
                  className={errors.cep ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {errors.cep && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cep}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street" className="text-white font-medium">Rua *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  className={errors.street ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="Nome da rua"
                />
                {errors.street && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.street}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number" className="text-white font-medium">Número *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  className={errors.number ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="123"
                />
                {errors.number && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.number}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement" className="text-white font-medium">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                  className="text-white bg-gray-800"
                  placeholder="Apto, casa, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-white font-medium">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  className={errors.neighborhood ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="Nome do bairro"
                />
                {errors.neighborhood && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.neighborhood}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white font-medium">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={errors.city ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}
                  placeholder="Nome da cidade"
                />
                {errors.city && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-white font-medium">Estado *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500 text-white bg-gray-800' : 'text-white bg-gray-800'}>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.state}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Continuar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;

