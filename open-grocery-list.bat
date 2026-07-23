@echo off
setlocal
set "ROOT=%~dp0"
set "PORT=4173"

powershell -NoProfile -WindowStyle Hidden -Command "$url='http://127.0.0.1:%PORT%/operations/grocery-list.html'; try { $ready=(Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2).StatusCode -eq 200 } catch { $ready=$false }; if (-not $ready) { $listener=Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if ($listener) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 300 }; Start-Process -WindowStyle Hidden -FilePath node -ArgumentList 'operations/cook-day-server.js' -WorkingDirectory '%ROOT%'; for ($i=0; $i -lt 20; $i++) { Start-Sleep -Milliseconds 250; try { if ((Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2).StatusCode -eq 200) { break } } catch {} } }; Start-Process $url"
endlocal
