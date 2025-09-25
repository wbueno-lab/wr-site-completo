@echo off
echo ========================================
echo    ATUALIZANDO PROJETO NO GITHUB
echo ========================================
echo.

echo 1. Verificando status do Git...
git status
echo.

echo 2. Adicionando todas as mudanças...
git add .
echo.

echo 3. Fazendo commit com timestamp...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

git commit -m "Update: %timestamp%"
echo.

echo 4. Enviando para o GitHub...
git push origin main
echo.

echo ========================================
echo    ATUALIZACAO CONCLUIDA!
echo ========================================
pause
