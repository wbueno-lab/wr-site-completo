# 🚀 Passos Rápidos - Domínio Personalizado

## ⚡ Resumo Rápido

### 1. No Vercel (2 minutos)
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Settings → Domains
4. Add Domain → Digite seu domínio
5. Copie as configurações DNS mostradas

### 2. No Seu Provedor de Domínio (5 minutos)
1. Acesse o painel do seu domínio
2. Vá para configurações DNS
3. Adicione os registros mostrados pelo Vercel:
   ```
   Tipo: A
   Nome: @
   Valor: 76.76.19.61
   
   Tipo: A
   Nome: @  
   Valor: 76.76.21.61
   
   Tipo: CNAME
   Nome: www
   Valor: cname.vercel-dns.com
   ```

### 3. Aguardar (1-24 horas)
- DNS propaga automaticamente
- SSL é configurado automaticamente
- Site fica disponível em https://seu-dominio.com

## 🔧 Verificar se Funcionou

Execute no terminal:
```bash
node verificar-dominio.js seu-dominio.com
```

## 📱 Provedores Populares

### Registro.br (Brasil)
1. [registro.br](https://registro.br) → Login
2. Meus Domínios → Gerenciar DNS
3. Adicionar registros conforme Vercel

### GoDaddy
1. [godaddy.com](https://godaddy.com) → My Products
2. DNS → Manage
3. Adicionar registros conforme Vercel

### Namecheap
1. [namecheap.com](https://namecheap.com) → Domain List
2. Manage → Advanced DNS
3. Adicionar registros conforme Vercel

## ⚠️ Problemas Comuns

### Domínio não funciona
- Aguarde até 24h para propagação
- Verifique se os registros estão corretos
- Use `node verificar-dominio.js` para diagnosticar

### SSL não funciona
- Aguarde alguns minutos
- O Vercel configura SSL automaticamente
- Force HTTPS está habilitado por padrão

### www não funciona
- Adicione o registro CNAME para www
- Verifique se não há conflitos

## 🎯 Resultado Final

Após configurar, você terá:
- ✅ `https://seu-dominio.com` funcionando
- ✅ `https://www.seu-dominio.com` funcionando  
- ✅ SSL automático e gratuito
- ✅ Redirecionamento automático para HTTPS
- ✅ Performance otimizada do Vercel
