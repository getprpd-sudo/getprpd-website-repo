@echo off
cd /d "%~dp0"
start "PRPD Business Center" cmd /c "node --env-file-if-exists=.env.local operations\cook-day-server.js"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4173/operations/business-center"
