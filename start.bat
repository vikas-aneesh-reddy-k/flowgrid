@echo off
echo ========================================
echo FlowGrid ERP - Starting Development Servers
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.version()" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not running!
    echo Please start MongoDB first:
    echo   - Windows Service: net start MongoDB
    echo   - Manual: mongod
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB is running
echo.

REM Check if backend dependencies are installed
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
    echo.
)

REM Check if database is seeded
echo Checking database...
mongosh flowgrid --eval "db.users.countDocuments()" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo Seeding database...
    cd server
    call npm run seed
    cd ..
    echo.
)

echo Starting servers...
echo Frontend: http://localhost:8081
echo Backend:  http://localhost:5000
echo.

REM Start both servers
start "FlowGrid Backend" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "FlowGrid Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Servers are starting in separate windows
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
