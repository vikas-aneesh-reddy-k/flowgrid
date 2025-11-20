@echo off
REM Manual Deployment Script for Windows
REM Run this to deploy updates to EC2

echo Deploying FlowGrid to EC2...

REM Configuration
set EC2_IP=13.53.86.36
set EC2_USER=ubuntu
set SSH_KEY=flowgrid-key.pem

echo Building application...
call npm ci
call npm run build

cd server
call npm ci
call npm run build
cd ..

echo.
echo Deployment package created!
echo.
echo Now SSH into EC2 and run the deployment commands:
echo.
echo ssh -i %SSH_KEY% %EC2_USER%@%EC2_IP%
echo.
echo Then on EC2, run:
echo   cd ~/flowgrid
echo   git pull origin main
echo   npm run build
echo   sudo cp -r dist/* /var/www/flowgrid/
echo   cd server
echo   npm run build
echo   pm2 restart flowgrid-backend
echo   sudo systemctl restart nginx
echo.
pause
