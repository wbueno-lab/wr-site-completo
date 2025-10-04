# ✅ Credenciais de Produção Aplicadas

**Status:** Ambos os ambientes atualizados com credenciais de PRODUÇÃO

## 📍 Onde foram atualizadas:

- ✅ **Arquivo `.env` local** - Atualizado
- ✅ **Supabase Secrets** - Configurados
  - `MERCADO_PAGO_PUBLIC_KEY`
  - `MERCADO_PAGO_ACCESS_TOKEN`

## 🔄 Como Aplicar as Mudanças

### Para Desenvolvimento Local:

**Se o servidor estiver rodando:**

1. **Pare o servidor:**
   - Pressione `Ctrl + C` no terminal

2. **Reinicie o servidor:**
   ```powershell
   npm run dev
   ```

3. **Limpe o cache do navegador:**
   - `Ctrl + Shift + Delete`
   - Recarregue: `Ctrl + F5`

### Para Produção (Vercel):

As credenciais já estão no Supabase, mas você precisa garantir que as variáveis de ambiente também estejam na Vercel:

1. **Acesse:** https://vercel.com/seu-projeto/settings/environment-variables

2. **Adicione/Atualize:**
   ```
   VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-6b2cdd09-c177-45a7-8c08-7aea85f1ee43
   VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-6478968027976820-100316-4a11c8df8b458272787ed005c9b363ba-1642084466
   ```

3. **Ambiente:** Production

4. **Redeploy:** Faça um novo deploy para aplicar

## ⚠️ IMPORTANTE - Modo Produção Ativo

Agora você está com credenciais de **PRODUÇÃO** ativas:

- 🔴 **Todos os pagamentos são REAIS**
- 💰 **O dinheiro cai na sua conta**
- ⚠️ **Cuidado ao testar**
- 🚫 **Não use cartões de teste**

## 🧪 Como Testar com Segurança

### Opção 1: Teste com Valor Pequeno
- Use R$ 0,01 ou R$ 1,00
- Use seu próprio cartão
- Você pode estornar depois se necessário

### Opção 2: PIX de Teste
- Gere um QR Code PIX
- **NÃO pague** - apenas verifique se o código é gerado
- Verifique se aparece no Dashboard do Mercado Pago

### Opção 3: Voltar para Teste
Se ainda quiser testar sem cobranças reais, volte para credenciais de teste:
```
TEST-...
```

## 📊 Monitorar Pagamentos

### Dashboard Mercado Pago:
- https://www.mercadopago.com.br/activities
- Veja todas as transações em tempo real

### Logs Supabase:
- https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/functions
- Edge Function: `mercado-pago-process-payment`

### Tabela de Pedidos:
```sql
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

## ✅ Checklist Final

- [x] Credenciais atualizadas no arquivo `.env`
- [x] Credenciais configuradas no Supabase
- [ ] Servidor local reiniciado (se aplicável)
- [ ] Cache do navegador limpo
- [ ] Variáveis configuradas na Vercel (se for fazer deploy)
- [ ] Teste de pagamento realizado

## 🆘 Solução de Problemas

### Erro: "Public Key inválida"
- Reinicie o servidor local
- Limpe o cache do navegador
- Verifique se o `.env` foi salvo

### Erro: "Access Token inválido"
- Aguarde 2 minutos (propagação no Supabase)
- Verifique os logs das Edge Functions

### Pagamento não processa
- Confirme que está usando credenciais APP_ (não TEST_)
- Verifique os logs da Edge Function
- Teste com um cartão real diferente

## 📝 Comandos Úteis

**Ver secrets no Supabase:**
```powershell
supabase secrets list
```

**Reiniciar servidor:**
```powershell
npm run dev
```

**Ver logs Edge Functions:**
```powershell
supabase functions logs mercado-pago-process-payment
```

---

**Última atualização:** 03/10/2025
**Status:** 🔴 PRODUÇÃO ATIVA


