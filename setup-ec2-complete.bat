@echo off
REM Windows batch script to connect to EC2 and run setup

echo ========================================
echo FlowGrid EC2 Setup - Windows Version
echo ========================================
echo.

REM Check if SSH key exists
if not exist "flowgrid-key.pem" (
    echo ERROR: flowgrid-key.pem not found!
    echo Please place your EC2 key file in this directory.
    pause
    exit /b 1
)

REM Get EC2 IP from user
set /p EC2_IP="Enter your EC2 Public IP: "

if "%EC2_IP%"=="" (
    echo ERROR: EC2 IP is required!
    pause
    exit /b 1
)

echo.
echo Setting key permissions...
icacls "flowgrid-key.pem" /inheritance:r
icacls "flowgrid-key.pem" /grant:r "%username%:R"

echo.
echo Connecting to EC2 and running setup...
echo.

REM Create temporary script file
echo #!/bin/bash > temp_setup.sh
echo set -e >> temp_setup.sh
echo curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/setup-ec2-complete.sh -o setup.sh >> temp_setup.sh
echo chmod +x setup.sh >> temp_setup.sh
echo ./setup.sh >> temp_setup.sh

REM Copy script to EC2 and execute
scp -i "flowgrid-key.pem" temp_setup.sh ubuntu@%EC2_IP%:~/
ssh -i "flowgrid-key.pem" ubuntu@%EC2_IP% "chmod +x ~/temp_setup.sh && ~/temp_setup.sh"

REM Cleanup
del temp_setup.sh

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Jenkins URL: http://%EC2_IP%:8080
echo Application URL: http://%EC2_IP%
echo.
echo Next steps:
echo 1. Configure Jenkins at http://%EC2_IP%:8080
echo 2. Add credentials in Jenkins
echo 3. Create pipeline job
echo 4. Setup GitHub webhook
echo 5. Push to GitHub to deploy!
echo.
pause
