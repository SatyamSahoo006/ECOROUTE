@echo off
setlocal
cd /d "%~dp0"
set "AI_PORT=8000"
set "GATEWAY_PORT=5000"
set "FRONTEND_PORT=5173"
set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

if exist "%CD%\.env" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%CD%\.env") do (
    if /I "%%A"=="AI_PORT" set "AI_PORT=%%B"
    if /I "%%A"=="GATEWAY_PORT" set "GATEWAY_PORT=%%B"
  )
)

echo Starting EcoRoute AI full stack...
echo.

call :port_busy 27017
if errorlevel 1 (
  echo [INFO] MongoDB already listening on 27017.
) else (
  where mongod >nul 2>nul
  if errorlevel 1 (
    echo [WARN] mongod not found on PATH - gateway will use its in-memory store.
  ) else (
    start "MongoDB" cmd /k "mongod --dbpath \"%CD%\backend\gateway-ts\data\""
    "%PS%" -NoProfile -Command "Start-Sleep -Seconds 3"
  )
)

call :port_busy %AI_PORT%
if errorlevel 1 (
  echo [INFO] AI port %AI_PORT% already in use - not starting another instance.
) else (
  if not exist "backend\ai-engine-py\.venv\Scripts\python.exe" (
    echo [ERROR] AI venv missing. Run run.bat first.
  ) else (
    start "AI Engine (Python)" cmd /k "cd /d \"%CD%\backend\ai-engine-py\" && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port %AI_PORT%"
  )
)

call :port_busy %GATEWAY_PORT%
if errorlevel 1 (
  echo [INFO] Gateway port %GATEWAY_PORT% already in use - not starting another instance.
) else (
  if not exist "backend\gateway-ts\node_modules\ts-node\dist\bin.js" (
    echo [ERROR] Gateway dependencies missing. Run run.bat first.
  ) else (
    start "Gateway (Node)" cmd /k "cd /d \"%CD%\backend\gateway-ts\" && node node_modules\ts-node\dist\bin.js src/app.ts"
  )
)

call :port_busy %FRONTEND_PORT%
if errorlevel 1 (
  echo [INFO] Frontend port %FRONTEND_PORT% already in use - not starting another instance.
) else (
  if not exist "node_modules\vite\bin\vite.js" (
    echo [ERROR] Frontend dependencies missing. Run run.bat first.
  ) else (
    start "Frontend (Vite)" cmd /k "cd /d \"%CD%\" && node node_modules\vite\bin\vite.js --host --port %FRONTEND_PORT%"
  )
)

echo.
echo Frontend:  http://localhost:%FRONTEND_PORT%
echo Gateway:   http://localhost:%GATEWAY_PORT%   (/health, /api/*)
echo AI Engine: http://localhost:%AI_PORT%   (/health, /py/*)
echo.
echo If a service fails, run it manually in its terminal to see the error.
pause
exit /b 0

:port_busy
"%PS%" -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %1 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
exit /b %errorlevel%
