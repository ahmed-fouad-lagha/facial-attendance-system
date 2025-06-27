@echo off
REM Deepfake Detection Service Setup Script for Windows

echo Setting up Deepfake Detection Service...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate

REM Upgrade pip
pip install --upgrade pip

REM Install dependencies
pip install -r requirements.txt

echo Setup complete! To start the service:
echo 1. Activate virtual environment: venv\Scripts\activate
echo 2. Run the service: python main.py
echo 3. The service will be available at http://localhost:8000

pause
