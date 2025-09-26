@echo off
echo ========================================
echo    CRIANDO BACKUP SIMPLES
echo ========================================
echo.

echo 1. Verificando status...
git status
echo.

echo 2. Adicionando mudancas...
git add .
echo.

echo 3. Criando tag de backup...
set /a timestamp=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
set tag=backup-%timestamp%
git tag -a %tag% -m "Backup automatico"
echo Tag criada: %tag%
echo.

echo 4. Fazendo commit...
git commit -m "Backup: %tag%"
echo.

echo 5. Enviando para GitHub...
git push origin main
git push origin %tag%
echo.

echo ========================================
echo    BACKUP CRIADO COM SUCESSO!
echo ========================================
echo Tag: %tag%
echo.
echo Para restaurar: git checkout %tag%
echo.
pause
