# Script para criar backup do projeto
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CRIANDO BACKUP DO PROJETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando status atual..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "2. Adicionando todas as mudanças..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "3. Criando tag de backup com timestamp..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$tag = "backup-$timestamp"
$dateTime = Get-Date -Format "yyyy-MM-dd HH:mm"

git tag -a $tag -m "Backup automatico - $dateTime"
Write-Host "Tag criada: $tag" -ForegroundColor Green
Write-Host ""

Write-Host "4. Fazendo commit das mudanças..." -ForegroundColor Yellow
git commit -m "Backup: $tag"
Write-Host ""

Write-Host "5. Enviando backup para o GitHub..." -ForegroundColor Yellow
git push origin main
git push origin $tag
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "    BACKUP CRIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tag do backup: $tag" -ForegroundColor Cyan
Write-Host "Data: $dateTime" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para restaurar este backup:" -ForegroundColor Yellow
Write-Host "git checkout $tag" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
