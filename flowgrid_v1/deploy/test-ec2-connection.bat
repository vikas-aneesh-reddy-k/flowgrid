@echo off
REM Test EC2 Connection Script
REM This helps diagnose SSH connection issues

echo ========================================
echo EC2 Connection Diagnostic Tool
echo ========================================
echo.

set /p EC2_IP="Enter your EC2 IP address: "
set /p PEM_FILE="Enter path to your .pem file: "

echo.
echo Testing connection to %EC2_IP%...
echo.

REM Test 1: Ping (ICMP may be blocked, so failure is OK)
echo [Test 1/4] Testing network connectivity (ping)...
ping -n 2 %EC2_IP% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] EC2 is reachable via ping
) else (
    echo [INFO] Ping failed (this is OK if ICMP is blocked)
)
echo.

REM Test 2: Check if port 22 is open
echo [Test 2/4] Testing SSH port (22)...
powershell -Command "Test-NetConnection -ComputerName %EC2_IP% -Port 22 -InformationLevel Quiet" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Port 22 is open
) else (
    echo [ERROR] Port 22 is CLOSED or FILTERED
    echo.
    echo This is your problem! Fix AWS Security Group:
    echo 1. Go to AWS Console - EC2 - Security Groups
    echo 2. Find your instance's security group
    echo 3. Edit inbound rules
    echo 4. Add rule: Type=SSH, Port=22, Source=0.0.0.0/0
    echo.
    echo See deploy/fix-security-group.md for detailed instructions
    pause
    exit /b 1
)
echo.

REM Test 3: Check if PEM file exists
echo [Test 3/4] Checking PEM file...
if not exist "%PEM_FILE%" (
    echo [ERROR] PEM file not found: %PEM_FILE%
    pause
    exit /b 1
)
echo [OK] PEM file found
echo.

REM Test 4: Try SSH connection
echo [Test 4/4] Testing SSH connection...
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "%PEM_FILE%" ubuntu@%EC2_IP% "echo 'Connection successful!'"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SSH connection failed!
    echo.
    echo Possible issues:
    echo 1. Security Group doesn't allow SSH (port 22) - MOST COMMON
    echo 2. Wrong PEM file
    echo 3. EC2 instance is stopped
    echo 4. Wrong EC2 IP address
    echo.
    echo To fix Security Group:
    echo - See deploy/fix-security-group.md
    pause
    exit /b 1
)
echo [OK] SSH connection successful!
echo.

echo ========================================
echo All tests passed! ✓
echo ========================================
echo.
echo Your EC2 is accessible. GitHub Actions and Jenkins should work.
echo.
echo If they still fail, check:
echo 1. GitHub Secrets are set correctly
echo 2. Jenkins credentials are set correctly
echo 3. EC2_HOST matches this IP: %EC2_IP%
echo.
pause
