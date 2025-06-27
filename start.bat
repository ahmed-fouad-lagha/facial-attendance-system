@echo off
setlocal

REM Facial Attendance System - Windows Startup Script
REM Quick start script for running both services

echo.
echo ^🚀 Starting Facial Attendance System...
echo =======================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ^❌ .env.local not found!
    echo Please copy .env.example to .env.local and configure your Supabase credentials
    pause
    exit /b 1
)

echo ^📱 Starting services...
echo.

REM Start backend
echo ^🐍 Starting Python backend...
cd deepfake-detection

REM Check if virtual environment exists
if not exist "venv" (
    echo ^❌ Python virtual environment not found!
    echo Please run install.bat first
    pause
    exit /b 1
)

echo Starting FastAPI server on port 8000...
start "Backend Service" cmd /k "venv\Scripts\activate && python main.py"

cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo ^⚛️  Starting Next.js frontend...
echo Starting development server on port 3000...
start "Frontend Service" cmd /k "npm run dev"

echo.
echo ^✅ Services started successfully!
echo.
echo ^📱 Application URLs:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Services are running in separate windows.
echo Close the terminal windows to stop the services.
echo.
pause
