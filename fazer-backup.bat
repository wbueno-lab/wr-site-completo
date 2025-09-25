@echo off
echo ========================================
echo    CRIANDO BACKUP DO PROJETO
echo ========================================
echo.

echo 1. Verificando status atual...
git status
echo.

echo 2. Adicionando todas as mudanças...
git add .
echo.

echo 3. Criando tag de backup com timestamp...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%"
set "tag=backup-%YYYY%-%MM%-%DD%-%HH%%Min%"

git tag -a "%tag%" -m "Backup automatico - %YYYY%-%MM%-%DD% %HH%:%Min%"
echo Tag criada: %tag%
echo.

echo 4. Fazendo commit das mudanças...
git commit -m "Backup: %tag%"
echo.

echo 5. Enviando backup para o GitHub...
git push origin main
git push origin "%tag%"
echo.

echo ========================================
echo    BACKUP CRIADO COM SUCESSO!
echo ========================================
echo Tag do backup: %tag%
echo Data: %YYYY%-%MM%-%DD% %HH%:%Min%
echo.
echo Para restaurar este backup:
echo git checkout %tag%
echo.
pause
