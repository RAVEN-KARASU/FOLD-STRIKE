@echo off
setlocal
cd /d "%~dp0"
echo FOLD//STRIKE - Molecular Arcade
echo Abre http://127.0.0.1:8000 en tu navegador.
echo Cierra esta ventana o pulsa Ctrl+C para detener el servidor.
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" serve.py --port 8000 --bind 0.0.0.0
) else (
  py -3 serve.py --port 8000 --bind 0.0.0.0
)
pause
