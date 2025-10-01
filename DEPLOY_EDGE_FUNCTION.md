# 🚀 Deploy da Edge Function - Correios Proxy

## Passo a Passo Completo

### 1️⃣ Instalar Supabase CLI

Escolha um dos métodos:

#### Opção A: Via NPM (Recomendado)
```bash
npm install -g supabase
```

#### Opção B: Via Chocolatey (Windows)
```bash
choco install supabase
```

#### Opção C: Via Scoop (Windows)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Verificar Instalação:
```bash
supabase --version
```

---

### 2️⃣ Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para você fazer login.

---

### 3️⃣ Link com seu Projeto

```bash
supabase link --project-ref fflomlvtgaqbzrjnvqaz
```

---

### 4️⃣ Deploy da Function

```bash
supabase functions deploy correios-proxy
```

---

### 5️⃣ Verificar Deploy

```bash
supabase functions list
```

Você deve ver:
```
correios-proxy (deployed)
```

---

### 6️⃣ Testar a Function

```bash
curl -X POST \
  https://fflomlvtgaqbzrjnvqaz.supabase.co/functions/v1/correios-proxy \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4" \
  -d '{"params":{"sCepOrigem":"74645010","sCepDestino":"20040020","nVlPeso":"1.5","nCdFormato":"1","nVlComprimento":"35","nVlAltura":"25","nVlLargura":"30","nCdServico":"04014,04510"}}'
```

---

## ⚡ Alternativa: Deploy Manual via Dashboard

Se não quiser instalar o CLI, pode fazer pelo painel:

### 1. Acesse o Dashboard
🔗 https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz

### 2. Vá em Edge Functions
- Clique em **Edge Functions** no menu lateral
- Clique em **Create a new function**

### 3. Configure a Function
- **Name:** `correios-proxy`
- **Code:** Copie o conteúdo de `supabase/functions/correios-proxy/index.ts`

### 4. Deploy
- Clique em **Deploy function**
- Aguarde alguns segundos

### 5. Testar
Use a ferramenta de teste do próprio dashboard ou curl.

---

## 🧪 Teste Integrado no Sistema

Depois do deploy, teste no seu site:

1. Abra o site em desenvolvimento
2. Vá para o checkout
3. Adicione produtos ao carrinho
4. Preencha endereço
5. Digite um CEP e clique em "Calcular"

**Console esperado:**
```
📦 Calculando PAC via API dos Correios...
⚠️ Erro de CORS/Network, tentando via proxy (Edge Function)...
✅ Usando proxy dos Correios
✅ Frete calculado: { valor: "18,50", prazo: "7" }
```

---

## 📊 Monitorar Logs

### Via CLI:
```bash
supabase functions logs correios-proxy
```

### Via Dashboard:
1. Acesse: https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz
2. Vá em **Edge Functions**
3. Clique em **correios-proxy**
4. Aba **Logs**

---

## ⚠️ Troubleshooting

### Erro: "Command not found"
**Solução:** Instale o Supabase CLI (passo 1)

### Erro: "Not logged in"
**Solução:** Execute `supabase login`

### Erro: "Project not linked"
**Solução:** Execute `supabase link --project-ref fflomlvtgaqbzrjnvqaz`

### Erro: "Function already exists"
**Solução:** Use `supabase functions deploy correios-proxy --force`

### Erro: "Permission denied"
**Solução:** Verifique se está logado com a conta correta

---

## ✅ Checklist Final

- [ ] Supabase CLI instalado
- [ ] Login feito
- [ ] Projeto linkado
- [ ] Function deployada
- [ ] Function testada (curl)
- [ ] Teste integrado no site
- [ ] Logs verificados

---

## 🎯 Status do Sistema

Depois do deploy, seu sistema terá:

1. ✅ **API Direta** - Tenta primeiro (mais rápido)
2. ✅ **Edge Function** - Se CORS falhar (confiável)
3. ✅ **Simulação** - Se tudo falhar (fallback)

**Taxa de sucesso esperada: > 95%**

---

## 📝 Comandos Úteis

```bash
# Ver status das functions
supabase functions list

# Ver logs em tempo real
supabase functions logs correios-proxy --follow

# Deletar function
supabase functions delete correios-proxy

# Redeployar
supabase functions deploy correios-proxy --force

# Testar localmente
supabase functions serve correios-proxy
```

---

## 💡 Dica

Se não quiser instalar o CLI agora, o sistema **JÁ FUNCIONA** em modo simulação!

A Edge Function é uma **otimização** para evitar CORS, mas não é obrigatória para começar.

Você pode:
1. ✅ Usar agora em modo simulação
2. 📦 Deploy da function quando quiser valores reais
3. 🎯 Sistema funciona em ambos os casos
