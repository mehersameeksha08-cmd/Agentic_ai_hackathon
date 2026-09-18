@echo off
cd /d "%~dp0"
if exist "backend\venv\Scripts\python.exe" (
    "backend\venv\Scripts\python.exe" test_agent.py
) else if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" test_agent.py
) else (
    python test_agent.py
)
pause
