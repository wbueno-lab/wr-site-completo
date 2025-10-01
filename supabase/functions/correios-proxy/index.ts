// Edge Function para fazer proxy da API dos Correios
// Evita problemas de CORS no frontend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface CorreiosParams {
  sCepOrigem: string;
  sCepDestino: string;
  nVlPeso: string;
  nCdFormato: string;
  nVlComprimento: string;
  nVlAltura: string;
  nVlLargura: string;
  nCdServico: string;
  nCdEmpresa?: string;
  sDsSenha?: string;
}

// Função para extrair valor de uma tag XML
function extractXMLValue(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

// Função para extrair todos os serviços do XML
function parseCorreiosXML(xmlText: string) {
  const services = [];
  
  // Dividir o XML em blocos de serviço
  const serviceBlocks = xmlText.split('<cServico>').slice(1);
  
  for (const block of serviceBlocks) {
    const erro = extractXMLValue(block, 'Erro');
    
    // Adicionar apenas serviços sem erro
    if (erro === '0') {
      services.push({
        codigo: extractXMLValue(block, 'Codigo'),
        valor: extractXMLValue(block, 'Valor'),
        prazoEntrega: extractXMLValue(block, 'PrazoEntrega'),
        valorSemAdicionais: extractXMLValue(block, 'ValorSemAdicionais'),
        entregaDomiciliar: extractXMLValue(block, 'EntregaDomiciliar'),
        entregaSabado: extractXMLValue(block, 'EntregaSabado'),
        erro: erro,
        msgErro: ''
      });
    } else {
      const msgErro = extractXMLValue(block, 'MsgErro');
      console.log(`⚠️ Erro no serviço ${extractXMLValue(block, 'Codigo')}: ${msgErro}`);
      
      // Incluir serviços com erro para informar o usuário
      services.push({
        codigo: extractXMLValue(block, 'Codigo'),
        valor: '0,00',
        prazoEntrega: '0',
        valorSemAdicionais: '0,00',
        entregaDomiciliar: 'N',
        entregaSabado: 'N',
        erro: erro,
        msgErro: msgErro
      });
    }
  }
  
  return services;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Content-Length': '0'
      },
      status: 200
    })
  }

  try {
    // Verificar se é uma requisição válida
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Método não permitido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405
        }
      );
    }

    const body = await req.json();
    const { params } = body as { params: CorreiosParams };

    console.log('📦 Proxy Correios - Recebendo requisição:', {
      origem: params.sCepOrigem,
      destino: params.sCepDestino,
      peso: params.nVlPeso
    });

    // Validar parâmetros obrigatórios
    if (!params.sCepOrigem || !params.sCepDestino || !params.nVlPeso) {
      throw new Error('Parâmetros obrigatórios faltando');
    }

    // Construir URL da API dos Correios
    const baseParams = new URLSearchParams({
      nCdServico: params.nCdServico || '04014,04510', // SEDEX e PAC
      sCepOrigem: params.sCepOrigem.replace(/\D/g, ''),
      sCepDestino: params.sCepDestino.replace(/\D/g, ''),
      nVlPeso: params.nVlPeso,
      nCdFormato: params.nCdFormato || '1',
      nVlComprimento: params.nVlComprimento || '20',
      nVlAltura: params.nVlAltura || '10',
      nVlLargura: params.nVlLargura || '15',
      nVlDiametro: '0',
      sCdMaoPropria: 'N',
      nVlValorDeclarado: '0',
      sCdAvisoRecebimento: 'N',
      StrRetorno: 'xml'
    });

    // Adicionar credenciais se fornecidas
    if (params.nCdEmpresa && params.sDsSenha) {
      baseParams.append('nCdEmpresa', params.nCdEmpresa);
      baseParams.append('sDsSenha', params.sDsSenha);
    }

    const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${baseParams.toString()}`;

    console.log('🔍 Consultando API dos Correios...');

    // Fazer requisição para API dos Correios com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro na API dos Correios: ${response.status}`);
      }

      const xmlText = await response.text();
      
      console.log('✅ Resposta recebida dos Correios');

      // Parsear XML usando regex
      const services = parseCorreiosXML(xmlText);

      console.log(`✅ ${services.length} serviço(s) processado(s)`);

      // Retornar primeiro serviço válido no formato esperado
      const firstValidService = services.find(s => s.erro === '0');
      
      if (firstValidService) {
        return new Response(
          JSON.stringify({
            success: true,
            Codigo: firstValidService.codigo,
            Valor: firstValidService.valor,
            PrazoEntrega: firstValidService.prazoEntrega,
            ValorSemAdicionais: firstValidService.valorSemAdicionais,
            EntregaDomiciliar: firstValidService.entregaDomiciliar,
            EntregaSabado: firstValidService.entregaSabado,
            Erro: firstValidService.erro,
            MsgErro: firstValidService.msgErro,
            xmlRaw: xmlText, // Para debug
            allServices: services // Todos os serviços para referência
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      } else {
        throw new Error('Nenhum serviço válido encontrado');
      }

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: API dos Correios não respondeu em 15 segundos');
      }
      throw fetchError;
    }

  } catch (error: any) {
    console.error('❌ Erro no proxy dos Correios:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro ao consultar API dos Correios'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
})
