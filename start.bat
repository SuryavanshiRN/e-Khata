@echo off
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║         Starting MERN Expense Manager Servers - Windows       ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Get Node and NPM versions
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i

echo Node Version: %NODE_VERSION%
echo NPM Version: %NPM_VERSION%
echo.

:: Check if MongoDB service is running
echo === MongoDB ===
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB service not running. Attempting to start...
    net start MongoDB >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] MongoDB started successfully
    ) else (
        echo [ERROR] Failed to start MongoDB
        echo Please start MongoDB manually or use MongoDB Atlas
        echo To start: net start MongoDB
        echo.
        echo Type Y to continue anyway, or N to exit
        set /p CONTINUE=Your choice: 
        if /i "!CONTINUE!" neq "y" (
            exit /b 1
        )
    )
)

:: Check if dependencies are installed
echo.
echo === Checking Dependencies ===

cd /d "%~dp0backend"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

:: Start Backend Server
echo.
echo === Backend Server ===
cd /d "%~dp0backend"
echo Starting backend server on http://localhost:5000...
start "Expense Manager - Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

:: Start Frontend Server
echo.
echo === Frontend Server ===
cd /d "%~dp0frontend"
echo Starting frontend server on http://localhost:3000...
start "Expense Manager - Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║                    Servers Are Starting!                       ║
echo ║                                                                ║
echo ║  Backend:  http://localhost:5000                               ║
echo ║  Frontend: http://localhost:3000                               ║
echo ║                                                                ║
echo ║  Two new command windows have opened:                          ║
echo ║  - Backend Server - port 5000                                  ║
echo ║  - Frontend Server - port 3000                                 ║
echo ║                                                                ║
echo ║  To stop servers: run stop.bat                                 ║
echo ║  Or close the server windows                                   ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📝 Logs are visible in the server windows
echo.
echo 🌐 Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo Press any key to exit this window - servers will keep running...
pause >nul
