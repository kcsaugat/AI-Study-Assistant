<#
.SYNOPSIS
  Prepare AI Study Assistant for deployment and local production build.
.DESCRIPTION
  This helper script installs dependencies, builds backend and frontend, and initializes Git.
.PARAMETER GitHubRemote
  Optional GitHub repository URL to add as the origin remote.
#>

param(
    [string]$GitHubRemote = ""
)

function Write-Info($message) {
    Write-Host $message -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host $message -ForegroundColor Green
}

function Write-Warn($message) {
    Write-Host $message -ForegroundColor Yellow
}

function Write-ErrorExit($message) {
    Write-Host $message -ForegroundColor Red
    exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Info "AI Study Assistant Deployment Helper"
Write-Info "======================================"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ErrorExit "Node.js is required. Install from https://nodejs.org and re-run this script."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-ErrorExit "npm is required. Install Node.js from https://nodejs.org and re-run this script."
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Warn "Git is not installed or not available in PATH."
    Write-Warn "Install Git from https://git-scm.com/download/win and re-run this script."
    exit 1
}

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Warn "Created backend/.env from backend/.env.example. Please edit it with your secrets."
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Warn "Created frontend/.env from frontend/.env.example. Please set VITE_API_URL after deployment."
}

if (-not (Test-Path ".git")) {
    Write-Info "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: AI Study Assistant ready for deployment"
    Write-Success "Git repository initialized and first commit created."
} else {
    Write-Info "Git repository already initialized."
}

if ($GitHubRemote -ne "") {
    $originExists = $false
    try {
        git remote get-url origin | Out-Null
        $originExists = $true
    } catch {
        $originExists = $false
    }

    if (-not $originExists) {
        Write-Info "Adding GitHub remote origin: $GitHubRemote"
        git remote add origin $GitHubRemote
    } else {
        Write-Info "Git remote origin already exists."
    }
}

Write-Info "Installing dependencies..."
npm install
npm install --prefix backend
npm install --prefix frontend

Write-Info "Building backend..."
npm run build --prefix backend

Write-Info "Building frontend..."
npm run build --prefix frontend

Write-Success "Build complete. Your app is ready for deployment."
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your production values (DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, etc.)."
Write-Host "2. Add your GitHub remote if needed: git remote add origin <repo-url>"
Write-Host "3. Push to GitHub: git push -u origin main"
Write-Host "4. Deploy backend to Railway and frontend to Vercel using DEPLOYMENT.md."
