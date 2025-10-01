// Serviço para cálculo de frete dos Correios
import { ShippingCalculation, ShippingResult, ShippingService } from '@/types/payment';
import { ENV } from '@/config/env';
import { correiosAPI, CorreiosCalculationParams } from './correiosAPI';

class ShippingServiceClass {
  private readonly CEP_ORIGIN = '74645-010'; // CEP da loja (São Paulo - SP)
  
  // Usar correiosAPI.SERVICOS ao invés de definir aqui
  private get SERVICES() {
    return correiosAPI.SERVICOS;
  }

  /**
   * Calcula o frete para um CEP de destino
   */
  async calculateShipping(
    cepDestination: string,
    weight: number,
    dimensions: { length: number; width: number; height: number }
  ): Promise<ShippingResult> {
    try {
      // Validar CEP
      const cleanCep = this.cleanCep(cepDestination);
      if (!this.isValidCep(cleanCep)) {
        return {
          success: false,
          services: [],
          error: 'CEP inválido'
        };
      }

      // Validar dimensões e peso
      if (weight <= 0 || weight > 30) {
        return {
          success: false,
          services: [],
          error: 'Peso deve estar entre 0.1kg e 30kg'
        };
      }

      // Calcular frete para diferentes serviços
      const services = await Promise.all([
        this.calculateServicePrice('PAC', cleanCep, weight, dimensions),
        this.calculateServicePrice('SEDEX', cleanCep, weight, dimensions)
      ]);

      const validServices = services.filter(service => service !== null) as ShippingService[];

      if (validServices.length === 0) {
        return {
          success: false,
          services: [],
          error: 'Não foi possível calcular o frete para este CEP'
        };
      }

      return {
        success: true,
        services: validServices.sort((a, b) => a.price - b.price)
      };
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      return {
        success: false,
        services: [],
        error: 'Erro interno ao calcular frete'
      };
    }
  }

  /**
   * Calcula preço para um serviço específico
   */
  private async calculateServicePrice(
    serviceType: 'PAC' | 'SEDEX',
    cepDestination: string,
    weight: number,
    dimensions: { length: number; width: number; height: number }
  ): Promise<ShippingService | null> {
    const serviceCode = this.SERVICES[serviceType];
    
    try {
      // Tentar usar API real dos Correios via proxy com timeout aumentado
      const params: CorreiosCalculationParams = {
        sCepOrigem: this.CEP_ORIGIN,
        sCepDestino: cepDestination,
        nVlPeso: weight.toString(),
        nCdFormato: '1', // Caixa/Pacote
        nVlComprimento: Math.max(16, dimensions.length).toString(),
        nVlAltura: Math.max(2, dimensions.height).toString(),
        nVlLargura: Math.max(11, dimensions.width).toString(),
        nCdServico: serviceCode
      };
      
      // Usar Promise.race para timeout - reduzido para 6 segundos para falhar rápido
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 6000)
      );
      
      const apiPromise = correiosAPI.calculateShipping(params);
      
      const result = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      // Verificar se a resposta é válida
      if (!result || !result.Valor || result.Erro !== '0') {
        throw new Error(result?.MsgErro || 'Resposta inválida da API');
      }
      
