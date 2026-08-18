@echo off
setlocal
set "PRPD_STUDIO_ROOT=%~dp0"
set "PRPD_STUDIO_PORT=4173"

pushd "%PRPD_STUDIO_ROOT%"
python operations\nutrition\verify_next_menu_labels.py
if errorlevel 1 (
  echo.
  echo LABEL STUDIO BLOCKED: generated labels do not match the active menu and controlled recipes.
  echo Update the recipe/config sources, regenerate labels, and rerun this launcher.
  pause
  popd
  exit /b 1
)
popd

powershell -NoProfile -WindowStyle Hidden -Command "$url='http://127.0.0.1:%PRPD_STUDIO_PORT%/operations/label-studio.html'; try { $ready=(Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2).StatusCode -eq 200 } catch { $ready=$false }; if (-not $ready) { $listener=Get-NetTCPConnection -LocalPort %PRPD_STUDIO_PORT% -State Listen -ErrorAction SilentlyContinue; if ($listener) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 300 }; Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'operations/cook-day-server.js' -WorkingDirectory '%PRPD_STUDIO_ROOT%'; for ($i=0; $i -lt 20; $i++) { Start-Sleep -Milliseconds 250; try { if ((Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2).StatusCode -eq 200) { break } } catch {} } }; Start-Process $url"
endlocal
