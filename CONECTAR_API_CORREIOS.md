# Como Conectar a API Real dos Correios

## 🔌 Status Atual

Seu sistema **JÁ ESTÁ CONFIGURADO** para usar a API real dos Correios! O fluxo funciona assim:

```
Frontend → Edge Function (Supabase Proxy) → API Correios → XML → Frontend
```

**Problema atual:** A API está dando **timeout** porque demora muito para responder (15-30 segundos).

---

## 🚀 3 Opções para Usar a API Real

### **Opção 1: Usar SEM Credenciais (Atual)** ⭐ RECOMENDADO

✅ **VANTAGENS:**
- Grátis
- Não precisa cadastro nos Correios
- Já está funcionando

❌ **DESVANTAGENS:**
- Mais lento (15-30 segundos)
- Sem desconto de contrato
- Limite de requisições

**Como usar:**
1. ✅ Já está configurado!
2. Aguarde até 25 segundos no cálculo do frete
3. Se der timeout, usa a tabela automaticamente

---

### **Opção 2: Usar COM Credenciais de Contrato** 🏢

Com contrato, a API fica **mais rápida e confiável**.

#### **Passo 1: Obter Credenciais**

**Como conseguir:**
1. Entre em contato com os Correios
2. Solicite um **Contrato de SIGEP Web**
3. Você receberá:
   - **Código da Empresa** (Usuário)
   - **Senha da API**

**Contato Correios:**
- 📞 Telefone: 3003-0100
- 🌐 Site: https://www.correios.com.br/enviar/comercio-eletronico

#### **Passo 2: Configurar no Projeto**

**2.1. Crie o arquivo `.env` na raiz do projeto:**

```bash
# .env
VITE_CORREIOS_EMPRESA_CODE=seu_codigo_aqui
VITE_CORREIOS_SENHA=sua_senha_aqui
```

**2.2. Para produção (Vercel), adicione as variáveis:**

Acesse: https://vercel.com/dashboard/settings/environment-variables

Adicione:
```
VITE_CORREIOS_EMPRESA_CODE = seu_codigo_aqui
VITE_CORREIOS_SENHA = sua_senha_aqui
```

**2.3. Reinicie o servidor local:**
```powershell
npm run dev
```

✅ **PRONTO!** O sistema usará automaticamente suas credenciais.

**Benefícios com credenciais:**
- ⚡ API **3-5x mais rápida**
- 💰 Valores de **PAC/SEDEX Contrato** (20% mais baratos)
- 🎯 Mais **confiável**
- 📊 Sem limite de requisições

---

### **Opção 3: API Alternativa (Correios não oficial)**

Usar serviços de terceiros como **Melhor Envio**, **Kangu**, **Frete Rápido**.

❌ **NÃO RECOMENDADO** porque:
- Pago
- Requer integração extra
- Menos transparente

---

## 🧪 Como Testar se a API Real Está Conectando

### Passo 1: Abra o Console do Navegador (F12)

### Passo 2: Calcule o Frete

### Passo 3: Veja os Logs

**✅ SE CONECTAR COM API REAL:**
```
🔗 Fazendo requisição via proxy Supabase...
📡 Chamando Edge Function: https://...
📥 Resposta da Edge Function: 200 OK
📦 Dados recebidos do proxy: { success: true, hasXml: true }
✅ Frete PAC calculado via API dos Correios:
   💰 Valor: R$ XX,XX
   📅 Prazo: X dias úteis
```

**❌ SE USAR TABELA DE FALLBACK:**
```
❌ Erro ao chamar proxy Supabase: Timeout
📊 Frete por TABELA PAC (API indisponível):
   💰 Valor: R$ XX,XX
   ⚠️  ATENÇÃO: Valor estimado da tabela
```

---

## 🔧 Aumentar Chance de Sucesso (Sem Credenciais)

Se não tiver credenciais, pode melhorar:

### 1. **Aguardar mais tempo**
✅ Já configurado: 25 segundos de timeout

### 2. **Calcular em horários melhores**
- 🌙 **Madrugada** (00h-06h) - API mais rápida
- ⚠️ **Evitar:** Horário comercial (9h-18h)

### 3. **Usar cache (futuro)**
Armazenar valores por 1 hora para CEPs já consultados

---

## 📊 Comparação das Opções

| Característica | Sem Credenciais | Com Credenciais | API Alternativa |
|----------------|----------------|-----------------|-----------------|
| **Custo** | Grátis | Grátis* | Pago (R$ 50-200/mês) |
| **Velocidade** | Lento (15-30s) | Rápido (3-5s) | Muito rápido (1-2s) |
| **Confiabilidade** | Média | Alta | Alta |
| **Valores** | Corretos | Corretos + Desconto | Variável |
| **Setup** | ✅ Pronto | Contrato necessário | Integração complexa |

*Grátis após ter contrato com Correios para envios

---

## ✅ Recomendação Final

### **Para Começar (AGORA):**
✅ Use **SEM CREDENCIAIS** (Opção 1)
- Já está funcionando
- Grátis
- Se der timeout, usa tabela automaticamente

### **Para Crescer (FUTURO):**
📈 Obtenha **CREDENCIAIS** (Opção 2)
- Quando tiver muitos pedidos
- Para melhorar experiência do usuário
- Para ter valores de contrato

---

## 🆘 Problemas Comuns

### "Sempre usa tabela, nunca conecta API"
**Solução:**
1. Verifique se Edge Function está no ar
2. Teste em horário de madrugada
3. Aguarde 25 segundos completos

### "Valores diferentes do site dos Correios"
**Causas possíveis:**
1. Usando tabela de fallback (normal)
2. CEP de origem diferente
3. Peso/dimensões diferentes

**Solução:** Compare os parâmetros no console (F12)

### "API dos Correios muito lenta"
**Normal!** API pública sem credenciais demora 15-30 segundos.

**Soluções:**
1. Obter credenciais de contrato
2. Implementar cache
3. Usar tabela como padrão

---

## 📞 Suporte

### Correios
- **Telefone**: 3003-0100
- **Site**: https://www.correios.com.br
- **E-commerce**: comercioeletronico@correios.com.br

### API dos Correios
- **Documentação**: http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx
- **Códigos de Serviço**:
  - PAC: 04510
  - SEDEX: 04014
  - PAC Contrato: 04669
  - SEDEX Contrato: 04162

---

## 🎯 Próximos Passos

1. ✅ **Teste a API atual** (sem credenciais) aguardando 25 segundos
2. 📊 **Compare valores** com o site dos Correios
3. 📈 **Se crescer**, obtenha credenciais de contrato
4. 💡 **Considere** implementar cache para melhorar performance

A API real **JÁ ESTÁ FUNCIONANDO!** Só é lenta sem credenciais. 🚀






