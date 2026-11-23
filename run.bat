@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================
echo   EcoRoute AI - Full Project Installer/Launcher
echo ============================================
echo.

node --version >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not available on PATH.
  echo Install Node.js LTS from https://nodejs.org and re-run this file.
  pause
  exit /b 1
)

echo [1/4] Installing frontend dependencies...
call npm install
if errorlevel 1 goto :fail

echo.
echo [2/4] Installing gateway dependencies...
call npm install --prefix backend\gateway-ts
if errorlevel 1 goto :fail

echo.
echo [3/4] Preparing AI engine virtual environment...
if not exist "backend\ai-engine-py\.venv\Scripts\python.exe" (
  python --version >nul 2>nul
  if errorlevel 1 (
    py -3 --version >nul 2>nul
    if errorlevel 1 (
      echo [ERROR] Python 3 is not available on PATH.
      pause
      exit /b 1
    )
    py -3 -m venv "backend\ai-engine-py\.venv"
  ) else (
    python -m venv "backend\ai-engine-py\.venv"
  )
  if errorlevel 1 goto :fail
)

echo.
echo [4/4] Installing AI engine requirements...
call "backend\ai-engine-py\.venv\Scripts\python.exe" -m pip install -r "backend\ai-engine-py\requirements.txt"
if errorlevel 1 goto :fail

echo.
echo Starting all services...
call start-all.bat
exit /b 0

:fail
echo.
echo [ERROR] Install step failed. Check the output above and re-run this file.
pause
exit /b 1
