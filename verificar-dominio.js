#!/usr/bin/env node

/**
 * Script para verificar configuração de domínio no Vercel
 * Execute: node verificar-dominio.js seu-dominio.com
 */

const https = require('https');
const dns = require('dns').promises;

async function verificarDominio(dominio) {
  console.log(`🔍 Verificando domínio: ${dominio}`);
  console.log('=' .repeat(50));

  try {
    // 1. Verificar se o domínio resolve
    console.log('1️⃣ Verificando resolução DNS...');
    const enderecos = await dns.resolve4(dominio);
    console.log(`✅ DNS resolve para: ${enderecos.join(', ')}`);

    // 2. Verificar se é um IP do Vercel
    const ipsVercel = ['76.76.19.61', '76.76.21.61'];
    const isVercel = enderecos.some(ip => ipsVercel.includes(ip));
    
    if (isVercel) {
      console.log('✅ Domínio aponta para Vercel');
    } else {
      console.log('⚠️ Domínio não aponta para Vercel');
    }

    // 3. Verificar HTTPS
    console.log('\n2️⃣ Verificando HTTPS...');
    await verificarHTTPS(dominio);

    // 4. Verificar www
    console.log('\n3️⃣ Verificando subdomínio www...');
    const wwwDominio = `www.${dominio}`;
    try {
      const wwwEnderecos = await dns.resolve4(wwwDominio);
      console.log(`✅ www.${dominio} resolve para: ${wwwEnderecos.join(', ')}`);
    } catch (error) {
      console.log(`⚠️ www.${dominio} não resolve`);
    }

    // 5. Verificar certificado SSL
    console.log('\n4️⃣ Verificando certificado SSL...');
    await verificarCertificadoSSL(dominio);

    console.log('\n🎉 Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar domínio:', error.message);
  }
}

function verificarHTTPS(dominio) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: dominio,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`✅ HTTPS funcionando - Status: ${res.statusCode}`);
      console.log(`✅ Servidor: ${res.headers.server || 'Desconhecido'}`);
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ HTTPS não funcionando: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('⏰ Timeout na verificação HTTPS');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

function verificarCertificadoSSL(dominio) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: dominio,
      port: 443,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      const cert = res.connection.getPeerCertificate();
      if (cert && cert.valid_to) {
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysLeft = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
        
        console.log(`✅ Certificado SSL válido até: ${validTo.toLocaleDateString()}`);
        console.log(`✅ Dias restantes: ${daysLeft}`);
        console.log(`✅ Emissor: ${cert.issuer?.CN || 'Desconhecido'}`);
      }
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ Erro no certificado SSL: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('⏰ Timeout na verificação do certificado');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Verificar se foi fornecido um domínio
const dominio = process.argv[2];

if (!dominio) {
  console.log('❌ Uso: node verificar-dominio.js seu-dominio.com');
  console.log('📝 Exemplo: node verificar-dominio.js meusite.com.br');
  process.exit(1);
}

// Validar formato do domínio
const dominioRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
if (!dominioRegex.test(dominio)) {
  console.log('❌ Formato de domínio inválido');
  console.log('📝 Use: meusite.com.br ou meusite.com');
  process.exit(1);
}

verificarDominio(dominio);
