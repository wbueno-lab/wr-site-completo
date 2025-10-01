# 🔐 Como Fazer Login no Supabase CLI

## Problema
Você viu o erro no console porque as Edge Functions não estão deployadas.

## Solução Passo a Passo

### Passo 1: Obter o Access Token

1. Abra: https://supabase.com/dashboard/account/tokens
2. Clique em **"Generate new token"** ou copie um token existente
3. Dê um nome (ex: "CLI Local")
4. Copie o token gerado

### Passo 2: Fazer Login com o Token

Abra o PowerShell e execute:

```powershell
cd "C:\Users\wessi\OneDrive\Desktop\Wr capacetes site 2 banco de dados"
supabase login --token SEU_TOKEN_AQUI
```

**Substitua** `SEU_TOKEN_AQUI` pelo token que você copiou.

### Passo 3: Linkar com o Projeto

```powershell
supabase link --project-ref fflomlvtgaqbzrjnvqaz
```

### Passo 4: Deploy das Edge Functions

Agora execute o script:

```powershell
.\deploy-edge-functions.ps1
```

Quando perguntar se deseja fazer deploy, digite **S** e pressione Enter.

### Passo 5: Configurar Variáveis de Ambiente

Depois do deploy, você precisa adicionar as credenciais do Mercado Pago:

1. Acesse: https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/settings/functions
2. Clique em **"Add secret"**
3. Adicione:
   - Nome: `MERCADO_PAGO_PUBLIC_KEY`
   - Valor: Sua chave pública do Mercado Pago
4. Adicione outra:
   - Nome: `MERCADO_PAGO_ACCESS_TOKEN`
   - Valor: Seu access token do Mercado Pago

### Passo 6: Testar

1. Reinicie o servidor: `npm run dev`
2. Acesse o site
3. Verifique o console - os erros devem ter sumido!

## 📋 Checklist

- [ ] Access Token obtido do Supabase
- [ ] Login feito com sucesso
- [ ] Projeto linkado
- [ ] Edge Functions deployadas
- [ ] Variáveis de ambiente configuradas
- [ ] Servidor reiniciado
- [ ] Console sem erros de CORS

## 🆘 Problemas?

### Erro: "not logged in"
- Repita o passo 2 com um token válido

### Erro: "project not found"
- Verifique se o project-ref está correto: `fflomlvtgaqbzrjnvqaz`

### Erros de CORS persistem
- Confirme que as Edge Functions foram deployadas: `supabase functions list`
- Confirme que as variáveis de ambiente estão configuradas

## 💡 Importante

Por enquanto, o site **está funcionando** com valores padrão (12 parcelas). Os erros no console são apenas avisos de que as Edge Functions não estão deployadas. O checkout funciona normalmente, mas sem as parcelas dinâmicas do Mercado Pago.

---

**Próximo:** Depois de completar estes passos, os erros vão sumir e o sistema vai buscar as parcelas reais da API do Mercado Pago.

