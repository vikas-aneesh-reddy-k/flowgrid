@echo off
REM Safe script to fix Git repository structure

echo ========================================
echo Fix FlowGrid Repository Structure
echo ========================================
echo.
echo Current situation:
echo - Git repo root: C:\Users\kakar
echo - Your code: C:\Users\kakar\flowgrid_v1
echo - Problem: flowgrid_v1 is a subfolder in the repo
echo.
echo Solution: Move .git folder to flowgrid_v1
echo ========================================
echo.

pause

REM Step 1: Backup current state
echo Step 1: Creating backup...
cd C:\Users\kakar\flowgrid_v1
git status
git add .
git commit -m "Backup before restructure"
git push origin main

REM Step 2: Move .git folder from parent to flowgrid_v1
echo.
echo Step 2: Moving .git folder...
cd C:\Users\kakar
if exist .git (
    echo Moving .git folder to flowgrid_v1...
    move .git flowgrid_v1\.git
    
    if %errorlevel% equ 0 (
        echo ✓ Successfully moved .git folder
    ) else (
        echo ✗ Failed to move .git folder
        pause
        exit /b 1
    )
) else (
    echo .git folder not found in C:\Users\kakar
    echo Checking if it's already in flowgrid_v1...
    if exist flowgrid_v1\.git (
        echo ✓ .git folder is already in flowgrid_v1
    ) else (
        echo ✗ Cannot find .git folder
        pause
        exit /b 1
    )
)

REM Step 3: Verify the new structure
echo.
echo Step 3: Verifying new structure...
cd C:\Users\kakar\flowgrid_v1
git status

echo.
echo ========================================
echo Structure Fixed!
echo ========================================
echo.
echo Now your Git repository root is: C:\Users\kakar\flowgrid_v1
echo All files are at the root level (no flowgrid_v1 subfolder)
echo.
echo Next: Update Jenkinsfile to remove flowgrid_v1 paths
echo.
pause
