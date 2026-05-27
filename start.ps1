# AI Study Assistant - Start Script
# Run this to start both backend and frontend

Write-Host "Starting AI Study Assistant..." -ForegroundColor Cyan

# Start backend
$backendJob = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend starting...' -ForegroundColor Green; npx tsx src/index.ts" -PassThru

Start-Sleep -Seconds 3

# Start frontend
$frontendJob = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend starting...' -ForegroundColor Green; npx vite --port 5173" -PassThru

Start-Sleep -Seconds 4

# Open browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "App is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Add your OpenAI API key to backend\.env to enable AI features." -ForegroundColor Red
