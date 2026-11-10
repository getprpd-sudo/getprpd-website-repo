@echo off
setlocal
echo.
echo Checking every Batch 15 release gate...
echo.
node scripts\release-batch15.cjs
if errorlevel 1 (
  echo.
  echo RELEASE BLOCKED. Nothing was promoted or deployed.
  pause
  exit /b 1
)

echo.
echo Promoting the approved Batch 15 configuration locally...
echo.
node scripts\release-batch15.cjs --promote
if errorlevel 1 (
  echo.
  echo ERROR: Batch 15 could not be promoted. Nothing was deployed.
  pause
  exit /b 1
)

echo.
echo Running the release safety tests...
echo.
node --test tests\batch15-draft.test.js tests\security.test.js tests\order-success.test.js
if errorlevel 1 (
  echo.
  echo ERROR: Release tests failed. Nothing was deployed.
  pause
  exit /b 1
)

call deploy.bat
