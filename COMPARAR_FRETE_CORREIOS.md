# Como Comparar os Valores de Frete com o Site dos Correios

## 📋 Parâmetros Atuais Configurados

### Configurações do Sistema:
- **CEP de Origem**: `74645-010` (Goiânia - GO)
- **Peso padrão por capacete**: `2.0 kg`
- **Dimensões da embalagem**: `27cm x 27cm x 27cm`
- **Formato**: Caixa/Pacote (código 1)

---

## 🔗 Como Comparar no Site dos Correios

### Opção 1: Calculadora Web dos Correios
Acesse: https://www2.correios.com.br/sistemas/precosPrazos/

**Preencha os dados:**
1. **CEP de Origem**: `74645010` (sem hífen)
2. **CEP de Destino**: O CEP que você está testando
3. **Peso**: `2` (kg)
4. **Formato**: Caixa/Pacote
5. **Comprimento**: `27` (cm)
6. **Altura**: `27` (cm)
7. **Largura**: `27` (cm)
8. **Diâmetro**: `0` (deixar vazio)
9. **Serviço**: 
   - PAC: código `04510`
   - SEDEX: código `04014`
   - PAC Contrato: código `04669`
   - SEDEX Contrato: código `04162`

---

## 🔍 Verificando os Logs do Console

Ao calcular o frete no aplicativo, abra o Console do navegador (F12) e procure por:

### Se usando API Real:
```
📦 Tentando calcular frete via API dos Correios - [SERVIÇO]:
   📍 CEP Origem: 74645-010
   📍 CEP Destino: [SEU_CEP]
   ⚖️  Peso: 2 kg
   📏 Dimensões: 27cm x 27cm x 27cm
   📦 Formato: Caixa/Pacote (1)
   🔢 Código do serviço: [CÓDIGO]

✅ Frete [SERVIÇO] calculado via API dos Correios:
   💰 Valor: R$ XX,XX
   📅 Prazo: X dias úteis
```

### Se usando Tabela de Fallback:
```
📊 Frete por TABELA [SERVIÇO] (API indisponível):
   💰 Valor: R$ XX,XX
   📅 Prazo: X dias úteis
   📍 Região: regionX (baseado no CEP)
   ⚠️  ATENÇÃO: Valor estimado da tabela, não é da API oficial dos Correios
```

---

## ⚠️ Diferenças Esperadas

### Quando é Normal Haver Diferença:

1. **Tabela de Fallback** (quando API dos Correios está indisponível)
   - Sistema usa valores estimados
   - Diferença pode ser de ±10% a 20%

2. **CEPs Especiais**
   - Áreas de difícil acesso
   - Regiões com taxas adicionais

3. **Serviços de Contrato**
   - PAC/SEDEX Contrato têm 20% de desconto
   - Requer contrato com os Correios

### Quando Reportar Problema:

1. ✅ **Diferença maior que 20%** nos valores
2. ✅ **CEP ou dimensões incorretos** nos logs
3. ✅ **API sempre usando fallback** (nunca conecta)

---

## 🛠️ Ajustando Configurações

### Para alterar o CEP de origem:
Edite o arquivo: `src/services/shippingService.ts`
```typescript
private readonly CEP_ORIGIN = '74645-010'; // Altere aqui
```

### Para alterar peso ou dimensões:
- **Peso**: `src/components/MercadoPagoCheckoutModal.tsx` (linhas 61-64)
- **Dimensões**: `src/services/shippingService.ts` (linha 258)

---

## 📞 Informações dos Correios

- **Site Oficial**: https://www.correios.com.br
- **Calculadora**: https://www2.correios.com.br/sistemas/precosPrazos/
- **API (WebService)**: http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx
- **Telefone**: 3003-0100

---

## 🔄 Última Atualização

**Data**: Janeiro 2025  
**Peso configurado**: 2.0 kg  
**Dimensões**: 27x27x27 cm  
**CEP Origem**: 74645-010 (Goiânia-GO)

