@echo off
setlocal
cd /d "%~dp0"
set ASTRO_TELEMETRY_DISABLED=1
if not exist "node_modules\astro" (
    call npm ci
    if errorlevel 1 (
        pause
        exit /b 1
    )
)
echo Local preview: http://127.0.0.1:4321/ACMguide/
echo Keep this window open while editing. Press Ctrl+C to stop.
call npm run dev -- --open
if errorlevel 1 pause
