# Script para Configurar Credenciais do Mercado Pago no Supabase
# Execute este script para configurar as credenciais corretamente

Write-Host "`n=== Configuração de Credenciais Mercado Pago ===" -ForegroundColor Cyan
Write-Host "Este script vai configurar as credenciais no Supabase`n" -ForegroundColor Yellow

# Solicitar credenciais
Write-Host "Cole suas credenciais do Mercado Pago abaixo:" -ForegroundColor Cyan
Write-Host "(Obtenha em: https://www.mercadopago.com.br/developers/panel/app)`n" -ForegroundColor Gray

Write-Host "1. Public Key (TEST-... ou APP-...):" -ForegroundColor Yellow
$publicKey = Read-Host "   "

Write-Host "`n2. Access Token (TEST-... ou APP-...):" -ForegroundColor Yellow
$accessToken = Read-Host "   " -AsSecureString
$accessTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($accessToken)
)

if ([string]::IsNullOrWhiteSpace($publicKey) -or [string]::IsNullOrWhiteSpace($accessTokenPlain)) {
    Write-Host "`n❌ Erro: Você precisa fornecer ambas as credenciais!" -ForegroundColor Red
    exit 1
}

# Detectar tipo de credencial
$isTest = $publicKey.StartsWith("TEST-") -or $accessTokenPlain.StartsWith("TEST-")
$credType = if ($isTest) { "TESTE" } else { "PRODUÇÃO" }

Write-Host "`n✅ Credenciais de $credType detectadas" -ForegroundColor Green

# Confirmar
Write-Host "`nDeseja configurar estas credenciais no Supabase?" -ForegroundColor Yellow
Write-Host "  Tipo: $credType" -ForegroundColor White
Write-Host "  Public Key: $($publicKey.Substring(0, [Math]::Min(20, $publicKey.Length)))..." -ForegroundColor White
$confirm = Read-Host "`nConfirmar? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Cancelado pelo usuário" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n=== Configurando no Supabase ===" -ForegroundColor Cyan

# Configurar Public Key
Write-Host "`n1. Configurando MERCADO_PAGO_PUBLIC_KEY..." -ForegroundColor Yellow
try {
    $output1 = & "$env:USERPROFILE\scoop\shims\supabase.exe" secrets set MERCADO_PAGO_PUBLIC_KEY="$publicKey" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Public Key configurada!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Possível erro: $output1" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erro: $_" -ForegroundColor Red
}

# Configurar Access Token
Write-Host "`n2. Configurando MERCADO_PAGO_ACCESS_TOKEN..." -ForegroundColor Yellow
try {
    $output2 = & "$env:USERPROFILE\scoop\shims\supabase.exe" secrets set MERCADO_PAGO_ACCESS_TOKEN="$accessTokenPlain" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Access Token configurado!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Possível erro: $output2" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erro: $_" -ForegroundColor Red
}

# Verificar configuração
Write-Host "`n=== Verificando Configuração ===" -ForegroundColor Cyan
try {
    $secrets = & "$env:USERPROFILE\scoop\shims\supabase.exe" secrets list 2>&1
    Write-Host $secrets
} catch {
    Write-Host "⚠️ Não foi possível verificar os secrets" -ForegroundColor Yellow
}

Write-Host "`n=== Configuração Concluída! ===" -ForegroundColor Green
Write-Host "`n📋 Próximos Passos:" -ForegroundColor Cyan
Write-Host "  1. As credenciais foram configuradas no Supabase" -ForegroundColor White
Write-Host "  2. Aguarde 1-2 minutos para as variáveis serem aplicadas" -ForegroundColor White
Write-Host "  3. Limpe o cache do navegador: Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "  4. Acesse o site e tente gerar o PIX novamente" -ForegroundColor White
Write-Host "  5. Verifique os logs: https://supabase.com/dashboard/project/fflomlvtgaqbzrjnvqaz/functions`n" -ForegroundColor White

if ($isTest) {
    Write-Host "💡 Dica: Você está usando credenciais de TESTE" -ForegroundColor Yellow
    Write-Host "   - Isso é perfeito para testar sem preocupações!" -ForegroundColor Yellow
    Write-Host "   - Quando for para produção, repita este processo com credenciais de produção`n" -ForegroundColor Yellow
}

Write-Host "✅ Tudo pronto! Teste agora! 🚀`n" -ForegroundColor Green

