@echo off
REM Local testing script for Windows - Run before deploying
REM Tests Docker builds locally

echo Testing FlowGrid locally...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo Docker is running
echo.

REM Test backend build
echo Building backend Docker image...
docker build -t flowgrid-backend-test:latest -f server/Dockerfile ./server
if errorlevel 1 (
    echo Backend build failed
    exit /b 1
)
echo Backend build successful
echo.

REM Test frontend build
echo Building frontend Docker image...
docker build -t flowgrid-frontend-test:latest --build-arg VITE_API_URL=http://localhost:5000/api -f Dockerfile.frontend .
if errorlevel 1 (
    echo Frontend build failed
    exit /b 1
)
echo Frontend build successful
echo.

REM Test docker-compose
echo Testing docker-compose configuration...
docker compose config >nul
if errorlevel 1 (
    echo docker-compose.yml is invalid
    exit /b 1
)
echo docker-compose.yml is valid
echo.

REM Clean up test images
echo Cleaning up test images...
docker rmi flowgrid-backend-test:latest flowgrid-frontend-test:latest
echo Cleanup complete
echo.

echo ========================================
echo All tests passed!
echo.
echo Next steps:
echo 1. Commit and push to GitHub
echo 2. GitHub Actions will build and deploy automatically
echo 3. Check deployment at: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
echo.
pause
