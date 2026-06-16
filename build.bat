@echo off
setlocal
cd /d "%~dp0"

title CourtFlow - Production Build

echo.
echo  CourtFlow - Building for production (App Router)...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  ERROR: Node.js is not installed or not on PATH.
  echo  Install Node 20+ from https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo  ERROR: npm install failed.
    pause
    exit /b 1
  )
  echo.
)

echo  Running: npm run build
echo  (Next.js App Router - app/ directory)
echo.

call npm run build

if errorlevel 1 (
  echo.
  echo  BUILD FAILED. Fix errors above and try again.
  echo.
  pause
  exit /b 1
)

echo.
echo  BUILD SUCCESS
echo.
echo  Run production server locally:  npm start
echo  Or double-click:                run-production.bat
echo  Dev server:                     start.bat
echo.
pause

endlocal
