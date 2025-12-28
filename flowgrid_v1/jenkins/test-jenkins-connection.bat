@echo off
REM Jenkins Connection Test Script for Windows
REM This script tests if Jenkins can connect to EC2

echo ========================================
echo Jenkins EC2 Connection Test
echo ========================================
echo.

REM Check if SSH is available
echo [1/5] Checking SSH availability...
where ssh >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SSH not found! Install OpenSSH Client from Windows Optional Features
    pause
    exit /b 1
)
echo [OK] SSH is available
echo.

REM Check if SCP is available
echo [2/5] Checking SCP availability...
where scp >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SCP not found! Install OpenSSH Client from Windows Optional Features
    pause
    exit /b 1
)
echo [OK] SCP is available
echo.

REM Get EC2 details from user
set /p EC2_IP="Enter your EC2 IP address: "
set /p PEM_FILE="Enter path to your .pem file: "

REM Check if PEM file exists
echo [3/5] Checking PEM file...
if not exist "%PEM_FILE%" (
    echo [ERROR] PEM file not found: %PEM_FILE%
    pause
    exit /b 1
)
echo [OK] PEM file found
echo.

REM Test SSH connection
echo [4/5] Testing SSH connection to EC2...
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "%PEM_FILE%" ubuntu@%EC2_IP% "echo 'SSH connection successful!'"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SSH connection failed!
    echo.
    echo Possible issues:
    echo - Wrong EC2 IP address
    echo - Wrong PEM file
    echo - EC2 security group doesn't allow SSH from your IP
    echo - EC2 instance is not running
    pause
    exit /b 1
)
echo [OK] SSH connection successful
echo.

REM Test Docker on EC2
echo [5/5] Testing Docker on EC2...
ssh -o StrictHostKeyChecking=no -i "%PEM_FILE%" ubuntu@%EC2_IP% "docker --version"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker not found on EC2!
    echo Run the setup script on EC2 first
    pause
    exit /b 1
)
echo [OK] Docker is available on EC2
echo.

REM Check if flowgrid directory exists
echo [BONUS] Checking FlowGrid installation...
ssh -o StrictHostKeyChecking=no -i "%PEM_FILE%" ubuntu@%EC2_IP% "test -d /home/ubuntu/flowgrid && echo 'exists' || echo 'missing'"
echo.

echo ========================================
echo All tests passed! ✓
echo ========================================
echo.
echo Your Jenkins should be able to deploy to EC2.
echo.
echo Next steps:
echo 1. Add EC2 SSH key to Jenkins credentials (ID: ec2-ssh-key)
echo 2. Set EC2_HOST environment variable in Jenkins: %EC2_IP%
echo 3. Set EC2_USERNAME environment variable in Jenkins: ubuntu
echo 4. Run your Jenkins pipeline
echo.
pause
