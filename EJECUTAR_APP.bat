@echo off
echo Iniciando PC Cotizador en Chrome...
echo Por favor, espera un momento.
start chrome "%~dp0index.html"
if %errorlevel% neq 0 (
    echo No se pudo encontrar Chrome. Intentando con el navegador predeterminado...
    start "" "%~dp0index.html"
)
exit
