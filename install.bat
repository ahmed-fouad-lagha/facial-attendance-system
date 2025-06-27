@echo off
setlocal enabledelayedexpansion

REM Facial Attendance System - Windows Installation Script
REM This script automates the setup process for the facial attendance system

echo.
echo ^🚀 Starting Facial Attendance System Installation...
echo ==================================================
echo.

REM Check prerequisites
echo ^📋 Checking Prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js found: !NODE_VERSION!
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not installed. Please install Python 3.8+ from https://python.org/
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
        for /f "tokens=*" %%i in ('python3 --version') do set PYTHON_VERSION=%%i
        echo [SUCCESS] Python found: !PYTHON_VERSION!
    )
) else (
    set PYTHON_CMD=python
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [SUCCESS] Python found: !PYTHON_VERSION!
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install Node.js which includes npm.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [SUCCESS] npm found: !NPM_VERSION!
)

echo.
echo ^📦 Installing Frontend Dependencies...
echo.

REM Install Node.js dependencies
echo [INFO] Installing Node.js packages...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
) else (
    echo [SUCCESS] Frontend dependencies installed successfully
)

echo.
echo ^🐍 Setting Up Python Backend...
echo.

REM Create Python virtual environment
echo [INFO] Creating Python virtual environment...
cd deepfake-detection

if not exist "venv" (
    %PYTHON_CMD% -m venv venv
    echo [SUCCESS] Virtual environment created
) else (
    echo [WARNING] Virtual environment already exists
)

REM Activate virtual environment and install dependencies
echo [INFO] Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
) else (
    echo [SUCCESS] Python dependencies installed successfully
)

cd ..

echo.
echo ^⚙️  Environment Configuration...
echo.

REM Create .env.local from template
if not exist ".env.local" (
    if exist ".env.example" (
        copy .env.example .env.local >nul
        echo [SUCCESS] Environment file created from template
        echo [WARNING] Please update .env.local with your Supabase credentials
    ) else (
        echo [WARNING] No .env.example found. Please create .env.local manually
    )
) else (
    echo [WARNING] .env.local already exists
)

echo.
echo ^✅ Installation Complete!
echo ============================================
echo.
echo ^📝 Next Steps:
echo 1. Set up your Supabase project at https://supabase.com/
echo 2. Update .env.local with your Supabase credentials
echo 3. Run the database schema from supabase-schema.sql
echo 4. Configure storage policies from supabase-storage-fix.sql
echo.
echo ^🚀 To start the application:
echo.
echo Terminal 1 - Backend:
echo cd deepfake-detection
echo venv\Scripts\activate
echo python main.py
echo.
echo Terminal 2 - Frontend:
echo npm run dev
echo.
echo ^📱 Access the application:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
echo Happy coding! ^🎉
echo.
pause
