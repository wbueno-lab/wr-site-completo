// Utilitário para detectar e analisar erros comuns do console

export interface ErrorAnalysis {
  type: 'csp' | 'cors' | 'network' | 'javascript' | 'supabase' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  solution: string;
  affectedFeatures: string[];
}

export class ConsoleErrorDetector {
  private static errorPatterns: Array<{
    pattern: RegExp;
    type: ErrorAnalysis['type'];
    severity: ErrorAnalysis['severity'];
    description: string;
    solution: string;
    affectedFeatures: string[];
  }> = [
    // CSP Errors
    {
      pattern: /Content Security Policy|CSP violation|Refused to connect/i,
      type: 'csp',
      severity: 'high',
      description: 'Violação de Content Security Policy',
      solution: 'Atualizar política CSP para permitir o domínio necessário',
      affectedFeatures: ['Conectividade', 'APIs externas', 'Recursos de terceiros']
    },
    
    // CORS Errors
    {
      pattern: /CORS policy|Access-Control-Allow-Origin|blocked by CORS/i,
      type: 'cors',
      severity: 'high',
      description: 'Erro de CORS (Cross-Origin Resource Sharing)',
      solution: 'Configurar headers CORS no servidor ou usar proxy',
      affectedFeatures: ['APIs externas', 'Supabase', 'Mercado Pago']
    },
    
    // Network Errors
    {
      pattern: /Failed to load resource|net::ERR_|NetworkError|fetch failed/i,
      type: 'network',
      severity: 'medium',
      description: 'Erro de rede ou conectividade',
      solution: 'Verificar conexão com internet e configurações de firewall',
      affectedFeatures: ['Conectividade geral', 'APIs externas']
    },
    
    // JavaScript Errors
    {
      pattern: /TypeError|ReferenceError|SyntaxError|Cannot read property/i,
      type: 'javascript',
      severity: 'critical',
      description: 'Erro de JavaScript no código',
      solution: 'Verificar código JavaScript e corrigir bugs',
      affectedFeatures: ['Funcionalidades da aplicação']
    },
    
    // Supabase Specific
    {
      pattern: /supabase|JWT|Invalid API key|unauthorized/i,
      type: 'supabase',
      severity: 'high',
      description: 'Erro relacionado ao Supabase',
      solution: 'Verificar configuração do Supabase e chaves de API',
      affectedFeatures: ['Banco de dados', 'Autenticação', 'Realtime']
    },
    
    // WebSocket Errors
    {
      pattern: /WebSocket|wss:\/\/|ws:\/\/|connection failed/i,
      type: 'network',
      severity: 'medium',
      description: 'Erro de conexão WebSocket',
      solution: 'Verificar suporte a WebSocket e configurações de firewall',
      affectedFeatures: ['Realtime', 'Notificações em tempo real']
    }
  ];

