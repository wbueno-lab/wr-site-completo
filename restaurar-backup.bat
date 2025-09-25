@echo off
echo ========================================
echo    RESTAURAR BACKUP
echo ========================================
echo.

echo Backups disponiveis:
git tag --list | findstr backup
echo.

set /p tag="Digite o nome da tag do backup (ex: backup-2025-09-25-0212): "

if "%tag%"=="" (
    echo Erro: Nome da tag nao pode estar vazio!
    pause
    exit /b 1
)

echo.
echo Restaurando backup: %tag%
echo.

echo 1. Verificando se a tag existe...
git tag --list | findstr "%tag%" >nul
if errorlevel 1 (
    echo ERRO: Tag '%tag%' nao encontrada!
    echo.
    echo Tags disponiveis:
    git tag --list | findstr backup
    pause
    exit /b 1
)

echo 2. Restaurando para o backup...
git checkout %tag%
echo.

echo ========================================
echo    BACKUP RESTAURADO COM SUCESSO!
echo ========================================
echo.
echo Voce esta agora no estado do backup: %tag%
echo.
echo Para voltar ao desenvolvimento atual:
echo git checkout main
echo.
pause
