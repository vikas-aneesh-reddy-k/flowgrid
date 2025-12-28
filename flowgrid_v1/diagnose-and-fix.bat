@echo off
echo ========================================
echo FlowGrid Deployment Diagnostic
echo ========================================
echo.

set EC2_IP=16.170.155.235
set /p PEM_FILE="Enter path to your .pem file: "

echo.
echo [1/5] Testing Frontend (port 80)...
curl -s -o nul -w "Status: %%{http_code}\n" http://%EC2_IP%
echo.

echo [2/5] Testing Backend API (port 5000)...
curl -s -o nul -w "Status: %%{http_code}\n" http://%EC2_IP%:5000/health
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend not responding!
    echo This is why signup fails.
)
echo.

echo [3/5] Testing SSH connection...
ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "%PEM_FILE%" ubuntu@%EC2_IP% "echo 'SSH OK'"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SSH failed! Check Security Group port 22
    pause
    exit /b 1
)
echo.

echo [4/5] Checking Docker containers on EC2...
ssh -i "%PEM_FILE%" ubuntu@%EC2_IP% "cd /home/ubuntu/flowgrid && docker compose ps"
echo.

echo [5/5] Checking backend logs...
echo Last 20 lines of backend logs:
ssh -i "%PEM_FILE%" ubuntu@%EC2_IP% "cd /home/ubuntu/flowgrid && docker compose logs --tail=20 backend"
echo.

echo ========================================
echo Diagnosis Complete
echo ========================================
echo.
echo If backend is not running or showing errors:
echo 1. SSH to EC2: ssh -i "%PEM_FILE%" ubuntu@%EC2_IP%
echo 2. Go to app: cd /home/ubuntu/flowgrid
echo 3. Check logs: docker compose logs -f backend
echo 4. Restart: docker compose restart backend
echo.
pause
