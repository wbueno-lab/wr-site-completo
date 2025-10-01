# Correção de Erros de Console - Mercado Pago

## Problemas Identificados

### 1. Erro de CORS na Edge Function
```
Access to fetch at 'https://...supabase.co/functions/v1/mercado-pago-get-installments' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

### 2. Erro de Recurso Inválido
```
Failed to load resource: net::ERR_FAILED
file:///lovable/uploads/...get-installments:1
```

### 3. Avisos de Sessão (Normais)
```
required lock released/acquired for storage key sb-...-auth-token
```

## Correções Aplicadas

### 1. Configuração das Edge Functions no `supabase/config.toml`

Adicionadas as configurações das funções do Mercado Pago que estavam faltando:

```toml
[functions.mercado-pago-get-installments]
verify_jwt = false

[functions.mercado-pago-process-payment]
verify_jwt = true

[functions.mercado-pago-check-payment]
verify_jwt = true

[functions.mercado-pago-webhook]
verify_jwt = false

[functions.correios-proxy]
verify_jwt = false
```

**Motivo:** As Edge Functions do Mercado Pago não estavam registradas no arquivo de configuração, causando problemas de invocação.

### 2. Melhoria no Content Security Policy (CSP) do `vite.config.ts`

Atualizada a política de segurança para ser mais específica:

```typescript
'Content-Security-Policy': "default-src 'self'; 
  connect-src 'self' https://*.supabase.co https://api.mercadopago.com ...; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  img-src 'self' data: https:; 
  style-src 'self' 'unsafe-inline'; 
  font-src 'self' data:;"
```

**Motivo:** A CSP anterior não tinha `default-src` e outras diretivas necessárias, podendo causar bloqueios de recursos.

### 3. Logs Detalhados no `mercadoPagoService.ts`

Adicionados logs mais informativos para facilitar o debug:

```typescript
console.log('🔍 Buscando parcelas via Edge Function:', { amount, paymentMethodId });
console.log('✅ Parcelas recebidas:', data);
console.error('❌ Erro na Edge Function:', error);
console.log('⚠️ Usando parcelas padrão como fallback');
```

**Motivo:** Facilita identificar onde exatamente ocorre o erro e qual o comportamento do sistema.

### 4. Tratamento de Erros no `MercadoPagoCardForm.tsx`

Melhorado o feedback ao usuário quando há erros:

```typescript
if (data.length === 0) {
  toast({
    title: "Aviso",
    description: "Não foi possível carregar as parcelas. Usando valores padrão.",
    variant: "default"
  });
}
```

**Motivo:** O usuário deve ser informado quando algo não funciona como esperado.

## Próximos Passos

### 1. Deploy das Edge Functions

As Edge Functions precisam ser deployadas para o Supabase:

```bash
# Deploy de todas as funções
supabase functions deploy mercado-pago-get-installments
supabase functions deploy mercado-pago-process-payment
supabase functions deploy mercado-pago-check-payment
supabase functions deploy mercado-pago-webhook
```

### 2. Configurar Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no Supabase:

```bash
# No painel do Supabase: Settings > Edge Functions > Secrets
MERCADO_PAGO_PUBLIC_KEY=seu_public_key
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
```

### 3. Testar a Integração

Após o deploy, teste o fluxo completo:

1. Abra o site
2. Adicione produtos ao carrinho
3. Vá para o checkout
4. Selecione pagamento com cartão
5. Verifique se as parcelas são carregadas corretamente
6. Verifique o console para confirmar que não há mais erros

### 4. Reiniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

## Verificação de Erros

### Console do Navegador

Após as correções, você deve ver no console:

```
✅ Parcelas carregadas: 12
✅ Cliente Supabase inicializado com sucesso
```

E **NÃO** deve ver:

```
❌ Access to fetch blocked by CORS
❌ Failed to load resource
❌ Erro ao buscar parcelas
```

### Avisos Normais (Pode Ignorar)

Estes avisos são normais do Supabase Auth e podem ser ignorados:

```
required lock released for storage key sb-...-auth-token
required lock acquired for storage key sb-...-auth-token
_useSession begin
_useSession end
getSession() session from storage
```

## Solução de Problemas

### Se ainda houver erros de CORS

1. Verifique se as Edge Functions foram deployadas:
   ```bash
   supabase functions list
   ```

2. Verifique os logs das Edge Functions:
   ```bash
   supabase functions logs mercado-pago-get-installments
   ```

3. Teste a Edge Function diretamente:
   ```bash
   curl -X POST https://seu-projeto.supabase.co/functions/v1/mercado-pago-get-installments \
     -H "Authorization: Bearer SEU_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "paymentMethodId": "visa"}'
   ```

### Se o erro "file:///lovable/uploads" persistir

Este erro pode ser causado por:
1. Cache do navegador - Limpe o cache (Ctrl+Shift+Delete)
2. Service Worker antigo - Desregistre no DevTools > Application > Service Workers
3. Extensões do navegador - Teste em modo anônimo

### Verificar Status das Edge Functions

Crie um arquivo de teste `test-edge-functions.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Teste Edge Functions</title>
</head>
<body>
  <h1>Teste de Edge Functions</h1>
  <button onclick="testGetInstallments()">Testar Get Installments</button>
  <pre id="result"></pre>

  <script>
    async function testGetInstallments() {
      const result = document.getElementById('result');
      result.textContent = 'Testando...';
      
      try {
        const response = await fetch('https://fflomlvtgaqbzrjnvqaz.supabase.co/functions/v1/mercado-pago-get-installments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SEU_ANON_KEY'
          },
          body: JSON.stringify({
            amount: 1000,
            paymentMethodId: 'visa'
          })
        });
        
        const data = await response.json();
        result.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        result.textContent = 'Erro: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

## Resumo

As principais correções foram:

1. ✅ Adicionar configuração das Edge Functions no `config.toml`
2. ✅ Melhorar a Content Security Policy
3. ✅ Adicionar logs detalhados para debug
4. ✅ Melhorar tratamento de erros e feedback ao usuário

Agora você precisa:

1. 🔄 Fazer deploy das Edge Functions
2. 🔄 Configurar as variáveis de ambiente no Supabase
3. 🔄 Reiniciar o servidor de desenvolvimento
4. ✅ Testar o fluxo de pagamento

