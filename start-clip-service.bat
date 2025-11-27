@echo off
echo --- Starting Pet PawtrAIt Clip Service ---

cd clip-service

:: 1. Create virtual environment if missing
if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

:: 2. Activate environment
call venv\Scripts\activate

:: 3. Install/Update dependencies (quietly)
echo [INFO] Checking requirements...
pip install -r requirements.txt > nul

:: 4. Start the service
echo [INFO] Starting Uvicorn on port 8001...
uvicorn main:app --port 8001 --reload

pause