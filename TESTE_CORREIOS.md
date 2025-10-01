# Guia de Teste - Integração Correios

## Como Testar a Integração

### 1. Preparação

#### Configurar Variáveis de Ambiente (Opcional)

Se você tiver contrato com os Correios, crie/edite `.env`:

```bash
# Opcional - apenas se tiver contrato
VITE_CORREIOS_EMPRESA_CODE=seu-codigo
VITE_CORREIOS_SENHA=sua-senha
```

Se não tiver contrato, a integração funcionará com tarifas de balcão.

#### Configurar CEP de Origem

Edite `src/services/shippingService.ts`:

```typescript
private readonly CEP_ORIGIN = '01310-100'; // Altere para CEP da sua loja
```

### 2. Teste no Desenvolvimento

#### Teste 1: Cálculo Básico

1. Abra o site em modo desenvolvimento
2. Adicione produtos ao carrinho
3. Vá para o checkout
4. Preencha o endereço de entrega
5. Na tela de frete, digite um CEP
6. Clique em "Calcular"

**Console esperado:**
```
📦 Calculando PAC via API dos Correios...
📦 Calculando SEDEX via API dos Correios...
✅ Frete calculado: { valor: "18,50", prazo: "7" }
✅ Frete calculado: { valor: "28,90", prazo: "3" }
```

#### Teste 2: CEPs Diferentes

Teste com diferentes regiões do Brasil:

| CEP | Cidade | Resultado Esperado |
|-----|--------|--------------------|
| 01310-100 | São Paulo - SP | Mais barato |
| 20040-020 | Rio de Janeiro - RJ | Preço médio |
| 40020-000 | Salvador - BA | Preço alto |
| 60000-000 | Fortaleza - CE | Preço alto + prazo |
| 69000-000 | Manaus - AM | Mais caro + prazo |

#### Teste 3: Diferentes Pesos

No console do navegador:

```javascript
// Teste com peso leve (0.5kg)
await shippingService.calculateShipping('20040020', 0.5, {
  length: 20, width: 15, height: 10
});

// Teste com peso médio (1.5kg)
await shippingService.calculateShipping('20040020', 1.5, {
  length: 35, width: 30, height: 25
});

// Teste com peso pesado (5kg)
await shippingService.calculateShipping('20040020', 5, {
  length: 50, width: 40, height: 35
});
```

### 3. Testar Fallbacks

#### Teste 4: Simular Erro de Rede

1. Abra DevTools (F12)
2. Vá em Network
3. Selecione "Offline"
4. Tente calcular frete

**Resultado esperado:**
```
❌ Erro ao calcular PAC: Failed to fetch
⚠️ Usando valores simulados para PAC...
✅ Frete simulado retornado
```

#### Teste 5: CEP Inválido

Digite CEPs inválidos:
- `00000-000` - Inexistente
- `12345` - Incompleto
- `abcde-fgh` - Não numérico

**Resultado esperado:**
```
❌ CEP inválido
```

### 4. Testar Edge Function (Proxy)

#### Teste 6: Proxy Manual

Execute no terminal:

```bash
curl -X POST \
  https://fflomlvtgaqbzrjnvqaz.supabase.co/functions/v1/correios-proxy \
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

**Resposta esperada:**
```json
{
  "success": true,
  "services": [
    {
      "codigo": "04014",
      "valor": "28,90",
      "prazoEntrega": "3",
      "entregaDomiciliar": "S",
      "entregaSabado": "S"
    },
    {
      "codigo": "04510",
      "valor": "18,50",
      "prazoEntrega": "7",
      "entregaDomiciliar": "S",
      "entregaSabado": "N"
    }
  ]
}
```

### 5. Cenários de Erro

#### Erro 1: Dimensões Inválidas

```javascript
// Comprimento muito pequeno
await shippingService.calculateShipping('20040020', 1.5, {
  length: 10,  // ❌ Mínimo 16cm
  width: 15,
  height: 10
});
// Erro: Comprimento deve estar entre 16cm e 105cm
```

#### Erro 2: Peso Inválido

```javascript
// Peso acima do limite
await shippingService.calculateShipping('20040020', 35, { // ❌ Máximo 30kg
  length: 35, width: 30, height: 25
});
// Erro: Peso deve estar entre 0.1kg e 30kg
```

#### Erro 3: Soma das Dimensões

```javascript
// Soma > 200cm
await shippingService.calculateShipping('20040020', 1.5, {
  length: 100,  // 100 + 80 + 30 = 210cm ❌
  width: 80,
  height: 30
});
// Erro: Soma das dimensões não pode exceder 200cm
```

### 6. Performance

#### Teste 7: Tempo de Resposta

```javascript
console.time('Cálculo de Frete');
const result = await shippingService.calculateShipping(
  '20040020', 1.5, { length: 35, width: 30, height: 25 }
);
console.timeEnd('Cálculo de Frete');
// Tempo esperado: 500ms - 2000ms
```

#### Teste 8: Múltiplos Cálculos Simultâneos

```javascript
const ceps = ['01310100', '20040020', '40020000', '60000000', '69000000'];

