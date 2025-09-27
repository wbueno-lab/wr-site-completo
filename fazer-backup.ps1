# Script de Backup Automatico para o Projeto WR Capacetes
# Criado em: $(Get-Date -Format "dd/MM/yyyy HH:mm")

Write-Host "Iniciando backup do projeto WR Capacetes..." -ForegroundColor Green

# Verificar se estamos em um repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "Erro: Este nao e um repositorio Git!" -ForegroundColor Red
    exit 1
}

# Verificar status do Git
Write-Host "Verificando status do repositorio..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "Arquivos modificados encontrados:" -ForegroundColor Cyan
    git status --short
    
    # Adicionar todos os arquivos
    Write-Host "Adicionando arquivos ao staging..." -ForegroundColor Yellow
    git add .
    
    if ($LASTEXITCODE -eq 0) {
        # Fazer commit
        $commitMessage = "Backup automatico - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
        Write-Host "Fazendo commit das alteracoes..." -ForegroundColor Yellow
        git commit -m $commitMessage
        
        if ($LASTEXITCODE -eq 0) {
            # Fazer push
            Write-Host "Enviando para o GitHub..." -ForegroundColor Yellow
            git push origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Backup realizado com sucesso!" -ForegroundColor Green
                Write-Host "Repositorio: https://github.com/wbueno-lab/wr-site-completo.git" -ForegroundColor Blue
            } else {
                Write-Host "Erro ao fazer push para o GitHub!" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Erro ao fazer commit!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Erro ao adicionar arquivos!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Nenhuma alteracao pendente. Repositorio ja esta atualizado!" -ForegroundColor Green
}

Write-Host "Processo de backup concluido!" -ForegroundColor Green
