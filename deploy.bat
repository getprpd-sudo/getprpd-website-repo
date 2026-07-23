@echo off
setlocal
echo.
echo Linking this folder to the canonical PRPD production project...
echo.
call vercel link --yes --project getprpd --scope rida-khan-s-projects
if errorlevel 1 (
  echo.
  echo ERROR: Could not link to rida-khan-s-projects/getprpd. Nothing was deployed.
  pause
  exit /b 1
)

echo.
echo Deploying PRPD to production...
echo.
call vercel --prod --scope rida-khan-s-projects
if errorlevel 1 (
  echo.
  echo ERROR: Production deployment failed.
  pause
  exit /b 1
)
echo.
echo Done. Check getprpd.com in ~30 seconds.
pause
