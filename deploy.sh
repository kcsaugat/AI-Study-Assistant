#!/usr/bin/env bash
set -e

echo "AI Study Assistant Deployment Helper"
echo "======================================"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required. Install from https://nodejs.org."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required. Install Node.js from https://nodejs.org."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Warning: Git is not installed or not available in PATH."
  echo "Install Git from https://git-scm.com/downloads and re-run this script."
  exit 1
fi

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from backend/.env.example"
  echo "Please edit backend/.env with your secrets."
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "Created frontend/.env from frontend/.env.example"
  echo "Please set VITE_API_URL in frontend/.env after deployment."
fi

if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit: AI Study Assistant ready for deployment"
fi

echo "Installing dependencies..."
npm install
npm install --prefix backend
npm install --prefix frontend

echo "Building backend..."
npm run build --prefix backend

echo "Building frontend..."
npm run build --prefix frontend

echo "Build complete. Your app is ready for deployment."
echo "Next steps:"
echo "1. Edit backend/.env with production values."
echo "2. Add your GitHub remote if needed."
echo "3. Push to GitHub: git push -u origin main"
echo "4. Deploy backend to Railway and frontend to Vercel using DEPLOYMENT.md."
