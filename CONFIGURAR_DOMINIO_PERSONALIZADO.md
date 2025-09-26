# Como Configurar Domínio Personalizado no Vercel

## Pré-requisitos

1. ✅ Projeto já deployado no Vercel
2. 🌐 Domínio registrado (ex: GoDaddy, Namecheap, Registro.br, etc.)
3. 📧 Acesso ao painel de controle do seu domínio

## Passo a Passo

### 1. Adicionar Domínio no Vercel

1. **Acesse o painel do Vercel:**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione seu projeto

2. **Vá para Settings:**
   - Clique em "Settings" na barra lateral
   - Clique em "Domains" no menu

3. **Adicione seu domínio:**
   - Clique em "Add Domain"
   - Digite seu domínio (ex: `meusite.com`)
   - Clique em "Add"

### 2. Configurar DNS

O Vercel mostrará as configurações DNS necessárias. Você terá duas opções:

#### Opção A: Usar Subdomínio (Mais Fácil)
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

#### Opção B: Usar Domínio Principal (Recomendado)
```
Tipo: A
Nome: @
Valor: 76.76.19.61

Tipo: A  
Nome: @
Valor: 76.76.21.61
```

### 3. Configurar no Seu Provedor de Domínio

#### Para Registro.br (Brasil):
1. Acesse [registro.br](https://registro.br)
2. Faça login na sua conta
3. Vá para "Meus Domínios"
4. Clique em "Gerenciar DNS"
5. Adicione os registros conforme mostrado pelo Vercel

#### Para GoDaddy:
1. Acesse [godaddy.com](https://godaddy.com)
2. Vá para "My Products"
3. Clique em "DNS" ao lado do seu domínio
4. Adicione os registros conforme mostrado pelo Vercel

#### Para Namecheap:
1. Acesse [namecheap.com](https://namecheap.com)
2. Vá para "Domain List"
3. Clique em "Manage" ao lado do seu domínio
4. Vá para "Advanced DNS"
5. Adicione os registros conforme mostrado pelo Vercel

### 4. Verificar Configuração

1. **No Vercel:**
   - Aguarde alguns minutos
   - O status mudará de "Pending" para "Valid"
   - Você verá um ✅ verde

2. **Teste seu domínio:**
   - Acesse `https://seu-dominio.com`
   - Deve carregar seu site

## Configurações Avançadas

### SSL Automático
- O Vercel fornece SSL gratuito automaticamente
- Certificado Let's Encrypt renovado automaticamente
- HTTPS habilitado por padrão

### Redirecionamentos
- `www.seu-dominio.com` → `seu-dominio.com`
- `http://` → `https://`
- Configurado automaticamente

### Subdomínios
Para criar subdomínios (ex: `blog.seu-dominio.com`):
1. Adicione o subdomínio no Vercel
2. Configure DNS:
   ```
   Tipo: CNAME
   Nome: blog
   Valor: cname.vercel-dns.com
   ```

## Troubleshooting

### Domínio não funciona
1. **Verifique DNS:**
   - Use [whatsmydns.net](https://whatsmydns.net)
   - Digite seu domínio
   - Verifique se os registros estão propagados

2. **Aguarde propagação:**
   - DNS pode levar até 48h para propagar
   - Geralmente funciona em 1-2 horas

3. **Verifique configuração:**
   - Confirme se os registros estão corretos
   - Verifique se não há erros de digitação

### Erro de SSL
1. **Aguarde certificado:**
   - SSL é gerado automaticamente
   - Pode levar alguns minutos

2. **Force HTTPS:**
   - O Vercel força HTTPS automaticamente
   - Não é necessário configuração adicional

### Domínio não aparece
1. **Verifique permissões:**
   - Certifique-se de que você é o proprietário do domínio
   - Verifique se não há conflitos

2. **Limpe cache:**
   - Limpe cache do navegador
   - Tente em modo incógnito

## Exemplos de Configuração

### Exemplo 1: Domínio Principal
```
Domínio: meusite.com.br
DNS:
- A @ 76.76.19.61
- A @ 76.76.21.61
- CNAME www cname.vercel-dns.com
```

### Exemplo 2: Apenas Subdomínio
```
Domínio: www.meusite.com.br
DNS:
- CNAME www cname.vercel-dns.com
```

### Exemplo 3: Múltiplos Subdomínios
```
Domínio: meusite.com.br
Subdomínios:
- www.meusite.com.br
- blog.meusite.com.br
- api.meusite.com.br

DNS:
- A @ 76.76.19.61
- A @ 76.76.21.61
- CNAME www cname.vercel-dns.com
- CNAME blog cname.vercel-dns.com
- CNAME api cname.vercel-dns.com
```

## Dicas Importantes

1. **Backup:**
   - Sempre faça backup das configurações DNS atuais
   - Anote os registros existentes antes de alterar

2. **Teste:**
   - Teste em diferentes navegadores
   - Verifique em dispositivos móveis

3. **Monitoramento:**
   - Use ferramentas como [GTmetrix](https://gtmetrix.com)
   - Monitore performance e disponibilidade

4. **Segurança:**
   - Mantenha registros DNS seguros
   - Use autenticação de dois fatores no provedor de domínio

## Suporte

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Documentação:** [vercel.com/docs](https://vercel.com/docs)
- **Status:** [vercel-status.com](https://vercel-status.com)
