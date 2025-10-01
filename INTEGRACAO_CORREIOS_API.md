# Integração com API dos Correios

## Visão Geral

Foi implementada uma integração completa e profissional com a API oficial dos Correios para cálculo real de frete e prazo de entrega.

## Arquitetura da Solução

### 1. **Camada de API** (`correiosAPI.ts`)
Serviço principal que se comunica diretamente com a API dos Correios.

**Características:**
- ✅ Validação rigorosa de parâmetros
- ✅ Suporte a credenciais corporativas (opcional)
- ✅ Múltiplos serviços (PAC, SEDEX, SEDEX 10, etc)
- ✅ Tratamento de erros robusto
- ✅ Parsing de XML
- ✅ Fallback automático em caso de falha

### 2. **Camada de Serviço** (`shippingService.ts`)
Wrapper que facilita o uso e adiciona lógica de negócio.

**Características:**
- ✅ Cálculo automático de dimensões
- ✅ Múltiplos serviços simultâneos
- ✅ Simulação para desenvolvimento
- ✅ Fallback inteligente
- ✅ Cache de resultados (futuro)

### 3. **Edge Function** (`correios-proxy`)
Proxy serverless para evitar problemas de CORS.

**Características:**
- ✅ Contorna limitações de CORS
- ✅ Executa no servidor (edge)
- ✅ Logs detalhados
- ✅ Resposta em JSON
- ✅ Sem custos adicionais

## Fluxo de Requisição

```
Frontend → correiosAPI.ts 
    ↓ (tentativa direta)
    ├─→ API Correios (HTTPS)
    │   └─→ Sucesso ✅
    │
    ├─→ API Correios (HTTP)
    │   └─→ Sucesso ✅
    │
    ├─→ Edge Function (Proxy)
    │   └─→ API Correios
    │       └─→ Sucesso ✅
    │
    └─→ Fallback (Simulação)
        └─→ Valores estimados ⚠️
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Correios (opcional - apenas se tiver contrato)
VITE_CORREIOS_EMPRESA_CODE=seu-codigo-empresa
VITE_CORREIOS_SENHA=sua-senha
```

### Configuração do CEP de Origem

Edite `src/services/shippingService.ts`:

```typescript
private readonly CEP_ORIGIN = '01310-100'; // Altere para o CEP da sua loja
```

## Uso Básico

### Calcular Frete

```typescript
import { shippingService } from '@/services/shippingService';

// Calcular frete para um CEP
const result = await shippingService.calculateShipping(
  '20040-020', // CEP destino
  1.5,         // Peso em kg
  {            // Dimensões em cm
    length: 35,
    width: 30,
    height: 25
  }
);

if (result.success) {
  console.log('Serviços disponíveis:', result.services);
  // [
  //   {
  //     code: '04510',
  //     name: 'PAC',
  //     price: 18.50,
  //     delivery_time: 7,
  //     company: 'correios'
  //   },
  //   {
  //     code: '04014',
  //     name: 'SEDEX',
  //     price: 28.90,
  //     delivery_time: 3,
  //     company: 'correios'
  //   }
  // ]
}
```

### API Direta dos Correios

```typescript
import { correiosAPI } from '@/services/correiosAPI';

const result = await correiosAPI.calculateShipping({
  sCepOrigem: '01310100',
  sCepDestino: '20040020',
  nVlPeso: '1.5',
  nCdFormato: '1',
  nVlComprimento: '35',
  nVlAltura: '25',
  nVlLargura: '30',
  nCdServico: '04014' // SEDEX
});

console.log('Valor:', result.Valor);      // "28,90"
console.log('Prazo:', result.PrazoEntrega); // "3"
```

## Serviços Disponíveis

### Códigos dos Correios

| Código | Serviço | Descrição |
|--------|---------|-----------|
| `04510` | PAC | Encomenda econômica |
| `04014` | SEDEX | Encomenda expressa |
| `04669` | PAC Contrato | PAC com contrato |
| `04162` | SEDEX Contrato | SEDEX com contrato |
| `40215` | SEDEX 10 | Entrega em 10h |
| `40169` | SEDEX 12 | Entrega em 12h |
| `40290` | SEDEX Hoje | Entrega no mesmo dia |
| `81019` | e-SEDEX | SEDEX eletrônico |

### Limites e Restrições

#### Peso
- **Mínimo:** 0.1 kg
- **Máximo:** 30 kg
- **Formato:** String numérica (ex: "1.5")

#### Dimensões (em centímetros)
- **Comprimento:** 16 a 105 cm
- **Largura:** 11 a 105 cm
- **Altura:** 2 a 105 cm
- **Soma máxima:** 200 cm (C + L + A)

#### Formatos
- `1` - Caixa/Pacote (padrão)
- `2` - Rolo/Prisma
- `3` - Envelope

## Tratamento de Erros

### Códigos de Erro dos Correios

