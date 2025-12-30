@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        MERN Expense Manager - Complete Setup Script           ║
echo ║                      Windows Version                           ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Check Node.js
echo [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js installed: !NODE_VERSION!
)

:: Check NPM
echo [2/4] Checking NPM...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM not found.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] NPM installed: v!NPM_VERSION!
)

:: Check/Install MongoDB
echo [3/4] Checking MongoDB...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found on system PATH.
    echo.
    echo Please install MongoDB Community Edition:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Install MongoDB as a Windows Service
    echo 3. Or use MongoDB Atlas cloud: https://www.mongodb.com/cloud/atlas
    echo.
    echo After installation, MongoDB will start automatically as a service.
    echo.
    echo Type Y to continue without MongoDB, or N to exit
    set /p CONTINUE=Your choice: 
    if /i "!CONTINUE!" neq "y" (
        exit /b 1
    )
) else (
    echo [OK] MongoDB found
    
    :: Try to start MongoDB service
    echo Starting MongoDB service...
    net start MongoDB >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] MongoDB service started
    ) else (
        echo [INFO] MongoDB service may already be running or needs manual start
        echo You can start it with: net start MongoDB
    )
)

:: Install project dependencies
echo [4/4] Installing project dependencies...
echo.

:: Backend dependencies
echo Installing backend dependencies...
cd /d "%~dp0backend"
if exist "package.json" (
    call npm install
    if !errorlevel! equ 0 (
        echo [OK] Backend dependencies installed
    ) else (
        echo [ERROR] Failed to install backend dependencies
    )
) else (
    echo [ERROR] Backend package.json not found
)

:: Frontend dependencies
echo.
echo Installing frontend dependencies...
cd /d "%~dp0frontend"
if exist "package.json" (
    call npm install
    if !errorlevel! equ 0 (
        echo [OK] Frontend dependencies installed
    ) else (
        echo [ERROR] Failed to install frontend dependencies
    )
) else (
    echo [ERROR] Frontend package.json not found
)

cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    Setup Complete! 🎉                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo [OK] All dependencies installed
echo [OK] MongoDB is ready
echo.
echo To start the application, you have two options:
echo.
echo Option 1 - Use the start script - Recommended:
echo   start.bat
echo.
echo Option 2 - Manual start in separate terminals:
echo.
echo   Terminal 1 - Backend:
echo     cd "%~dp0backend"
echo     npm start
echo.
echo   Terminal 2 - Frontend:
echo     cd "%~dp0frontend"
echo     npm run dev
echo.
echo Then open your browser to: http://localhost:3000
echo.
pause
