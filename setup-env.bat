@echo off
REM ===========================================
REM Portfolio Development Setup Script (Windows)
REM ===========================================

echo 🚀 Configurando Portfolio para desarrollo...
echo.

REM Verificar si .env ya existe
if exist ".env" (
    echo ⚠️ El archivo .env ya existe.
    set /p overwrite="¿Quieres sobrescribirlo? (y/N): "
    if /i not "%overwrite%"=="y" (
        echo ❌ Configuración cancelada
        pause
        exit /b 1
    )
)

REM Pedir variables al usuario
echo 🔐 Ingresa las variables de entorno:
echo.

set /p PORTFOLIO_TOKEN="PORTFOLIO_TOKEN: "
set /p N8N_WEBHOOK_URL="N8N_WEBHOOK_URL: "

REM Crear archivo .env
(
echo PORTFOLIO_TOKEN=%PORTFOLIO_TOKEN%
echo N8N_WEBHOOK_URL=%N8N_WEBHOOK_URL%
) > .env

echo.
echo ✅ Archivo .env creado correctamente!
echo 🛠️ Ejecuta 'npm run dev' para desarrollar con Netlify Functions
echo 📦 O ejecuta 'npm start' para desarrollo solo Angular
pause