@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo.
echo ============================================
echo Starting Remotion Studio...
echo ============================================
echo.
npm run dev
pause
