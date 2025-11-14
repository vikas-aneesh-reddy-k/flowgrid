@echo off
echo ========================================
echo   Restarting Backend Server
echo ========================================
echo.
echo Stopping any running backend processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *server*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting backend server...
cd server
start "FlowGrid Backend" cmd /k "npm run dev"
echo.
echo ========================================
echo   Backend server is starting...
echo   Check the new window for status
echo ========================================
pause
