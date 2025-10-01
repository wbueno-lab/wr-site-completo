# Script PowerShell para Reiniciar o Servidor e Limpar Cache
# Execute: Right-click > "Run with PowerShell"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  WR CAPACETES - REINICIALIZAÇÃO LIMPA" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Parar processos Node
Write-Host "[1/4] Parando processos Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "      Processos Node parados!" -ForegroundColor Green
Write-Host ""

# Passo 2: Limpar cache do Vite
Write-Host "[2/4] Limpando cache do Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "      Cache do Vite removido!" -ForegroundColor Green
} else {
    Write-Host "      Nenhum cache do Vite encontrado." -ForegroundColor Gray
}
Write-Host ""

# Passo 3: Limpar dist (opcional)
Write-Host "[3/4] Limpando pasta dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "      Pasta dist removida!" -ForegroundColor Green
} else {
    Write-Host "      Nenhuma pasta dist encontrada." -ForegroundColor Gray
}
Write-Host ""

# Passo 4: Iniciar servidor
Write-Host "[4/4] Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SERVIDOR INICIANDO..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Agora faça isso no navegador:" -ForegroundColor Red
Write-Host ""
Write-Host "  1. Feche TODAS as abas do localhost" -ForegroundColor Yellow
Write-Host "  2. Pressione: Ctrl + Shift + Delete" -ForegroundColor Yellow
Write-Host "  3. Marque: 'Imagens e arquivos em cache'" -ForegroundColor Yellow
Write-Host "  4. Clique: 'Limpar dados'" -ForegroundColor Yellow
Write-Host "  5. Abra uma NOVA aba" -ForegroundColor Yellow
Write-Host "  6. Acesse: http://localhost:8080" -ForegroundColor Yellow
Write-Host "  7. Pressione: Ctrl + F5" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar npm run dev
npm run dev

