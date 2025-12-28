@echo off
echo Testing EC2 Connection...
echo.

set EC2_IP=16.170.155.235

echo [1/3] Testing port 22 (SSH)...
powershell -Command "Test-NetConnection -ComputerName %EC2_IP% -Port 22 -InformationLevel Detailed"
echo.

echo [2/3] Testing port 80 (HTTP)...
powershell -Command "Test-NetConnection -ComputerName %EC2_IP% -Port 80 -InformationLevel Detailed"
echo.

echo [3/3] Testing port 5000 (API)...
powershell -Command "Test-NetConnection -ComputerName %EC2_IP% -Port 5000 -InformationLevel Detailed"
echo.

echo ========================================
echo If all ports show TcpTestSucceeded: True, you're good!
echo If not, check:
echo 1. Is EC2 instance RUNNING? (not stopped)
echo 2. Wait 30 seconds for security group changes to apply
echo 3. Is the security group attached to your instance?
echo ========================================
pause
