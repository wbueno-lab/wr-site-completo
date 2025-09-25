// Serviço para gerenciar conectividade e diagnóstico de problemas
import { supabaseConfig } from '@/integrations/supabase/client';
import { MERCADO_PAGO_CONFIG } from '@/integrations/mercado-pago/config';

export interface ConnectivityTest {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'HEAD';
  headers?: Record<string, string>;
  timeout?: number;
}

export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  status?: number;
  error?: string;
  details?: string;
}

export class ConnectivityService {
  private static instance: ConnectivityService;
  private testResults: TestResult[] = [];

  static getInstance(): ConnectivityService {
    if (!ConnectivityService.instance) {
      ConnectivityService.instance = new ConnectivityService();
    }
    return ConnectivityService.instance;
  }

  // Testes de conectividade predefinidos
  private getConnectivityTests(): ConnectivityTest[] {
    return [
      {
        name: 'Internet Básica',
        url: 'https://httpbin.org/get',
        method: 'HEAD',
        timeout: 5000
      },
      {
        name: 'DNS Resolution',
        url: 'https://api.supabase.com/health',
        method: 'GET',
        timeout: 10000
      },
      {
        name: 'Supabase API',
        url: `${supabaseConfig.url}/rest/v1/`,
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        },
        timeout: 15000
      },
      {
        name: 'Supabase Auth',
        url: `${supabaseConfig.url}/auth/v1/settings`,
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        },
        timeout: 15000
      },
      {
        name: 'Supabase Realtime',
        url: `${supabaseConfig.url}/realtime/v1/`,
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        },
        timeout: 15000
      },
      {
        name: 'Mercado Pago API',
        url: `${MERCADO_PAGO_CONFIG.apiUrls[MERCADO_PAGO_CONFIG.environment]}/v1/health`,
        method: 'GET',
        timeout: 10000
      },
      {
        name: 'CORS Test',
        url: `${supabaseConfig.url}/rest/v1/products?select=id&limit=1`,
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    ];
  }

  // Executar um teste individual com retries
  async runTest(test: ConnectivityTest): Promise<TestResult> {
    const MAX_RETRIES = 2;
    const startTime = Date.now();
    let lastError: any;
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), test.timeout || 10000);

        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            ...test.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          },
          cache: 'no-cache',
          signal: controller.signal,
          keepalive: true,
          mode: 'cors',
          credentials: 'include'
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        // Verificar se é um erro de CORS
        if (response.type === 'opaque') {
          throw new Error('Erro de CORS: Resposta bloqueada por política de segurança');
        }

        const result: TestResult = {
          name: test.name,
          success: response.ok,
          duration,
          status: response.status,
          details: response.statusText
        };

        if (!response.ok) {
          result.error = `HTTP ${response.status}: ${response.statusText}`;
          // Adicionar detalhes específicos para certos códigos de erro
          if (response.status === 429) {
            result.details = 'Muitas requisições. Aguarde um momento e tente novamente.';
          } else if (response.status >= 500) {
            result.details = 'Erro no servidor. Tente novamente mais tarde.';
          }
        }

        return result;
      } catch (error) {
        lastError = error;
        
        // Se não for o último retry, esperar antes de tentar novamente
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
    }

    const duration = Date.now() - startTime;
    return {
      name: test.name,
      success: false,
      duration,
      error: lastError?.message || 'Erro desconhecido',
      details: `Falhou após ${MAX_RETRIES + 1} tentativas`
    };
  }

  // Executar todos os testes
  async runAllTests(): Promise<TestResult[]> {
    const tests = this.getConnectivityTests();
    const results: TestResult[] = [];

    for (const test of tests) {
      try {
        const result = await this.runTest(test);
        results.push(result);
        
        // Pequeno delay entre testes para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          duration: 0,
          error: error.message
        });
      }
    }

    this.testResults = results;
    return results;
  }

  // Executar testes em paralelo (mais rápido)
  async runAllTestsParallel(): Promise<TestResult[]> {
    const tests = this.getConnectivityTests();
    
    const promises = tests.map(test => this.runTest(test));
    const results = await Promise.allSettled(promises);
    
    const testResults: TestResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: tests[index].name,
          success: false,
          duration: 0,
          error: result.reason?.message || 'Teste falhou'
        };
      }
    });

    this.testResults = testResults;
    return testResults;
  }

  // Obter resultados dos últimos testes
  getLastResults(): TestResult[] {
    return this.testResults;
  }

  // Verificar se há problemas críticos
  hasCriticalIssues(): boolean {
    return this.testResults.some(result => 
      !result.success && 
      ['Internet Básica', 'DNS Resolution', 'Supabase API'].includes(result.name)
    );
  }

  // Obter resumo dos problemas
  getIssuesSummary(): { critical: number; warnings: number; total: number } {
    const critical = this.testResults.filter(result => 
      !result.success && 
      ['Internet Básica', 'DNS Resolution', 'Supabase API'].includes(result.name)
    ).length;

    const warnings = this.testResults.filter(result => 
      !result.success && 
      !['Internet Básica', 'DNS Resolution', 'Supabase API'].includes(result.name)
    ).length;

    return {
      critical,
      warnings,
      total: critical + warnings
    };
  }

  // Obter sugestões de correção
  getFixSuggestions(): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};

    this.testResults.forEach(result => {
      if (!result.success) {
        switch (result.name) {
          case 'Internet Básica':
            suggestions[result.name] = [
              'Verifique sua conexão com a internet',
              'Desabilite temporariamente firewall/antivírus',
              'Teste com dados móveis (4G/5G)',
              'Reinicie o roteador'
            ];
            break;
          case 'DNS Resolution':
            suggestions[result.name] = [
              'Altere DNS para 8.8.8.8 e 8.8.4.4',
              'Use DNS da Cloudflare: 1.1.1.1 e 1.0.0.1',
              'Execute: ipconfig /flushdns (Windows)',
              'Reinicie o serviço de rede'
            ];
            break;
          case 'Supabase API':
            suggestions[result.name] = [
              'Adicione exceções no firewall para *.supabase.co',
              'Configure proxy para permitir Supabase',
              'Verifique se não há bloqueio corporativo',
              'Teste com VPN'
            ];
            break;
          case 'Supabase Realtime':
            suggestions[result.name] = [
              'Configure proxy para permitir WebSockets',
              'Verifique configurações de firewall para WebSocket',
              'Use modo polling como alternativa',
              'Teste em rede diferente'
            ];
            break;
          case 'Mercado Pago API':
            suggestions[result.name] = [
              'Verifique tokens de API do Mercado Pago',
              'Confirme se está usando ambiente correto (sandbox/production)',
              'Verifique conectividade com api.mercadopago.com',
              'Teste com tokens de exemplo'
            ];
            break;
          case 'CORS Test':
            suggestions[result.name] = [
              'Adicione seu domínio às origens permitidas no Supabase',
              'Verifique configurações CORS no dashboard',
              'Confirme se o domínio está correto',
              'Teste em localhost se em desenvolvimento'
            ];
            break;
        }
      }
    });

    return suggestions;
  }

  // Teste de performance geral
  async testPerformance(): Promise<{ duration: number; status: 'excellent' | 'good' | 'moderate' | 'poor' }> {
    const startTime = Date.now();
    
    try {
      const promises = [
        fetch('https://httpbin.org/get'),
        fetch(`${supabaseConfig.url}/rest/v1/`),
        fetch('https://api.mercadopago.com/v1/health')
      ];
      
      await Promise.allSettled(promises);
      const duration = Date.now() - startTime;
      
      let status: 'excellent' | 'good' | 'moderate' | 'poor';
      if (duration < 2000) {
        status = 'excellent';
      } else if (duration < 5000) {
        status = 'good';
      } else if (duration < 10000) {
        status = 'moderate';
      } else {
        status = 'poor';
      }
      
      return { duration, status };
    } catch (error) {
      return { duration: 0, status: 'poor' };
    }
  }
}

// Exportar instância singleton
export const connectivityService = ConnectivityService.getInstance();


