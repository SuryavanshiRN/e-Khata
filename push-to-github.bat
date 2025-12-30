@echo off
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║              GitHub Repository Setup - Windows                 ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Check if already a git repository
if exist ".git" (
    echo [INFO] Git repository already initialized
) else (
    echo Initializing Git repository...
    git init
    echo [OK] Git repository initialized
)

:: Get repository details
echo.
echo Please provide your GitHub repository details:
echo.
set /p GITHUB_USERNAME=Enter your GitHub username: 
set /p REPO_NAME=Enter repository name (e.g., expense-manager): 
set /p COMMIT_MESSAGE=Enter commit message (default: Initial commit): 

if "%COMMIT_MESSAGE%"=="" set COMMIT_MESSAGE=Initial commit

echo.
echo ════════════════════════════════════════════════════════════════
echo Configuration:
echo   Username: %GITHUB_USERNAME%
echo   Repository: %REPO_NAME%
echo   Commit Message: %COMMIT_MESSAGE%
echo ════════════════════════════════════════════════════════════════
echo.

set /p CONFIRM=Is this correct? (y/n): 
if /i "%CONFIRM%" neq "y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

:: Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo Creating .gitignore...
    (
        echo node_modules/
        echo .env
        echo .env.local
        echo dist/
        echo build/
        echo *.log
        echo .DS_Store
        echo coverage/
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo backend/uploads/
        echo backend/*.traineddata
    ) > .gitignore
    echo [OK] .gitignore created
)

:: Add all files
echo.
echo Adding files to git...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to add files
    pause
    exit /b 1
)
echo [OK] Files added

:: Commit
echo.
echo Committing changes...
git commit -m "%COMMIT_MESSAGE%"
if %errorlevel% neq 0 (
    echo [WARNING] Commit failed. This might be because there are no changes to commit.
)

:: Check if remote exists
git remote | find "origin" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo [INFO] Remote 'origin' already exists
    echo Current remote URL:
    git remote get-url origin
    echo.
    set /p UPDATE_REMOTE=Do you want to update the remote URL? (y/n): 
    if /i "!UPDATE_REMOTE!"=="y" (
        git remote remove origin
        git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
        echo [OK] Remote updated
    )
) else (
    echo.
    echo Adding remote repository...
    git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
    echo [OK] Remote added
)

:: Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" set CURRENT_BRANCH=main

:: Rename to main if on master
git branch | find "master" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo Renaming branch from 'master' to 'main'...
    git branch -M main
    set CURRENT_BRANCH=main
)

:: Push to GitHub
echo.
echo Pushing to GitHub...
echo Branch: %CURRENT_BRANCH%
echo.

git push -u origin %CURRENT_BRANCH%
if %errorlevel% equ 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════════╗
    echo ║                   Successfully Pushed! 🎉                      ║
    echo ╚════════════════════════════════════════════════════════════════╝
    echo.
    echo Your repository is now available at:
    echo https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo.
) else (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo This might be because:
    echo 1. The repository doesn't exist on GitHub yet
    echo    - Create it at: https://github.com/new
    echo 2. You don't have permission to push
    echo    - Check your GitHub credentials
    echo 3. Authentication failed
    echo    - You may need to use a Personal Access Token
    echo    - Generate one at: https://github.com/settings/tokens
    echo.
    echo To push manually, use:
    echo   git push -u origin %CURRENT_BRANCH%
    echo.
)

echo.
echo Next steps:
echo 1. Visit your repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo 2. Add a description and topics
echo 3. Enable GitHub Pages if needed
echo.
pause