      const price = correiosAPI.parseValue(result.Valor);
      const deliveryTime = parseInt(result.PrazoEntrega);
      
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Frete ${serviceType} calculado: R$ ${price.toFixed(2)} - ${deliveryTime} dias`);
      }
      
      // Converter resposta da API para formato ShippingService
      return {
        code: serviceCode,
        name: serviceType === 'PAC' ? 'PAC' : 'SEDEX',
        price: price,
        delivery_time: deliveryTime,
        company: 'correios',
        additional_info: serviceType === 'PAC' ? 'Entrega econômica' : 'Entrega expressa'
      };
    } catch (error: any) {
      // API indisponível - usar fallback silenciosamente
      // Não logar no console para evitar poluição (comportamento esperado)
      return this.simulateShippingPrice(serviceType, cepDestination, weight);
    }
  }

  /**
   * Calcula preços de frete baseado em tabela realista dos Correios
   * (fallback quando API não disponível)
   * Tabela baseada nos preços reais de janeiro/2025
   */
  private simulateShippingPrice(
    serviceType: 'PAC' | 'SEDEX',
    cepDestination: string,
    weight: number
  ): ShippingService {
    const region = this.getRegion(cepDestination);
    
    // Tabela de preços realista baseada nos Correios (Janeiro 2025)
    // Formato: [região][peso_até_kg]: {PAC: preço, SEDEX: preço}
    const priceTable: { [region: string]: { [weight: string]: { PAC: number; SEDEX: number } } } = {
      // Região 1 (mesmo estado - Goiás)
      region1: {
        '0.5': { PAC: 15.50, SEDEX: 25.80 },
        '1.0': { PAC: 18.20, SEDEX: 30.50 },
        '2.0': { PAC: 24.80, SEDEX: 42.90 },
        '3.0': { PAC: 31.40, SEDEX: 55.30 },
        '5.0': { PAC: 44.60, SEDEX: 80.10 }
      },
      // Região 2 (estados próximos - Centro-Oeste e Sudeste)
      region2: {
        '0.5': { PAC: 18.90, SEDEX: 32.40 },
        '1.0': { PAC: 22.70, SEDEX: 38.90 },
        '2.0': { PAC: 32.50, SEDEX: 56.20 },
        '3.0': { PAC: 42.30, SEDEX: 73.50 },
        '5.0': { PAC: 61.90, SEDEX: 108.10 }
      },
      // Região 3 (estados distantes - Sul, Nordeste e Norte)
      region3: {
        '0.5': { PAC: 22.30, SEDEX: 38.90 },
        '1.0': { PAC: 28.60, SEDEX: 49.80 },
        '2.0': { PAC: 42.90, SEDEX: 74.70 },
        '3.0': { PAC: 57.20, SEDEX: 99.60 },
        '5.0': { PAC: 85.80, SEDEX: 149.40 }
      }
    };
    
    // Encontrar faixa de peso
    let weightRange = '5.0';
    if (weight <= 0.5) weightRange = '0.5';
    else if (weight <= 1.0) weightRange = '1.0';
    else if (weight <= 2.0) weightRange = '2.0';
    else if (weight <= 3.0) weightRange = '3.0';
    
    // Calcular preço baseado na tabela
    const regionPrices = priceTable[region];
    let price = regionPrices[weightRange][serviceType];
    
    // Se peso for maior que 5kg, adicionar proporcionalmente
    if (weight > 5.0) {
      const extraWeight = weight - 5.0;
      const pricePerKg = serviceType === 'PAC' ? 13.5 : 24.0;
      price += extraWeight * pricePerKg;
    }
    
    // Calcular prazo de entrega baseado na região
    const baseDeliveryTime: { [region: string]: { PAC: number; SEDEX: number } } = {
      region1: { PAC: 5, SEDEX: 2 },
      region2: { PAC: 8, SEDEX: 3 },
      region3: { PAC: 12, SEDEX: 5 }
    };
    
    const deliveryTime = baseDeliveryTime[region][serviceType];

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Frete por tabela ${serviceType}: R$ ${price.toFixed(2)} - ${deliveryTime} dias`);
    }

    return {
      code: this.SERVICES[serviceType],
      name: serviceType,
      price: Math.round(price * 100) / 100,
      delivery_time: deliveryTime,
      company: 'correios',
      additional_info: serviceType === 'PAC' 
        ? 'Entrega econômica (tabela)' 
        : 'Entrega expressa (tabela)'
    };
  }

  /**
   * Determina a região baseada no CEP para cálculo de frete
   */
  private getRegion(cep: string): string {
    const firstDigit = parseInt(cep.charAt(0));
    
    // Região 1: Mesmo estado (Goiás = 7)
    if (firstDigit === 7) return 'region1';
    
    // Região 2: Centro-Oeste e Sudeste (0,1,2,3)
    if ([0, 1, 2, 3].includes(firstDigit)) return 'region2';
    
    // Região 3: Sul, Nordeste e Norte (4,5,6,8,9)
    return 'region3';
  }


  /**
   * Limpa e formata o CEP
   */
  private cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Valida formato do CEP
   */
  private isValidCep(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  /**
   * Calcula dimensões padrão baseadas no peso
   */
  calculateDefaultDimensions(weight: number): { length: number; width: number; height: number } {
    // Dimensões padrão para capacetes e acessórios
    if (weight <= 0.5) {
      return { length: 20, width: 15, height: 10 }; // Acessórios pequenos
    } else if (weight <= 2) {
      return { length: 35, width: 30, height: 25 }; // Capacetes
    } else if (weight <= 5) {
      return { length: 40, width: 35, height: 30 }; // Jaquetas
    } else {
      return { length: 50, width: 40, height: 35 }; // Itens grandes
    }
  }

  /**
   * Calcula peso padrão baseado no tipo de produto
   */
  calculateDefaultWeight(productType: string): number {
    switch (productType.toLowerCase()) {
      case 'capacete':
      case 'helmet':
        return 1.5;
      case 'jaqueta':
      case 'jacket':
        return 1.0;
      case 'luva':
      case 'glove':
        return 0.3;
      case 'bota':
      case 'boot':
        return 1.2;
      default:
        return 0.5;
    }
  }
}

export const shippingService = new ShippingServiceClass();
