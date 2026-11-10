@echo off
setlocal
set "ROOT=%~dp0"
set "PORT=4173"

pushd "%ROOT%"
python operations\nutrition\generate_production_data.py >nul
if errorlevel 1 (
  echo The current-batch recipe payload could not be generated. The planner was not opened with stale data.
  pause
  popd
  exit /b 1
)
popd

powershell -NoProfile -WindowStyle Hidden -Command "$port=%PORT%; if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) { Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'operations/cook-day-server.js' -WorkingDirectory '%ROOT%' }"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/operations/cook-day-planner.html"
endlocal
