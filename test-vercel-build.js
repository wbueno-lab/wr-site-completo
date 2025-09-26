#!/usr/bin/env node

/**
 * Script para testar se o build do Vercel funcionará corretamente
 * Execute: node test-vercel-build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Testando configuração para Vercel...');
console.log('=' .repeat(50));

// 1. Verificar se vercel.json existe e está correto
console.log('1️⃣ Verificando vercel.json...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  // Verificar se tem as rotas necessárias
  const hasSPARoute = vercelConfig.routes?.some(route => 
    route.src === '/(.*)' && route.dest === '/index.html'
  );
  
  if (hasSPARoute) {
    console.log('✅ vercel.json configurado corretamente para SPA');
  } else {
    console.log('❌ vercel.json não tem rota SPA configurada');
  }
  
  // Verificar se tem configuração de assets
  const hasAssetsRoute = vercelConfig.routes?.some(route => 
    route.src?.includes('assets') || route.src?.includes('\\.(js|css|png|jpg)')
  );
  
  if (hasAssetsRoute) {
    console.log('✅ Configuração de assets encontrada');
  } else {
    console.log('⚠️ Configuração de assets pode estar incompleta');
  }
  
} catch (error) {
  console.log('❌ Erro ao ler vercel.json:', error.message);
}

// 2. Verificar se _redirects existe
console.log('\n2️⃣ Verificando _redirects...');
const redirectsPath = path.join('public', '_redirects');
if (fs.existsSync(redirectsPath)) {
  console.log('✅ Arquivo _redirects encontrado');
} else {
  console.log('❌ Arquivo _redirects não encontrado');
}

// 3. Verificar package.json
console.log('\n3️⃣ Verificando package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts?.build) {
    console.log('✅ Script de build encontrado');
  } else {
    console.log('❌ Script de build não encontrado');
  }
  
  if (packageJson.scripts?.['vercel-build']) {
    console.log('✅ Script vercel-build encontrado');
  } else {
    console.log('⚠️ Script vercel-build não encontrado (opcional)');
  }
  
} catch (error) {
  console.log('❌ Erro ao ler package.json:', error.message);
}

// 4. Verificar se dist/ existe (após build)
console.log('\n4️⃣ Verificando pasta dist...');
if (fs.existsSync('dist')) {
  console.log('✅ Pasta dist encontrada');
  
  // Verificar se tem index.html
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ index.html encontrado');
  } else {
    console.log('❌ index.html não encontrado');
  }
  
  // Verificar se tem assets
  if (fs.existsSync('dist/assets')) {
    console.log('✅ Pasta assets encontrada');
  } else {
    console.log('⚠️ Pasta assets não encontrada');
  }
  
} else {
  console.log('⚠️ Pasta dist não encontrada - execute npm run build primeiro');
}

// 5. Verificar configuração do Vite
console.log('\n5️⃣ Verificando vite.config.ts...');
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  
  if (viteConfig.includes('build:')) {
    console.log('✅ Configuração de build encontrada');
  } else {
    console.log('⚠️ Configuração de build pode estar incompleta');
  }
  
  if (viteConfig.includes('rollupOptions')) {
    console.log('✅ Rollup options configuradas');
  } else {
    console.log('⚠️ Rollup options não configuradas');
  }
  
} catch (error) {
  console.log('❌ Erro ao ler vite.config.ts:', error.message);
}

// 6. Testar build (se não existir dist)
console.log('\n6️⃣ Testando build...');
if (!fs.existsSync('dist')) {
  try {
    console.log('Executando npm run build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build executado com sucesso');
  } catch (error) {
    console.log('❌ Erro no build:', error.message);
  }
} else {
  console.log('✅ Build já existe');
}

// 7. Verificar se há erros de sintaxe
console.log('\n7️⃣ Verificando erros de sintaxe...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ Sem erros de linting');
} catch (error) {
  console.log('⚠️ Erros de linting encontrados (pode não afetar o deploy)');
}

console.log('\n🎉 Verificação concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Faça commit das alterações');
console.log('2. Push para o GitHub');
console.log('3. Aguarde o redeploy no Vercel');
console.log('4. Teste todas as rotas do seu site');
