# Script para atualizar o GitHub automaticamente
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ATUALIZANDO PROJETO NO GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando status do Git..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "2. Adicionando todas as mudanças..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "3. Fazendo commit com timestamp..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Update: $timestamp"
Write-Host ""

Write-Host "4. Enviando para o GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "    ATUALIZACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