const results = await Promise.all(
  ceps.map(cep => shippingService.calculateShipping(
    cep, 1.5, { length: 35, width: 30, height: 25 }
  ))
);

console.log('Resultados:', results);
// Todos devem retornar sucesso
```

### 7. Logs e Debug

#### Ativar Logs Detalhados

No console do navegador:

```javascript
// Ativar
localStorage.setItem('DEBUG_SHIPPING', 'true');

// Desativar
localStorage.removeItem('DEBUG_SHIPPING');
```

#### Verificar Logs da Edge Function

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions**
4. Clique em **correios-proxy**
5. Veja logs em tempo real

### 8. Checklist de Testes

- [ ] Cálculo com CEP válido
- [ ] Cálculo com diferentes pesos (0.5kg, 1.5kg, 5kg)
- [ ] Cálculo com diferentes regiões (SP, RJ, BA, CE, AM)
- [ ] CEP inválido
- [ ] Dimensões inválidas
- [ ] Peso acima do limite
- [ ] Soma de dimensões > 200cm
- [ ] Fallback quando offline
- [ ] Proxy via Edge Function
- [ ] Tempo de resposta < 3s
- [ ] Múltiplos cálculos simultâneos

### 9. Casos de Uso Reais

#### Caso 1: Capacete (1.5kg)

```javascript
await shippingService.calculateShipping('20040020', 1.5, {
  length: 35, width: 30, height: 25
});
// PAC: ~R$ 18,50 em 7 dias
// SEDEX: ~R$ 28,90 em 3 dias
```

#### Caso 2: Jaqueta (1.0kg)

```javascript
await shippingService.calculateShipping('20040020', 1.0, {
  length: 40, width: 35, height: 10
});
// PAC: ~R$ 15,50 em 7 dias
// SEDEX: ~R$ 25,90 em 3 dias
```

#### Caso 3: Kit Completo (3.5kg)

```javascript
await shippingService.calculateShipping('20040020', 3.5, {
  length: 50, width: 40, height: 35
});
// PAC: ~R$ 32,50 em 8 dias
// SEDEX: ~R$ 48,90 em 4 dias
```

### 10. Troubleshooting

#### Problema: "CORS Error"

**Solução:**
1. Verifique se a Edge Function está deployada
2. Teste o endpoint manualmente (curl)
3. Verifique logs da function

#### Problema: "Timeout"

**Solução:**
1. Verifique conexão com internet
2. API dos Correios pode estar lenta
3. Use fallback (simulação)

#### Problema: "Valores muito diferentes do site"

**Solução:**
1. Verifique CEP de origem configurado
2. Compare peso e dimensões
3. Site usa tarifas com contrato (mais baratas)

#### Problema: "Serviço indisponível"

**Solução:**
1. Alguns CEPs não têm todos os serviços
2. Tente apenas PAC ou SEDEX
3. Verifique se CEP é válido

### 11. Comparação com Site dos Correios

Para validar os valores, compare com:
https://www2.correios.com.br/sistemas/precos/

**Exemplo de Cálculo Manual:**

1. Acesse o link acima
2. Selecione serviço (PAC ou SEDEX)
3. Preencha:
   - CEP Origem: 01310-100
   - CEP Destino: 20040-020
   - Peso: 1,5 kg
   - Formato: Caixa/Pacote
   - Comprimento: 35 cm
   - Largura: 30 cm
   - Altura: 25 cm
4. Compare resultado com a API

**Valores esperados (sem contrato):**
- PAC: R$ 18,50 - 7 dias úteis
- SEDEX: R$ 28,90 - 3 dias úteis

### 12. Métricas de Sucesso

✅ **Taxa de Sucesso**: > 95%
✅ **Tempo Médio**: < 2 segundos
✅ **Taxa de Fallback**: < 5%
✅ **Precisão dos Valores**: ±10% do site oficial

---

## Suporte

Se encontrar problemas:

1. Verifique logs do console
2. Teste manualmente a Edge Function
3. Compare com site dos Correios
4. Revise configuração do CEP de origem
5. Consulte documentação em `INTEGRACAO_CORREIOS_API.md`