  static analyzeError(errorMessage: string): ErrorAnalysis {
    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(errorMessage)) {
        return {
          type: pattern.type,
          severity: pattern.severity,
          description: pattern.description,
          solution: pattern.solution,
          affectedFeatures: pattern.affectedFeatures
        };
      }
    }

    return {
      type: 'unknown',
      severity: 'medium',
      description: 'Erro não identificado',
      solution: 'Analisar manualmente o erro para determinar a causa',
      affectedFeatures: ['Funcionalidades gerais']
    };
  }

  static getCommonSolutions(): Array<{
    type: ErrorAnalysis['type'];
    title: string;
    steps: string[];
    priority: 'high' | 'medium' | 'low';
  }> {
    return [
      {
        type: 'csp',
        title: 'Corrigir Violações de CSP',
        priority: 'high',
        steps: [
          '1. Abrir DevTools (F12)',
          '2. Ir para aba Console',
          '3. Identificar URLs bloqueadas',
          '4. Adicionar domínios à política CSP',
          '5. Atualizar index.html e vite.config.ts'
        ]
      },
      {
        type: 'cors',
        title: 'Resolver Problemas de CORS',
        priority: 'high',
        steps: [
          '1. Verificar configuração do Supabase',
          '2. Adicionar domínio à lista de origens permitidas',
          '3. Configurar headers CORS corretos',
          '4. Testar em ambiente de desenvolvimento'
        ]
      },
      {
        type: 'network',
        title: 'Corrigir Problemas de Rede',
        priority: 'medium',
        steps: [
          '1. Verificar conexão com internet',
          '2. Testar com dados móveis',
          '3. Desabilitar firewall temporariamente',
          '4. Verificar configurações de proxy'
        ]
      },
      {
        type: 'supabase',
        title: 'Configurar Supabase Corretamente',
        priority: 'high',
        steps: [
          '1. Verificar URL e chave de API',
          '2. Configurar RLS (Row Level Security)',
          '3. Adicionar políticas de acesso',
          '4. Testar conexão com Supabase'
        ]
      },
      {
        type: 'javascript',
        title: 'Corrigir Erros de JavaScript',
        priority: 'critical',
        steps: [
          '1. Identificar linha do erro',
          '2. Verificar sintaxe do código',
          '3. Verificar tipos de dados',
          '4. Testar em ambiente isolado'
        ]
      }
    ];
  }

  static generateDiagnosticReport(errors: string[]): {
    summary: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    analysis: Array<ErrorAnalysis & { count: number; examples: string[] }>;
    recommendations: string[];
  } {
    const analysisMap = new Map<string, {
      analysis: ErrorAnalysis;
      count: number;
      examples: string[];
    }>();

    // Analisar cada erro
    errors.forEach(error => {
      const analysis = this.analyzeError(error);
      const key = `${analysis.type}-${analysis.severity}`;
      
      if (analysisMap.has(key)) {
        const existing = analysisMap.get(key)!;
        existing.count++;
        existing.examples.push(error);
      } else {
        analysisMap.set(key, {
          analysis,
          count: 1,
          examples: [error]
        });
      }
    });

    // Converter para array e ordenar por severidade
    const analysis = Array.from(analysisMap.values())
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.analysis.severity] - severityOrder[a.analysis.severity];
      })
      .map(item => ({
        ...item.analysis,
        count: item.count,
        examples: item.examples.slice(0, 3) // Apenas os primeiros 3 exemplos
      }));

    // Calcular resumo
    const summary = analysis.reduce((acc, item) => {
      acc.total += item.count;
      acc[item.severity]++;
      return acc;
    }, {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    });

    // Gerar recomendações
    const recommendations = analysis
      .filter(item => item.severity === 'critical' || item.severity === 'high')
      .map(item => item.solution)
      .filter((solution, index, array) => array.indexOf(solution) === index); // Remove duplicatas

    return {
      summary,
      analysis,
      recommendations
    };
  }
}

// Função utilitária para testar conectividade básica
export const testBasicConnectivity = async (): Promise<{
  success: boolean;
  errors: string[];
  details: Record<string, any>;
}> => {
  const errors: string[] = [];
  const details: Record<string, any> = {};

  try {
    // Teste 1: Conectividade básica
    try {
      const response = await fetch('https://api.github.com/zen', {
        method: 'GET',
        cache: 'no-cache'
      });
      details.github = { status: response.status, ok: response.ok };
    } catch (error) {
      errors.push(`GitHub API: ${error}`);
    }

    // Teste 2: Supabase
    try {
      const supabaseUrl = 'https://fflomlvtgaqbzrjnvqaz.supabase.co';
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4'
        }
      });
      details.supabase = { status: response.status, ok: response.ok };
    } catch (error) {
      errors.push(`Supabase: ${error}`);
    }

    // Teste 3: Mercado Pago
    try {
      const response = await fetch('https://api.mercadopago.com', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      details.mercadopago = { status: response.status, ok: response.ok };
    } catch (error) {
      errors.push(`Mercado Pago: ${error}`);
    }

  } catch (error) {
    errors.push(`Teste geral: ${error}`);
  }

  return {
    success: errors.length === 0,
    errors,
    details
  };
};
