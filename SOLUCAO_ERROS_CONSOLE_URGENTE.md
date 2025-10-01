# 🚨 Solução URGENTE - Erros de Console

## ❌ Problemas Encontrados

Você está vendo estes erros no console:

1. **Erro de CORS** - Edge Function `mercado-pago-get-installments` bloqueada
2. **Erro de recurso** - `file:///lovable/uploads/...` não carrega
3. **Avisos de sessão** - Avisos normais do Supabase (podem ignorar)

## ✅ Correções Aplicadas

Eu já corrigi automaticamente:

1. ✅ Adicionei configuração das Edge Functions no `supabase/config.toml`
2. ✅ Melhorei a Content Security Policy no `vite.config.ts`
3. ✅ Adicionei logs detalhados no código
4. ✅ Melhorei o tratamento de erros

## 🔧 O Que VOCÊ Precisa Fazer Agora

### Passo 1: Deploy das Edge Functions

As Edge Functions **não estão deployadas no Supabase**. Execute este comando:

```powershell
.\deploy-edge-functions.ps1
```

**OU manualmente:**

```bash
supabase functions deploy mercado-pago-get-installments
supabase functions deploy mercado-pago-process-payment
supabase functions deploy mercado-pago-check-payment
supabase functions deploy mercado-pago-webhook
```

### Passo 2: Configurar Variáveis de Ambiente no Supabase

1. Acesse: https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions
2. Vá em **Edge Functions > Secrets**
3. Adicione estas variáveis:

```
MERCADO_PAGO_PUBLIC_KEY=seu_public_key_aqui
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui
```

### Passo 3: Reiniciar o Servidor

```bash
npm run dev
```

### Passo 4: Testar

1. Abra o arquivo `test-mercado-pago-edge-functions.html` no navegador
2. Configure suas credenciais do Supabase
3. Teste cada função
4. Verifique se não há mais erros

## 🧪 Como Testar Rapidamente

Execute este comando para testar as Edge Functions:

```bash
# Testar Get Installments
curl -X POST https://fflomlvtgaqbzrjnvqaz.supabase.co/functions/v1/mercado-pago-get-installments \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "paymentMethodId": "visa"}'
```

## 📋 Checklist de Verificação

- [ ] Deploy das Edge Functions feito
- [ ] Variáveis de ambiente configuradas no Supabase
- [ ] Servidor reiniciado
- [ ] Teste realizado
- [ ] Console sem erros de CORS
- [ ] Parcelas carregam corretamente

## 🔍 Como Saber se Funcionou

### ✅ Console DEVE mostrar:

```
✅ Parcelas carregadas: 12
✅ Cliente Supabase inicializado com sucesso
🔍 Buscando parcelas via Edge Function: { amount: 1024.8, paymentMethodId: 'visa' }
✅ Parcelas recebidas: {...}
```

### ❌ Console NÃO DEVE mostrar:

```
❌ Access to fetch blocked by CORS
❌ Failed to load resource: net::ERR_FAILED
❌ Erro ao buscar parcelas
```

## 🆘 Troubleshooting

### Se ainda houver erro de CORS:

1. Verifique se as Edge Functions foram deployadas:
   ```bash
   supabase functions list
   ```

2. Verifique os logs:
   ```bash
   supabase functions logs mercado-pago-get-installments --tail
   ```

### Se o erro "file:///" persistir:

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Desregistre Service Workers antigos:
   - DevTools > Application > Service Workers > Unregister
3. Reinicie o servidor de desenvolvimento

### Se as parcelas não carregarem:

O sistema usa valores padrão como fallback. Você verá este log:

```
⚠️ Usando parcelas padrão como fallback
```

Isso é normal se a Edge Function não estiver deployada ou configurada.

## 📚 Arquivos Criados

1. **CORRECAO_ERROS_CONSOLE_MERCADO_PAGO.md** - Documentação completa
2. **deploy-edge-functions.ps1** - Script para deploy automático
3. **test-mercado-pago-edge-functions.html** - Ferramenta de teste

## 🎯 Próximos Passos Após Correção

Depois que os erros forem corrigidos:

1. Teste o fluxo completo de pagamento
2. Verifique se as parcelas são carregadas
3. Teste com diferentes valores
4. Monitore os logs por algumas horas

## 💡 Dica Important

Os avisos sobre "required lock released/acquired" são **NORMAIS** do Supabase Auth. Não tente corrigi-los, pois fazem parte do funcionamento interno da autenticação.

---

**Dúvidas?** Verifique os arquivos:
- `CORRECAO_ERROS_CONSOLE_MERCADO_PAGO.md` - Documentação completa
- Logs do console com os novos emojis para facilitar debug

