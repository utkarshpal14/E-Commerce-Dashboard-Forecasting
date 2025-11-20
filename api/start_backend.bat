@echo off
echo Starting FastAPI Backend...
echo.
echo Make sure you have:
echo 1. Python 3.10+ installed
echo 2. Installed dependencies: pip install -r requirements.txt
echo 3. Data file exists at: ..\data\processed\Amazon_Sales_Cleaned.csv
echo.
cd /d %~dp0
python -m uvicorn main:app --reload --port 8000
pause

