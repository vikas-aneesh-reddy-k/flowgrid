@echo off
REM Script to properly restructure the Git repository

echo ========================================
echo Restructuring FlowGrid Repository
echo ========================================
echo.

REM Step 1: Clone the repo to a clean location
echo Step 1: Cloning repository to clean location...
cd C:\
git clone https://github.com/vikas-aneesh-reddy-k/flowgrid.git flowgrid_clean
if %errorlevel% neq 0 (
    echo Failed to clone repository
    pause
    exit /b 1
)

REM Step 2: Remove the flowgrid_v1 folder from the repo if it exists
echo.
echo Step 2: Cleaning up old structure...
cd C:\flowgrid_clean
if exist flowgrid_v1 (
    git rm -rf flowgrid_v1
    git commit -m "Remove flowgrid_v1 subfolder"
)

REM Step 3: Copy all files from your current working directory
echo.
echo Step 3: Copying your current work to root...
xcopy /E /I /Y C:\Users\kakar\flowgrid_v1\* C:\flowgrid_clean\

REM Step 4: Add and commit all changes
echo.
echo Step 4: Committing changes...
cd C:\flowgrid_clean
git add .
git commit -m "Restructure: Move all files to repository root"

REM Step 5: Force push to main
echo.
echo Step 5: Pushing to GitHub...
git push origin main --force

echo.
echo ========================================
echo Restructure Complete!
echo ========================================
echo.
echo Your clean repository is at: C:\flowgrid_clean
echo.
echo Next steps:
echo 1. Delete C:\Users\kakar\flowgrid_v1
echo 2. Rename C:\flowgrid_clean to C:\Users\kakar\flowgrid_v1
echo 3. Or work from C:\flowgrid_clean directly
echo.
pause
