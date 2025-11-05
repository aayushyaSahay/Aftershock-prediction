@echo off
REM Aftershock Monitor - Quick Setup Script for Windows

echo ================================
echo Aftershock Monitor - Setup Script
echo ================================
echo.

REM Check Python
echo Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)
echo Python found!

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)
echo Node.js found!

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed. Please install npm.
    pause
    exit /b 1
)
echo npm found!

echo.
echo Prerequisites check passed!
echo.

REM Setup models directory
echo Setting up models directory...
if not exist "models\regional_models" mkdir models\regional_models
echo Models directory created
echo.

REM Backend setup
echo Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)

REM Activate and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo Backend dependencies installed
cd ..

echo.

REM Frontend setup
echo Setting up Frontend...
cd frontend

REM Install dependencies
echo Installing Node dependencies...
call npm install
echo Frontend dependencies installed

REM Create .env.local
if not exist ".env.local" (
    echo Creating .env.local file...
    copy .env.local.example .env.local
    echo Environment file created
) else (
    echo .env.local already exists
)

cd ..

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo ===========
echo.
echo 1. Copy your trained model files to: models\regional_models\
echo    - region_*.json files
echo    - global_fallback.json
echo.
echo 2. Start the backend server:
echo    cd backend
echo    venv\Scripts\activate
echo    python main.py
echo.
echo 3. In a new terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see QUICKSTART.md
echo.
pause