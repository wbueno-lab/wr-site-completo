# 🚀 Deploy da Edge Function - Correios Proxy

## 📋 O que é necessário

A Edge Function `correios-proxy` é essencial para:
- ✅ Calcular frete **REAL** usando a API dos Correios
- ✅ Evitar problemas de CORS no navegador
- ✅ Fornecer preços e prazos reais aos usuários

## 🔧 Opções de Deploy

### Opção 1: Via Supabase Dashboard (Recomendado) 🌐

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até Edge Functions**
   - No menu lateral, clique em **"Edge Functions"**
   - Clique no botão **"New Function"** ou **"Deploy"**

3. **Criar/Atualizar a função**
   - Nome: `correios-proxy`
   - Copie todo o conteúdo do arquivo: `supabase/functions/correios-proxy/index.ts`
   - Cole no editor
   - Clique em **"Deploy"**

### Opção 2: Via Supabase CLI (Linha de Comando) 💻

Se você tiver o Supabase CLI instalado:

```bash
# 1. Login no Supabase
supabase login

# 2. Link com o projeto
supabase link --project-ref fflomlvtgaqbzrjnvqaz

# 3. Deploy da função
supabase functions deploy correios-proxy
```

#### Instalar Supabase CLI (se necessário):

**Windows (via npm):**
```bash
npm install -g supabase
```

**Windows (via Scoop):**
```bash
scoop install supabase
```

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

### Opção 3: Via GitHub Actions (Automático) 🤖

Se você usar GitHub, pode configurar deploy automático:

1. Crie o arquivo `.github/workflows/deploy-edge-functions.yml`:

```yaml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy Edge Functions
        run: supabase functions deploy correios-proxy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

2. Configure os secrets no GitHub:
   - `SUPABASE_PROJECT_REF`: fflomlvtgaqbzrjnvqaz
   - `SUPABASE_ACCESS_TOKEN`: (gere no dashboard do Supabase)

## ✅ Verificar se funcionou

Após o deploy, teste a função:

### Teste via curl:

```bash
curl -X POST https://fflomlvtgaqbzrjnvqaz.supabase.co/functions/v1/correios-proxy \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4" \
  -d '{
    "params": {
      "sCepOrigem": "74645010",
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

### Teste via navegador:

Abra o arquivo `test-correios-proxy.html` no navegador e clique em "Testar Proxy".

### Teste no seu site:

1. Acesse seu site: http://localhost:8080
2. Abra o DevTools (F12)
3. No console, execute:

```javascript
const { shippingService } = await import('/src/services/shippingService.ts');
const result = await shippingService.calculateShipping('20040-020', 1.5, { length: 35, width: 30, height: 25 });
console.log(result);
```

**Resultado esperado:**
```json
{
  "success": true,
  "services": [
    {
      "code": "04510",
      "name": "PAC",
      "price": 45.30,  // ✅ PREÇO REAL
      "delivery_time": 8,
      "company": "correios"
    },
    {
      "code": "04014", 
      "name": "SEDEX",
      "price": 63.50,  // ✅ PREÇO REAL
      "delivery_time": 3,
      "company": "correios"
    }
  ]
}
```

## 🎯 Após o Deploy

Quando a Edge Function estiver funcionando, você verá no console:

```
✅ Frete PAC calculado via API dos Correios
✅ Frete SEDEX calculado via API dos Correios
```

Ao invés de:
```
🔄 Usando valores estimados para PAC
🔄 Usando valores estimados para SEDEX
```

## 🔍 Troubleshooting

### Erro 404: Function not found
- Verifique se o nome está correto: `correios-proxy`
- Aguarde 1-2 minutos após o deploy

### Erro 500: Internal Server Error
- Verifique os logs no Dashboard do Supabase
- Confirme que o código foi copiado corretamente

### Erro de CORS
- Verifique se os headers CORS estão configurados corretamente
- Confirme que a `apikey` está sendo enviada

### Timeout
- A API dos Correios pode estar lenta ou offline
- Aguarde alguns minutos e tente novamente

## 📝 Notas Importantes

1. **Sem credenciais necessárias**: A função funciona sem contrato com os Correios
2. **Limites**: API pública dos Correios pode ter limitações de taxa
3. **Fallback**: Se a API falhar, o sistema usa valores estimados automaticamente
4. **Gratuito**: Edge Functions do Supabase são gratuitas (até 500k invocações/mês)

## 🚀 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste o cálculo de frete no seu site
2. ✅ Verifique se os preços estão corretos
3. ✅ Monitore os logs no Supabase Dashboard
4. ✅ (Opcional) Configure contrato com Correios para melhores taxas

---

**Data**: 30/09/2025  
**Status**: ⏳ Aguardando Deploy
**Próxima ação**: Deploy via Supabase Dashboard

