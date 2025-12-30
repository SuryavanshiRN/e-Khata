@echo off
setlocal

echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║              Stopping MERN Expense Manager Servers             ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Stop Frontend (Vite) - runs on port 3000
echo 🛑 Stopping Frontend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] Frontend stopped
    )
)
if %errorlevel% neq 0 (
    echo   [INFO] Frontend not running
)

echo.
:: Stop Backend (Node/Nodemon) - runs on port 5000
echo 🛑 Stopping Backend server (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] Backend stopped
    )
)
if %errorlevel% neq 0 (
    echo   [INFO] Backend not running
)

:: Also kill any node processes with "server.js" or "vite"
echo.
echo 🛑 Cleaning up remaining processes...
taskkill /F /FI "WINDOWTITLE eq Expense Manager - Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Expense Manager - Frontend*" >nul 2>&1
echo   [OK] Cleanup complete

:: Optional: Stop MongoDB (commented out by default)
:: Uncomment the lines below if you want to stop MongoDB as well
:: echo.
:: echo 🛑 Stopping MongoDB...
:: net stop MongoDB >nul 2>&1
:: if %errorlevel% equ 0 (
::     echo   [OK] MongoDB stopped
:: ) else (
::     echo   [INFO] MongoDB already stopped or not installed as service
:: )

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    All Servers Stopped!                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo To start again, run: start.bat
echo.
pause
