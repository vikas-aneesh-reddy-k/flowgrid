@echo off
REM ============================================
REM GitHub Secrets Setup Helper (Windows)
REM ============================================

echo ============================================
echo GitHub Secrets Setup Helper
echo ============================================
echo.
echo This script will help you gather the information
echo needed to set up GitHub secrets for CI/CD.
echo.

REM 1. AWS_EC2_HOST
echo ============================================
echo 1. AWS_EC2_HOST
echo ============================================
echo This is your EC2 instance's public IP address.
echo.
echo To find it:
echo   1. Go to AWS EC2 Console
echo   2. Select your instance
echo   3. Copy the 'Public IPv4 address'
echo.
set /p EC2_HOST="Enter your EC2 Public IP: "

if "%EC2_HOST%"=="" (
    echo WARNING: EC2 host is empty
) else (
    echo OK AWS_EC2_HOST: %EC2_HOST%
)

REM 2. AWS_EC2_USER
echo.
echo ============================================
echo 2. AWS_EC2_USER
echo ============================================
echo This is the SSH username for your EC2 instance.
echo   - Ubuntu instances: ubuntu
echo   - Amazon Linux: ec2-user
echo.
set /p EC2_USER="Enter SSH username [ubuntu]: "
if "%EC2_USER%"=="" set EC2_USER=ubuntu
echo OK AWS_EC2_USER: %EC2_USER%

REM 3. AWS_SSH_KEY
echo.
echo ============================================
echo 3. AWS_SSH_KEY
echo ============================================
echo This is your private SSH key (.pem file).
echo.
set /p PEM_FILE="Enter the path to your .pem file [flowgrid-key.pem]: "
if "%PEM_FILE%"=="" set PEM_FILE=flowgrid-key.pem

if exist "%PEM_FILE%" (
    echo OK Found SSH key file: %PEM_FILE%
    echo.
    echo SSH Key content (copy this to GitHub secret AWS_SSH_KEY):
    echo -----------------------------------------------------------
    type "%PEM_FILE%"
    echo -----------------------------------------------------------
) else (
    echo ERROR: SSH key file not found: %PEM_FILE%
    echo Please make sure the .pem file exists in the specified location.
)

REM 4. MONGODB_URI
echo.
echo ============================================
echo 4. MONGODB_URI
echo ============================================
echo Choose your MongoDB setup:
echo   1. Local MongoDB on EC2 (Recommended)
echo   2. MongoDB Atlas (Cloud)
echo   3. Custom MongoDB URI
echo.
set /p MONGO_CHOICE="Enter your choice [1]: "
if "%MONGO_CHOICE%"=="" set MONGO_CHOICE=1

if "%MONGO_CHOICE%"=="1" (
    set MONGODB_URI=mongodb://localhost:27017/flowgrid
    echo OK MONGODB_URI: %MONGODB_URI%
) else if "%MONGO_CHOICE%"=="2" (
    echo.
    echo Enter your MongoDB Atlas connection string:
    echo Example: mongodb+srv://username:password@cluster.mongodb.net/flowgrid
    set /p MONGODB_URI="MongoDB Atlas URI: "
    echo OK MONGODB_URI: %MONGODB_URI%
) else if "%MONGO_CHOICE%"=="3" (
    echo.
    set /p MONGODB_URI="Enter custom MongoDB URI: "
    echo OK MONGODB_URI: %MONGODB_URI%
) else (
    set MONGODB_URI=mongodb://localhost:27017/flowgrid
    echo OK MONGODB_URI: %MONGODB_URI% (default)
)

REM Summary
echo.
echo ============================================
echo SUMMARY - Add these to GitHub Secrets
echo ============================================
echo.
echo Go to: GitHub -^> Settings -^> Secrets and variables -^> Actions
echo Click 'New repository secret' for each:
echo.
echo 1. Secret name: AWS_EC2_HOST
echo    Value: %EC2_HOST%
echo.
echo 2. Secret name: AWS_EC2_USER
echo    Value: %EC2_USER%
echo.
echo 3. Secret name: AWS_SSH_KEY
echo    Value: [Copy the SSH key content shown above]
echo.
echo 4. Secret name: MONGODB_URI
echo    Value: %MONGODB_URI%
echo.

REM Save to file
echo.
echo ============================================
echo Saving Configuration
echo ============================================
set CONFIG_FILE=.github-secrets-config.txt
(
echo # GitHub Secrets Configuration
echo # Generated: %date% %time%
echo # DO NOT COMMIT THIS FILE TO GIT!
echo.
echo AWS_EC2_HOST=%EC2_HOST%
echo AWS_EC2_USER=%EC2_USER%
echo MONGODB_URI=%MONGODB_URI%
echo.
echo # AWS_SSH_KEY: See the SSH key content above
echo # Copy the entire content of %PEM_FILE% including:
echo # -----BEGIN RSA PRIVATE KEY-----
echo # [key content]
echo # -----END RSA PRIVATE KEY-----
) > %CONFIG_FILE%

echo OK Configuration saved to: %CONFIG_FILE%
echo WARNING: Do NOT commit this file to Git!
echo.

REM Add to .gitignore
findstr /C:".github-secrets-config.txt" .gitignore >nul 2>&1
if errorlevel 1 (
    echo .github-secrets-config.txt >> .gitignore
    echo OK Added %CONFIG_FILE% to .gitignore
)

REM Next steps
echo.
echo ============================================
echo Next Steps
echo ============================================
echo.
echo 1. Add all 4 secrets to GitHub:
echo    https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
echo.
echo 2. Run initial EC2 setup (first time only):
echo    ssh -i %PEM_FILE% %EC2_USER%@%EC2_HOST%
echo    git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    cd YOUR_REPO
echo    chmod +x deploy-complete.sh
echo    ./deploy-complete.sh
echo.
echo 3. Test deployment:
echo    git add .
echo    git commit -m "Test CI/CD deployment"
echo    git push origin main
echo.
echo 4. Monitor deployment:
echo    Go to GitHub -^> Actions tab
echo.
echo 5. Access your application:
echo    http://%EC2_HOST%
echo.
echo ============================================
echo Setup helper completed!
echo ============================================
echo.
pause
