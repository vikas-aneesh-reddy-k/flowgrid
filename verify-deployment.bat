@echo off
REM ============================================
REM Deployment Verification Script (Windows)
REM ============================================

if "%1"=="" (
    echo Usage: verify-deployment.bat YOUR_EC2_IP
    echo Example: verify-deployment.bat 54.123.45.67
    exit /b 1
)

set EC2_IP=%1
set BASE_URL=http://%EC2_IP%
set API_URL=%BASE_URL%/api

echo ============================================
echo FlowGrid Deployment Verification
echo ============================================
echo Testing: %BASE_URL%
echo.

set TESTS_PASSED=0
set TESTS_FAILED=0

echo ============================================
echo 1. Basic Connectivity Tests
echo ============================================
echo.

REM Test health endpoint
echo Testing Health Check...
curl -s %BASE_URL%/health > temp_health.json 2>nul
findstr /C:"healthy" temp_health.json >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Health Check PASSED
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Health Check FAILED
    set /a TESTS_FAILED+=1
)
del temp_health.json 2>nul

REM Test API health
echo Testing API Health Check...
curl -s %API_URL%/health > temp_api_health.json 2>nul
findstr /C:"healthy" temp_api_health.json >nul 2>&1
if %errorlevel%==0 (
    echo [OK] API Health Check PASSED
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] API Health Check FAILED
    set /a TESTS_FAILED+=1
)
del temp_api_health.json 2>nul

echo.
echo ============================================
echo 2. Frontend Tests
echo ============================================
echo.

REM Test frontend
echo Testing Frontend Homepage...
curl -s -o nul -w "%%{http_code}" %BASE_URL% > temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [OK] Frontend Homepage PASSED (HTTP 200)
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Frontend Homepage FAILED (HTTP %STATUS%)
    set /a TESTS_FAILED+=1
)
del temp_status.txt 2>nul

echo.
echo ============================================
echo 3. Backend API Tests
echo ============================================
echo.

REM Test login
echo Testing Login Endpoint...
curl -s -X POST %API_URL%/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"admin@flowgrid.com\",\"password\":\"admin123\"}" > temp_login.json 2>nul

findstr /C:"token" temp_login.json >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Login Endpoint PASSED
    set /a TESTS_PASSED+=1
    
    REM Extract token (simplified - just check if we got a response)
    echo Token received
    
    echo.
    echo Testing Protected Endpoints:
    echo.
    
    REM Note: For simplicity, we'll test without token extraction
    REM In production, you'd want to parse the JSON properly
    
    echo Testing Products API...
    curl -s %API_URL%/products > temp_products.json 2>nul
    findstr /C:"success" temp_products.json >nul 2>&1
    if %errorlevel%==0 (
        echo [OK] Products API PASSED
        set /a TESTS_PASSED+=1
    ) else (
        echo [FAIL] Products API FAILED
        set /a TESTS_FAILED+=1
    )
    del temp_products.json 2>nul
    
    echo Testing Customers API...
    curl -s %API_URL%/customers > temp_customers.json 2>nul
    findstr /C:"success" temp_customers.json >nul 2>&1
    if %errorlevel%==0 (
        echo [OK] Customers API PASSED
        set /a TESTS_PASSED+=1
    ) else (
        echo [FAIL] Customers API FAILED
        set /a TESTS_FAILED+=1
    )
    del temp_customers.json 2>nul
    
) else (
    echo [FAIL] Login Endpoint FAILED
    set /a TESTS_FAILED+=1
)
del temp_login.json 2>nul

echo.
echo ============================================
echo 4. Database Tests
echo ============================================
echo.

echo Testing MongoDB Connection...
curl -s %API_URL%/health > temp_db_health.json 2>nul
findstr /C:"connected" temp_db_health.json >nul 2>&1
if %errorlevel%==0 (
    echo [OK] MongoDB Connection PASSED
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] MongoDB Connection FAILED
    set /a TESTS_FAILED+=1
)
del temp_db_health.json 2>nul

echo.
echo ============================================
echo Test Summary
echo ============================================
echo.

set /a TOTAL_TESTS=%TESTS_PASSED%+%TESTS_FAILED%
echo Total Tests: %TOTAL_TESTS%
echo Passed: %TESTS_PASSED%
echo Failed: %TESTS_FAILED%
echo.

if %TESTS_FAILED%==0 (
    echo ============================================
    echo [OK] ALL TESTS PASSED!
    echo ============================================
    echo.
    echo Your application is fully functional!
    echo.
    echo Access your application:
    echo   Frontend: %BASE_URL%
    echo   Backend API: %API_URL%
    echo.
    echo Demo Login:
    echo   Email: admin@flowgrid.com
    echo   Password: admin123
    echo.
) else (
    echo ============================================
    echo [FAIL] SOME TESTS FAILED
    echo ============================================
    echo.
    echo Please check the following:
    echo   1. All services are running
    echo   2. MongoDB is connected
    echo   3. Environment variables are correct
    echo   4. Nginx configuration is correct
    echo.
    echo For troubleshooting, SSH into EC2 and run:
    echo   pm2 logs flowgrid-backend
    echo   sudo systemctl status mongod
    echo   sudo systemctl status nginx
    echo.
)

pause
