// Serviço de integração com a API dos Correios
// Documentação: http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx

import { ENV } from '@/config/env';

export interface CorreiosCredentials {
  nCdEmpresa?: string;  // Código da empresa (opcional - se tiver contrato)
  sDsSenha?: string;    // Senha da empresa (opcional - se tiver contrato)
}

export interface CorreiosCalculationParams {
  sCepOrigem: string;          // CEP de origem
  sCepDestino: string;         // CEP de destino
  nVlPeso: string;             // Peso em kg
  nCdFormato: '1' | '2' | '3'; // 1=Caixa/Pacote, 2=Rolo/Prisma, 3=Envelope
  nVlComprimento: string;      // Comprimento em cm
  nVlAltura: string;           // Altura em cm
  nVlLargura: string;          // Largura em cm
  nVlDiametro?: string;        // Diâmetro em cm (para formato 2)
  sCdMaoPropria?: 'S' | 'N';   // Mão própria
  nVlValorDeclarado?: string;  // Valor declarado
  sCdAvisoRecebimento?: 'S' | 'N'; // Aviso de recebimento
  nCdServico: string;          // Código do serviço (04014=SEDEX, 04510=PAC)
}

export interface CorreiosServiceResponse {
  Codigo: string;              // Código do serviço
  Valor: string;               // Valor do frete
  PrazoEntrega: string;        // Prazo de entrega em dias
  ValorSemAdicionais: string;  // Valor sem adicionais
  ValorMaoPropria: string;     // Valor mão própria
  ValorAvisoRecebimento: string; // Valor aviso de recebimento
  ValorValorDeclarado: string; // Valor declarado
  EntregaDomiciliar: string;   // S ou N
  EntregaSabado: string;       // S ou N
  Erro: string;                // Código de erro (0 = sem erro)
  MsgErro: string;             // Mensagem de erro
  obsFim?: string;
}

export interface CorreiosAPIResponse {
  cServico: CorreiosServiceResponse[];
}

class CorreiosAPIService {
  private readonly API_URL = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';
  private readonly API_URL_SECURE = 'https://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';
  
  // Códigos de serviço dos Correios
  readonly SERVICOS = {
    PAC: '04510',
    PAC_CONTRATO: '04669',
    SEDEX: '04014',
    SEDEX_CONTRATO: '04162',
    SEDEX_10: '40215',
    SEDEX_12: '40169',
    SEDEX_HOJE: '40290',
    ESEDEX: '81019'
  };

  // Credenciais (opcionais - usar apenas se tiver contrato)
  private credentials: CorreiosCredentials = {
    nCdEmpresa: ENV.CORREIOS_EMPRESA_CODE || '',
    sDsSenha: ENV.CORREIOS_SENHA || ''
  };

  /**
   * Calcula frete e prazo de entrega
   */
  async calculateShipping(params: CorreiosCalculationParams): Promise<CorreiosServiceResponse> {
    try {
      // Validar parâmetros
      this.validateParams(params);

      // Construir URL com parâmetros
      const url = this.buildURL(params);

      // Fazer requisição
      const response = await this.makeRequest(url);
      
      // Parsear resposta XML
      const result = await this.parseXMLResponse(response);
      
      // Validar resposta
      if (result.Erro !== '0') {
        throw new Error(result.MsgErro || 'Erro ao calcular frete');
      }

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao consultar API dos Correios');
    }
  }

  /**
   * Calcular múltiplos serviços de uma vez
   */
  async calculateMultipleServices(
    params: Omit<CorreiosCalculationParams, 'nCdServico'>,
    services: string[]
  ): Promise<CorreiosServiceResponse[]> {
    try {
      const serviceCodes = services.join(',');
      const fullParams = {
        ...params,
        nCdServico: serviceCodes
      };

      const url = this.buildURL(fullParams);
      const response = await this.makeRequest(url);
      const xmlDoc = await this.parseXML(response);
      
      // Extrair todos os serviços
      const cServicos = xmlDoc.getElementsByTagName('cServico');
      const results: CorreiosServiceResponse[] = [];

      for (let i = 0; i < cServicos.length; i++) {
        const servico = cServicos[i];
        const result = this.extractServiceData(servico);
        results.push(result);
      }

      return results.filter(r => r.Erro === '0');
    } catch (error: any) {
      console.error('❌ Erro ao calcular múltiplos serviços:', error);
      throw error;
    }
  }

  /**
   * Validar parâmetros da requisição
   */
  private validateParams(params: CorreiosCalculationParams): void {
    // Validar CEPs
    if (!this.isValidCep(params.sCepOrigem)) {
      throw new Error('CEP de origem inválido');
    }
    if (!this.isValidCep(params.sCepDestino)) {
      throw new Error('CEP de destino inválido');
    }

    // Validar peso
    const peso = parseFloat(params.nVlPeso);
    if (isNaN(peso) || peso <= 0 || peso > 30) {
      throw new Error('Peso deve estar entre 0.1kg e 30kg');
    }

    // Validar dimensões
    const comprimento = parseFloat(params.nVlComprimento);
    const altura = parseFloat(params.nVlAltura);
    const largura = parseFloat(params.nVlLargura);

    if (comprimento < 16 || comprimento > 105) {
      throw new Error('Comprimento deve estar entre 16cm e 105cm');
    }
    if (altura < 2 || altura > 105) {
      throw new Error('Altura deve estar entre 2cm e 105cm');
    }
    if (largura < 11 || largura > 105) {
      throw new Error('Largura deve estar entre 11cm e 105cm');
    }

    // Validar soma das dimensões
    const soma = comprimento + altura + largura;
    if (soma > 200) {
      throw new Error('Soma das dimensões não pode exceder 200cm');
    }
  }

