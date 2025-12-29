@echo off
REM Rebuild frontend with correct API URL for production

echo Building frontend with API URL: /api
echo.

REM Build the Docker image with the correct API URL
docker build --build-arg VITE_API_URL=/api -f Dockerfile.frontend -t vikaskakarla/flowgrid-frontend:latest .

if %errorlevel% neq 0 (
    echo.
    echo ❌ Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ Frontend built successfully!
echo.
echo Pushing to Docker Hub...
docker push vikaskakarla/flowgrid-frontend:latest

if %errorlevel% neq 0 (
    echo.
    echo ❌ Push to Docker Hub failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ Frontend image pushed to Docker Hub!
echo.
echo On EC2 (13.51.176.153), run:
echo   docker-compose pull frontend
echo   docker-compose up -d frontend
echo.
pause
