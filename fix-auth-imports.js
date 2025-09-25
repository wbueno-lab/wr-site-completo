// Script para corrigir todas as importações do SimpleAuthContext para UnifiedAuthContext
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'src/components/LogoutTest.tsx',
  'src/components/UserMessagesCenter.tsx',
  'src/components/CartDrawer.tsx',
  'src/components/ForceQualityProductCard.tsx',
  'src/pages/AdminPage.tsx',
  'src/pages/ProductDetailPage.tsx',
  'src/components/HeaderWrapper.tsx',
  'src/components/AdminProfileFix.tsx',
  'src/hooks/useFirstVisit.tsx',
  'src/components/ProductReviews.tsx',
  'src/lib/imports.ts',
  'src/components/AdminDebugAdvanced.tsx',
  'src/components/AdminBypass.tsx',
  'src/components/ForceAdminSync.tsx',
  'src/components/AdminDiagnostic.tsx',
  'src/components/QuickAdminTest.tsx',
  'src/components/SimpleAdminDebug.tsx',
  'src/components/ProductCard.tsx',
  'src/components/NavigationTest.tsx',
  'src/components/ProfileDebugger.tsx',
  'src/components/CartDebugger.tsx',
  'src/components/SimpleProductCard.tsx',
  'src/components/QuickViewModal.tsx'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Substituir importações do SimpleAuthContext
    const oldImport = /import\s*{\s*useAuth\s*}\s*from\s*['"]@?\/?contexts\/SimpleAuthContext['"];?/g;
    const newImport = 'import { useAuth } from \'@/contexts/UnifiedAuthContext\';';
    
    if (oldImport.test(content)) {
      content = content.replace(oldImport, newImport);
      modified = true;
    }

    // Substituir importações relativas
    const oldRelativeImport = /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\/SimpleAuthContext['"];?/g;
    if (oldRelativeImport.test(content)) {
      content = content.replace(oldRelativeImport, newImport);
      modified = true;
    }

    // Substituir importações com caminho completo
    const oldFullImport = /import\s*{\s*useAuth\s*}\s*from\s*['"]@\/contexts\/SimpleAuthContext['"];?/g;
    if (oldFullImport.test(content)) {
      content = content.replace(oldFullImport, newImport);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
    } else {
      console.log(`ℹ️ Nenhuma alteração necessária: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

console.log('🔧 Iniciando correção das importações de autenticação...\n');

filesToFix.forEach(fixFile);

console.log('\n🎉 Correção concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Verificar se não há erros de linting');
console.log('2. Testar a aplicação');
console.log('3. Verificar se os erros de console foram resolvidos');
