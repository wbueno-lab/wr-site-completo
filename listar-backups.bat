@echo off
echo ========================================
echo    LISTANDO BACKUPS DISPONIVEIS
echo ========================================
echo.

echo Tags de backup disponiveis:
git tag --list | findstr backup
echo.

echo Para restaurar um backup, use:
echo git checkout NOME-DA-TAG
echo.
echo Exemplo:
echo git checkout backup-2025-09-25-0212
echo.

echo Para ver detalhes de um backup:
echo git show NOME-DA-TAG
echo.

pause
