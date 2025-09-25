import { supabase, waitForSupabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type Category = Tables<'categories'>;

export interface ProductWithCategory extends Product {
  categories: Category | null;
}

/**
 * Serviço otimizado para busca de produtos com tratamento de conectividade
 */
export class ProductService {
  private static instance: ProductService;
  private cache: Map<string, { data: ProductWithCategory; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  private constructor() {
    this.cache = new Map();
  }
  
  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  private async getFromCache(id: string): Promise<ProductWithCategory | null> {
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private async saveToCache(product: ProductWithCategory): Promise<void> {
    this.cache.set(product.id, {
      data: product,
      timestamp: Date.now()
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  /**
   * Busca um produto por ID com query otimizada
   */
  private isRetryableError(error: Error): boolean {
    const nonRetryableCodes = ['PGRST116', 'PGRST301', 'invalid-input'];
    const nonRetryableMessages = [
      'Produto não encontrado',
      'Produto não encontrado ou inativo',
      'Cliente Supabase não inicializado'
    ];
    
    if ('code' in error && typeof (error as any).code === 'string') {
      return !nonRetryableCodes.includes((error as any).code);
    }
    
    // Verificar se a mensagem indica erro não retryável
    if (nonRetryableMessages.some(msg => error.message.includes(msg))) {
      return false;
    }
    
    return true;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    timeout: number = 15000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    const executeWithTimeout = async (op: () => Promise<T>): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const result = await Promise.race([
          op(),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error(`Timeout: Operação demorou mais de ${timeout/1000}s`));
            });
          })
        ]);

        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await executeWithTimeout(operation);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Tentativa ${attempt + 1} falhou:`, error);

        const isTimeout = error.message.includes('Timeout');
        const shouldRetry = this.isRetryableError(lastError) || isTimeout;

        if (!shouldRetry) {
          console.log('❌ Erro não retryável, abortando tentativas');
          throw lastError;
        }

        if (attempt < maxRetries - 1) {
          // Adiciona jitter ao delay para evitar thundering herd
          const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
          const delay = Math.min(baseDelay * Math.pow(2, attempt) * jitter, 10000);
          
          console.log(`🔄 Aguardando ${Math.round(delay)}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.log('❌ Todas as tentativas falharam');
        }
      }
    }
    
    throw lastError || new Error('Operação falhou após todas as tentativas');
  }

  async getProductById(id: string): Promise<ProductWithCategory> {
    if (!id) {
      throw new Error('ID do produto é obrigatório');
    }

    console.log('🔄 ProductService: Buscando produto por ID:', id);

    return this.retryOperation(async () => {
      try {
        // Aguardar inicialização do Supabase
        await waitForSupabase();

        // Verifica cache primeiro
        const cachedProduct = await this.getFromCache(id);
        if (cachedProduct) {
          console.log('✅ ProductService: Produto encontrado no cache:', cachedProduct.name);
          return cachedProduct;
        }

        // Verifica se o produto existe e está ativo
        const exists = await this.checkProductExists(id);
        if (!exists) {
          throw new Error('Produto não encontrado ou inativo');
        }

        // Query otimizada - apenas campos necessários
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            original_price,
            image_url,
            gallery_images,
            gallery,
            is_new,
            is_promo,
            is_active,
            stock_quantity,
            helmet_numbers,
            helmet_type,
            material,
            weight_grams,
            sku,
            specifications,
            shell_material,
            liner_material,
            ventilation_system,
            visor_type,
            chin_strap_type,
            retention_system,
            impact_absorption,
            penetration_resistance,
            warranty_period,
            country_of_origin,
            brand_model,
            shell_sizes,
            certifications,
            safety_standards,
            color_options,
            additional_features,
            tags,
            categories (
              id,
              name,
              slug,
              color
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('❌ ProductService: Erro ao buscar produto:', error);
          if (error.code === 'PGRST116') {
            throw new Error('Produto não encontrado');
          }
          if (error.code === 'PGRST301') {
            throw new Error('Produto não encontrado ou inativo');
          }
          throw new Error(`Erro ao buscar produto: ${error.message}`);
        }

        if (!data) {
          throw new Error('Produto não encontrado');
        }

        // Validação básica dos dados
        if (!data.name || !data.price) {
          throw new Error('Dados do produto estão incompletos');
        }

        const product = data as ProductWithCategory;

        // Salva no cache apenas se os dados estiverem completos
        await this.saveToCache(product);

        console.log('✅ ProductService: Produto encontrado:', product.name);
        return product;
      } catch (error) {
        console.error('❌ ProductService: Erro inesperado:', error);
        throw error;
      }
    });
  }

  /**
   * Busca produtos com paginação otimizada
   */
  async getProducts(options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    searchTerm?: string;
    isPromo?: boolean;
    isNew?: boolean;
  } = {}): Promise<{ products: ProductWithCategory[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      categoryId,
      searchTerm,
      isPromo,
      isNew
    } = options;

    console.log('🔄 ProductService: Buscando produtos com filtros:', options);

    // Aguardar inicialização do Supabase
    await waitForSupabase();

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        original_price,
        image_url,
        is_new,
        is_promo,
        is_active,
        categories (
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('is_active', true);

    // Aplicar filtros
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    if (isPromo !== undefined) {
      query = query.eq('is_promo', isPromo);
    }

    if (isNew !== undefined) {
      query = query.eq('is_new', isNew);
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ ProductService: Erro ao buscar produtos:', error);
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    console.log(`✅ ProductService: ${data?.length || 0} produtos encontrados`);
    return {
      products: (data || []) as ProductWithCategory[],
      total: count || 0
    };
  }

  /**
   * Verifica se um produto existe e está ativo
   */
  async checkProductExists(id: string): Promise<boolean> {
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('❌ ProductService: Erro ao verificar produto:', error);
      return false;
    }
  }

  /**
   * Busca produtos relacionados
   */
  async getRelatedProducts(productId: string, categoryId?: string, limit: number = 4): Promise<ProductWithCategory[]> {
    try {
      // Aguardar inicialização do Supabase
      await waitForSupabase();

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          is_new,
          is_promo,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(limit);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ ProductService: Erro ao buscar produtos relacionados:', error);
        return [];
      }

      return (data || []) as ProductWithCategory[];
    } catch (error) {
      console.error('❌ ProductService: Erro ao buscar produtos relacionados:', error);
      return [];
    }
  }
}

// Exportar instância singleton
export const productService = ProductService.getInstance();

