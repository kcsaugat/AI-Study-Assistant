@echo off
echo Starting AI Study Assistant...
echo.

start "AI Study Assistant - Backend" cmd /k "cd /d "%~dp0backend" && npx tsx src/index.ts"
timeout /t 4 /nobreak >nul

start "AI Study Assistant - Frontend" cmd /k "cd /d "%~dp0frontend" && npx vite --port 5173"
timeout /t 4 /nobreak >nul

start http://localhost:5173

echo.
echo App started! Opening browser...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo IMPORTANT: Set your OpenAI API key in backend\.env to enable AI features
pause
