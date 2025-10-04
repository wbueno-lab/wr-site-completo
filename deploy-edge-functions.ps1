# Script para Deploy das Edge Functions
# Este script faz o deploy de todas as Edge Functions necessárias para o Mercado Pago

Write-Host "`n=== Deploy de Edge Functions ===" -ForegroundColor Cyan
Write-Host "Este script irá fazer o deploy de todas as Edge Functions necessárias`n" -ForegroundColor Yellow

# Verificar se Supabase CLI está instalado
Write-Host "Verificando Supabase CLI..." -ForegroundColor Cyan
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g supabase`n" -ForegroundColor Yellow
    exit 1
}

# Verificar se está logado no Supabase
Write-Host "Verificando login no Supabase..." -ForegroundColor Cyan
try {
    $loginCheck = supabase projects list 2>&1
    if ($loginCheck -match "not logged in" -or $loginCheck -match "no access token") {
        Write-Host "❌ Você não está logado no Supabase!" -ForegroundColor Red
        Write-Host "Faça login com: supabase login`n" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Você está logado no Supabase`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível verificar o login" -ForegroundColor Yellow
}

# Listar as Edge Functions disponíveis
Write-Host "Edge Functions disponíveis para deploy:" -ForegroundColor Cyan
$functions = @(
    "mercado-pago-get-installments",
    "mercado-pago-process-payment",
    "mercado-pago-check-payment",
    "mercado-pago-webhook",
    "correios-proxy",
    "create-order",
    "send-notification",
    "update-profile"
)

foreach ($func in $functions) {
    Write-Host "  - $func" -ForegroundColor White
}

Write-Host ""
$response = Read-Host "Deseja fazer o deploy de todas as funções? (S/N)"

if ($response -ne "S" -and $response -ne "s") {
    Write-Host "Deploy cancelado pelo usuário" -ForegroundColor Yellow
    exit 0
}

Write-Host "`nIniciando deploy das Edge Functions...`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$results = @()

foreach ($func in $functions) {
    Write-Host "Deployando $func..." -ForegroundColor Yellow
    
    $funcPath = "supabase\functions\$func"
    
    if (-Not (Test-Path $funcPath)) {
        Write-Host "  ⚠️ Função não encontrada em $funcPath - Pulando" -ForegroundColor DarkYellow
        $results += @{
            Function = $func
            Status = "Skipped"
            Message = "Diretório não encontrado"
        }
        continue
    }
    
    try {
        $output = supabase functions deploy $func --no-verify-jwt 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $func deployado com sucesso!" -ForegroundColor Green
            $successCount++
            $results += @{
                Function = $func
                Status = "Success"
                Message = "Deploy bem-sucedido"
            }
        } else {
            Write-Host "  ❌ Erro ao deployar $func" -ForegroundColor Red
            Write-Host "  Erro: $output" -ForegroundColor DarkRed
            $failCount++
            $results += @{
                Function = $func
                Status = "Failed"
                Message = $output
            }
        }
    } catch {
        Write-Host "  ❌ Exceção ao deployar $func" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor DarkRed
        $failCount++
        $results += @{
            Function = $func
            Status = "Error"
            Message = $_.Exception.Message
        }
    }
    
    Write-Host ""
}

# Resumo
Write-Host "`n=== Resumo do Deploy ===" -ForegroundColor Cyan
Write-Host "✅ Sucesso: $successCount" -ForegroundColor Green
Write-Host "❌ Falhas: $failCount" -ForegroundColor Red
Write-Host "⚠️ Puladas: $($results | Where-Object { $_.Status -eq "Skipped" } | Measure-Object).Count`n" -ForegroundColor Yellow

# Tabela de resultados
Write-Host "Detalhes:" -ForegroundColor Cyan
foreach ($result in $results) {
    $color = switch ($result.Status) {
        "Success" { "Green" }
        "Failed" { "Red" }
        "Error" { "Red" }
        "Skipped" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "  $($result.Function.PadRight(40)) " -NoNewline
    Write-Host "[$($result.Status)]" -ForegroundColor $color
}

Write-Host "`n=== Verificando Variáveis de Ambiente ===" -ForegroundColor Cyan
Write-Host "Não esqueça de configurar as seguintes variáveis no Supabase:" -ForegroundColor Yellow
Write-Host "  - MERCADO_PAGO_PUBLIC_KEY" -ForegroundColor White
Write-Host "  - MERCADO_PAGO_ACCESS_TOKEN" -ForegroundColor White
Write-Host "`nConfigurar em: https://supabase.com/dashboard/project/_/settings/functions`n" -ForegroundColor Cyan

# Verificar status das funções
Write-Host "=== Listando Edge Functions Deployadas ===" -ForegroundColor Cyan
try {
    supabase functions list
} catch {
    Write-Host "⚠️ Não foi possível listar as funções" -ForegroundColor Yellow
}

Write-Host "`n=== Deploy Concluído ===" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "✅ Todas as funções foram deployadas com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Configure as variáveis de ambiente no Supabase" -ForegroundColor White
    Write-Host "  2. Reinicie o servidor de desenvolvimento: npm run dev" -ForegroundColor White
    Write-Host "  3. Teste o fluxo de pagamento" -ForegroundColor White
} else {
    Write-Host "⚠️ Algumas funções falharam no deploy. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host ""










