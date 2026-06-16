@echo off
setlocal
cd /d "%~dp0"

title CourtFlow - Production Server

echo.
echo  CourtFlow - Starting production server...
echo.

if not exist ".next\BUILD_ID" (
  echo  No production build found. Run build.bat first.
  echo.
  pause
  exit /b 1
)

echo  Open http://localhost:3000
echo  Press Ctrl+C to stop
echo.

call npm start

if errorlevel 1 (
  echo.
  echo  Server exited with an error.
  pause
  exit /b 1
)

endlocal
