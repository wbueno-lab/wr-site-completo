# Script para configurar variáveis do Mercado Pago no Supabase
# Execute este script após obter suas credenciais do Mercado Pago

Write-Host "`n=== Configurar Variáveis do Mercado Pago ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar as credenciais
Write-Host "Digite sua MERCADO_PAGO_PUBLIC_KEY:" -ForegroundColor Yellow
$publicKey = Read-Host

Write-Host "`nDigite seu MERCADO_PAGO_ACCESS_TOKEN:" -ForegroundColor Yellow
$accessToken = Read-Host

Write-Host "`n`nConfigurando variáveis..." -ForegroundColor Cyan

# Configurar via Supabase CLI
npx supabase secrets set MERCADO_PAGO_PUBLIC_KEY="$publicKey"
npx supabase secrets set MERCADO_PAGO_ACCESS_TOKEN="$accessToken"

Write-Host "`n✅ Variáveis configuradas com sucesso!" -ForegroundColor Green
Write-Host "`nPróximo passo: npm run dev" -ForegroundColor Cyan
Write-Host ""