```typescript
switch (result.Erro) {
  case '0':
    // Sucesso
    break;
  case '-1':
    // Código de serviço inválido
    break;
  case '-2':
    // CEP de origem inválido
    break;
  case '-3':
    // CEP de destino inválido
    break;
  case '-4':
    // Peso excede o limite
    break;
  case '7':
    // Serviço indisponível para o trecho
    break;
  case '8':
    // Serviço indisponível para o CEP
    break;
  case '9':
    // CEP inicial pertence a Área de Risco
    break;
  case '10':
    // CEP final pertence a Área de Risco (Localidade Especial)
    break;
  case '11':
    // CEP final pertence a Área de Risco
    break;
}
```

### Exemplo de Tratamento

```typescript
try {
  const result = await correiosAPI.calculateShipping(params);
  
  if (result.Erro !== '0') {
    console.error('Erro dos Correios:', result.MsgErro);
    // Usar fallback ou informar usuário
  }
} catch (error) {
  console.error('Erro na requisição:', error);
  // Usar simulação como fallback
}
```

## Deploy da Edge Function

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login no Supabase

```bash
supabase login
```

### 3. Deploy da Function

```bash
supabase functions deploy correios-proxy
```

### 4. Verificar Deploy

```bash
supabase functions list
```

### 5. Testar Function

```bash
curl -X POST \
  https://seu-projeto.supabase.co/functions/v1/correios-proxy \
  -H "Content-Type: application/json" \
  -H "apikey: sua-chave-anonima" \
  -d '{
    "params": {
      "sCepOrigem": "01310100",
      "sCepDestino": "20040020",
      "nVlPeso": "1.5",
      "nCdFormato": "1",
      "nVlComprimento": "35",
      "nVlAltura": "25",
      "nVlLargura": "30",
      "nCdServico": "04014,04510"
    }
  }'
```

## Monitoramento e Logs

### Logs no Frontend

```typescript
// Ativar logs detalhados
localStorage.setItem('DEBUG_SHIPPING', 'true');

// Desativar logs
localStorage.removeItem('DEBUG_SHIPPING');
```

### Logs da Edge Function

Acesse o painel do Supabase:
1. Vá em **Edge Functions**
2. Selecione **correios-proxy**
3. Clique na aba **Logs**
4. Veja logs em tempo real

### Métricas Importantes

- ✅ Taxa de sucesso da API direta
- ✅ Taxa de uso do proxy
- ✅ Taxa de fallback para simulação
- ✅ Tempo médio de resposta
- ✅ Erros por tipo

## Otimizações Futuras

### 1. Cache de Resultados

```typescript
// Implementar cache por CEP + peso
const cacheKey = `freight_${cep}_${weight}`;
const cached = localStorage.getItem(cacheKey);

if (cached) {
  const data = JSON.parse(cached);
  if (Date.now() - data.timestamp < 3600000) { // 1 hora
    return data.services;
  }
}
```

### 2. Batch Requests

```typescript
// Calcular múltiplos serviços em uma única requisição
const services = await correiosAPI.calculateMultipleServices(
  params,
  ['04014', '04510', '40215'] // SEDEX, PAC, SEDEX 10
);
```

### 3. Retry com Exponential Backoff

```typescript
// Já implementado no correiosAPI.ts
// Tenta 3 vezes antes de falhar
```

### 4. Circuit Breaker

```typescript
// Evitar sobrecarga em caso de falhas consecutivas
if (consecutiveFailures > 5) {
  return simulatedValues; // Pula para simulação
}
```

## Troubleshooting

### Problema: CORS Error

**Solução:**
- A Edge Function deve resolver automaticamente
- Verifique se a function está deployada
- Teste o endpoint manualmente

### Problema: Timeout

**Solução:**
- Aumentar timeout na configuração
- Verificar conectividade com Correios
- Usar cache para reduzir chamadas

### Problema: Valores Incorretos

**Solução:**
- Verificar CEP de origem configurado
- Validar dimensões e peso
- Comparar com tabela oficial dos Correios

### Problema: "Serviço indisponível"

**Solução:**
- Verificar código do serviço
- Alguns serviços não estão disponíveis para todos os CEPs
- Usar PAC ou SEDEX como fallback

## Contato com Correios

### Para Obter Contrato

1. Acesse: https://www2.correios.com.br/empresas
2. Solicite proposta comercial
3. Aguarde análise (5-10 dias úteis)
4. Assine contrato
5. Receba código de empresa e senha

### Suporte Técnico

- **Telefone:** 3003-0100
- **Email:** comercial@correios.com.br
- **Documentação:** http://ws.correios.com.br/calculador/

## Referências

- [API dos Correios - Documentação Oficial](http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Tabela de Preços dos Correios](https://www2.correios.com.br/sistemas/precos/)

## Changelog

### v1.0.0 (2025-01-30)
- ✅ Implementação inicial da API dos Correios
- ✅ Edge Function para proxy
- ✅ Validação de parâmetros
- ✅ Tratamento de erros
- ✅ Fallback para simulação
- ✅ Suporte a múltiplos serviços
- ✅ Logs detalhados
