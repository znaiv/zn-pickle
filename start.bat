@echo off
setlocal
cd /d "%~dp0"

title CourtFlow

echo.
echo  CourtFlow - Starting development server...
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

echo  Open http://localhost:3000 in your browser
echo  Press Ctrl+C to stop the server
echo.

call npm run dev

if errorlevel 1 (
  echo.
  echo  Server exited with an error.
  pause
  exit /b 1
)

endlocal
