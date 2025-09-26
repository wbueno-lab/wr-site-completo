@echo off
echo ========================================
echo    BACKUPS DISPONIVEIS
echo ========================================
echo.

echo Tags de backup:
git tag --list
echo.

echo Para restaurar um backup:
echo git checkout NOME-DA-TAG
echo.
echo Exemplo:
echo git checkout backup-20250925_0212
echo.
pause