  /**
   * Construir URL com parâmetros
   */
  private buildURL(params: CorreiosCalculationParams): string {
    const baseParams = new URLSearchParams({
      nCdServico: params.nCdServico,
      sCepOrigem: this.cleanCep(params.sCepOrigem),
      sCepDestino: this.cleanCep(params.sCepDestino),
      nVlPeso: params.nVlPeso,
      nCdFormato: params.nCdFormato,
      nVlComprimento: params.nVlComprimento,
      nVlAltura: params.nVlAltura,
      nVlLargura: params.nVlLargura,
      nVlDiametro: params.nVlDiametro || '0',
      sCdMaoPropria: params.sCdMaoPropria || 'N',
      nVlValorDeclarado: params.nVlValorDeclarado || '0',
      sCdAvisoRecebimento: params.sCdAvisoRecebimento || 'N',
      StrRetorno: 'xml'
    });

    // Adicionar credenciais se disponíveis
    if (this.credentials.nCdEmpresa && this.credentials.sDsSenha) {
      baseParams.append('nCdEmpresa', this.credentials.nCdEmpresa);
      baseParams.append('sDsSenha', this.credentials.sDsSenha);
    }

    // Tentar HTTPS primeiro, depois HTTP
    return `${this.API_URL_SECURE}?${baseParams.toString()}`;
  }

  /**
   * Fazer requisição HTTP - Tenta apenas proxy Supabase
   */
  private async makeRequest(url: string): Promise<string> {
    // Tentar proxy Supabase (sem logs de erro pois o fallback é silencioso)
    return await this.makeRequestViaProxy(url);
  }

  /**
   * Fazer requisição através da Edge Function (proxy Supabase)
   */
  private async makeRequestViaProxy(originalUrl: string): Promise<string> {
    try {
      // Extrair parâmetros da URL original
      const urlObj = new URL(originalUrl);
      const params: any = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const supabaseUrl = ENV.SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL não configurado');
      }

      const proxyUrl = `${supabaseUrl}/functions/v1/correios-proxy`;

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ENV.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ params }),
        signal: AbortSignal.timeout(5000) // Timeout reduzido para 5 segundos
      });

      if (!response.ok) {
        throw new Error(`Proxy retornou status ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro no proxy');
      }

      // Retornar XML bruto do proxy
      return data.xmlRaw || '';
    } catch (error: any) {
      // Não logar erro no console - será tratado no fallback silenciosamente
      throw new Error('Proxy Supabase indisponível');
    }
  }

  /**
   * Fazer requisição através de proxy CORS público (fallback)
   * DESABILITADO - Causava muitos timeouts e erros CORS
   */
  private async makeRequestViaCorsProxy(originalUrl: string): Promise<string> {
    // Proxy CORS público desabilitado por causar timeouts constantes
    // Vamos direto para o fallback de valores estimados
    throw new Error('Proxy CORS desabilitado - usando valores estimados');
  }

  /**
   * Parsear resposta XML
   */
  private async parseXMLResponse(xmlText: string): Promise<CorreiosServiceResponse> {
    const xmlDoc = await this.parseXML(xmlText);
    const servico = xmlDoc.getElementsByTagName('cServico')[0];
    
    if (!servico) {
      throw new Error('Resposta inválida da API dos Correios');
    }

    return this.extractServiceData(servico);
  }

  /**
   * Parsear XML string
   */
  private async parseXML(xmlText: string): Promise<Document> {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Erro ao parsear resposta XML dos Correios');
    }

    return xmlDoc;
  }

  /**
   * Extrair dados do serviço do XML
   */
  private extractServiceData(servico: Element): CorreiosServiceResponse {
    const getTagValue = (tagName: string): string => {
      const element = servico.getElementsByTagName(tagName)[0];
      return element?.textContent || '';
    };

    return {
      Codigo: getTagValue('Codigo'),
      Valor: getTagValue('Valor'),
      PrazoEntrega: getTagValue('PrazoEntrega'),
      ValorSemAdicionais: getTagValue('ValorSemAdicionais'),
      ValorMaoPropria: getTagValue('ValorMaoPropria'),
      ValorAvisoRecebimento: getTagValue('ValorAvisoRecebimento'),
      ValorValorDeclarado: getTagValue('ValorValorDeclarado'),
      EntregaDomiciliar: getTagValue('EntregaDomiciliar'),
      EntregaSabado: getTagValue('EntregaSabado'),
      Erro: getTagValue('Erro'),
      MsgErro: getTagValue('MsgErro'),
      obsFim: getTagValue('obsFim')
    };
  }

  /**
   * Validar formato do CEP
   */
  private isValidCep(cep: string): boolean {
    const cleanCep = this.cleanCep(cep);
    return /^\d{8}$/.test(cleanCep);
  }

  /**
   * Limpar CEP removendo caracteres não numéricos
   */
  private cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Converter valor string para número
   */
  parseValue(valor: string): number {
    return parseFloat(valor.replace(',', '.'));
  }
}

export const correiosAPI = new CorreiosAPIService();
