@echo off
echo Installing FastAPI dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
