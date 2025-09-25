import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  requiresOnline: boolean;
  processingFeePercentage: number;
  minAmount: number;
  maxAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Formas de pagamento padrão caso não existam no banco
  const defaultPaymentMethods: PaymentMethod[] = [
    {
      id: 'default-credit-card',
      name: 'Cartão de Crédito',
      description: 'Pague com cartão de crédito Visa, Mastercard, Elo',
      icon: 'credit-card',
      isActive: true,
      requiresOnline: true,
      processingFeePercentage: 3.50,
      minAmount: 10.00,
      maxAmount: 5000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-debit-card',
      name: 'Cartão de Débito',
      description: 'Pague com cartão de débito Visa, Mastercard, Elo',
      icon: 'debit-card',
      isActive: true,
      requiresOnline: true,
      processingFeePercentage: 2.50,
      minAmount: 10.00,
      maxAmount: 3000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-pix',
      name: 'PIX',
      description: 'Pague instantaneamente com PIX',
      icon: 'smartphone',
      isActive: true,
      requiresOnline: true,
      processingFeePercentage: 0.00,
      minAmount: 1.00,
      maxAmount: 10000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-boleto',
      name: 'Boleto Bancário',
      description: 'Pague com boleto bancário',
      icon: 'file-text',
      isActive: true,
      requiresOnline: false,
      processingFeePercentage: 0.00,
      minAmount: 10.00,
      maxAmount: 5000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-transfer',
      name: 'Transferência Bancária',
      description: 'Pague via transferência bancária',
      icon: 'bank',
      isActive: true,
      requiresOnline: false,
      processingFeePercentage: 0.00,
      minAmount: 50.00,
      maxAmount: 10000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-cash',
      name: 'Dinheiro',
      description: 'Pague em dinheiro na entrega',
      icon: 'dollar-sign',
      isActive: true,
      requiresOnline: false,
      processingFeePercentage: 0.00,
      minAmount: 1.00,
      maxAmount: 2000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'default-card-delivery',
      name: 'Cartão na Entrega',
      description: 'Pague com cartão na entrega',
      icon: 'credit-card',
      isActive: true,
      requiresOnline: false,
      processingFeePercentage: 0.00,
      minAmount: 10.00,
      maxAmount: 2000.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      // Tenta buscar do banco de dados primeiro
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.warn('Erro ao carregar formas de pagamento do banco:', error);
        // Se não conseguir carregar do banco, usa as formas padrão
        setPaymentMethods(defaultPaymentMethods);
      } else if (data && data.length > 0) {
        // Converte os dados do banco para o formato esperado
        const formattedMethods: PaymentMethod[] = data.map(method => ({
          id: method.id,
          name: method.name,
          description: method.description || '',
          icon: method.icon || 'credit-card',
          isActive: method.is_active,
          requiresOnline: method.requires_online,
          processingFeePercentage: method.processing_fee_percentage || 0,
          minAmount: method.min_amount || 0,
          maxAmount: method.max_amount || undefined,
          createdAt: method.created_at,
          updatedAt: method.updated_at
        }));
        setPaymentMethods(formattedMethods);
      } else {
        // Se não há dados no banco, usa as formas padrão
        setPaymentMethods(defaultPaymentMethods);
      }
    } catch (error) {
      console.warn('Erro ao carregar formas de pagamento:', error);
      // Em caso de erro, usa as formas padrão
      setPaymentMethods(defaultPaymentMethods);
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentMethod = async (methodData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          name: methodData.name,
          description: methodData.description,
          icon: methodData.icon,
          is_active: methodData.isActive,
          requires_online: methodData.requiresOnline,
          processing_fee_percentage: methodData.processingFeePercentage,
          min_amount: methodData.minAmount,
          max_amount: methodData.maxAmount
        })
        .select()
        .single();

      if (error) throw error;

      const newMethod: PaymentMethod = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        icon: data.icon || 'credit-card',
        isActive: data.is_active,
        requiresOnline: data.requires_online,
        processingFeePercentage: data.processing_fee_percentage || 0,
        minAmount: data.min_amount || 0,
        maxAmount: data.max_amount || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      
      toast({
        title: "Forma de pagamento criada!",
        description: "A nova forma de pagamento foi adicionada com sucesso."
      });

      return newMethod;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePaymentMethod = async (id: string, methodData: Partial<PaymentMethod>) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update({
          name: methodData.name,
          description: methodData.description,
          icon: methodData.icon,
          is_active: methodData.isActive,
          requires_online: methodData.requiresOnline,
          processing_fee_percentage: methodData.processingFeePercentage,
          min_amount: methodData.minAmount,
          max_amount: methodData.maxAmount
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedMethod: PaymentMethod = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        icon: data.icon || 'credit-card',
        isActive: data.is_active,
        requiresOnline: data.requires_online,
        processingFeePercentage: data.processing_fee_percentage || 0,
        minAmount: data.min_amount || 0,
        maxAmount: data.max_amount || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setPaymentMethods(prev => 
        prev.map(method => method.id === id ? updatedMethod : method)
      );
      
      toast({
        title: "Forma de pagamento atualizada!",
        description: "A forma de pagamento foi atualizada com sucesso."
      });

      return updatedMethod;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      
      toast({
        title: "Forma de pagamento removida!",
        description: "A forma de pagamento foi removida com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  return {
    paymentMethods,
    isLoading,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    loadPaymentMethods
  };
};
