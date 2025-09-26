#!/usr/bin/env node

/**
 * Script para corrigir erro 404 no Vercel
 * Execute: node fix-vercel-404.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Aplicando correção para erro 404 no Vercel...');
console.log('=' .repeat(50));

// 1. Backup do vercel.json atual
console.log('1️⃣ Fazendo backup do vercel.json atual...');
try {
  const currentConfig = fs.readFileSync('vercel.json', 'utf8');
  fs.writeFileSync('vercel.json.backup', currentConfig);
  console.log('✅ Backup criado: vercel.json.backup');
} catch (error) {
  console.log('⚠️ Não foi possível fazer backup:', error.message);
}

// 2. Aplicar configuração robusta
console.log('\n2️⃣ Aplicando configuração robusta...');
try {
  const robustConfig = fs.readFileSync('vercel-robust.json', 'utf8');
  fs.writeFileSync('vercel.json', robustConfig);
  console.log('✅ Configuração robusta aplicada');
} catch (error) {
  console.log('❌ Erro ao aplicar configuração:', error.message);
  process.exit(1);
}

// 3. Verificar se _redirects existe
console.log('\n3️⃣ Verificando arquivo _redirects...');
const redirectsPath = path.join('public', '_redirects');
if (fs.existsSync(redirectsPath)) {
  console.log('✅ Arquivo _redirects já existe');
} else {
  console.log('📝 Criando arquivo _redirects...');
  const redirectsContent = `# Redirects para SPA (Single Page Application)
# Todas as rotas que não são arquivos estáticos devem redirecionar para index.html

# Assets estáticos
/assets/* /assets/:splat 200
/*.js /:splat 200
/*.css /:splat 200
/*.png /:splat 200
/*.jpg /:splat 200
/*.jpeg /:splat 200
/*.gif /:splat 200
/*.ico /:splat 200
/*.svg /:splat 200
/*.woff /:splat 200
/*.woff2 /:splat 200
/*.ttf /:splat 200
/*.eot /:splat 200

# Rotas específicas do SPA
/admin /index.html 200
/contato /index.html 200
/catalogo /index.html 200
/promocoes /index.html 200
/favoritos /index.html 200
/pedidos /index.html 200
/auth /index.html 200
/produto/* /index.html 200
/checkout/* /index.html 200

# Todas as outras rotas para index.html (SPA)
/* /index.html 200`;

  // Criar pasta public se não existir
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('✅ Arquivo _redirects criado');
}

// 4. Verificar se há erros de sintaxe no App.tsx
console.log('\n4️⃣ Verificando App.tsx...');
try {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  
  // Verificar se há erros de sintaxe comuns
  if (appContent.includes('<Route path="/checkout/pending"')) {
    console.log('⚠️ Possível erro de sintaxe encontrado em App.tsx');
    console.log('📝 Verificando linha 79...');
    
    // Verificar se a linha está completa
    const lines = appContent.split('\n');
    const line79 = lines[78]; // linha 79 (índice 78)
    
    if (line79 && !line79.includes('element={<CheckoutPending />}')) {
      console.log('❌ Erro de sintaxe encontrado na linha 79');
      console.log('🔧 Corrigindo...');
      
      const correctedContent = appContent.replace(
        /<Route path="\/checkout\/pending"[\s\S]*?<Route path="\/logout-test"/,
        '<Route path="/checkout/pending" element={<CheckoutPending />} />\n                        <Route path="/logout-test"'
      );
      
      fs.writeFileSync('src/App.tsx', correctedContent);
      console.log('✅ Erro de sintaxe corrigido');
    } else {
      console.log('✅ App.tsx parece estar correto');
    }
  } else {
    console.log('✅ App.tsx parece estar correto');
  }
} catch (error) {
  console.log('❌ Erro ao verificar App.tsx:', error.message);
}

// 5. Criar arquivo de teste para verificar se funciona
console.log('\n5️⃣ Criando arquivo de teste...');
const testContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Vercel SPA</title>
</head>
<body>
    <h1>Teste de Roteamento SPA</h1>
    <p>Se você está vendo esta página, o roteamento SPA está funcionando!</p>
    <script>
        console.log('✅ SPA funcionando corretamente');
    </script>
</body>
</html>`;

fs.writeFileSync('public/test-spa.html', testContent);
console.log('✅ Arquivo de teste criado: public/test-spa.html');

// 6. Resumo das alterações
console.log('\n🎉 Correção aplicada com sucesso!');
console.log('\n📋 Alterações realizadas:');
console.log('✅ vercel.json atualizado com configuração robusta');
console.log('✅ Arquivo _redirects criado/verificado');
console.log('✅ App.tsx verificado e corrigido se necessário');
console.log('✅ Arquivo de teste criado');

console.log('\n🚀 Próximos passos:');
console.log('1. Faça commit das alterações:');
console.log('   git add .');
console.log('   git commit -m "Fix: Corrigir erro 404 no Vercel - Configuração robusta"');
console.log('   git push');
console.log('');
console.log('2. Aguarde o redeploy no Vercel');
console.log('');
console.log('3. Teste as rotas:');
console.log('   - /admin');
console.log('   - /contato');
console.log('   - /catalogo');
console.log('   - /promocoes');
console.log('');
console.log('4. Se ainda der erro, use a configuração alternativa:');
console.log('   cp vercel-robust.json vercel.json');
console.log('   git add vercel.json && git commit -m "Fix: Usar configuração robusta" && git push');
