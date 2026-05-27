#!/bin/bash
# Quick environment setup script

echo "🔧 AI Study Assistant - Environment Setup"
echo "=========================================="
echo ""

# Backend setup
echo "Setting up backend environment..."
cd backend

if [ -f .env ]; then
    echo "✓ backend/.env already exists"
else
    cp .env.example .env
    echo "✓ Created backend/.env from .env.example"
    echo "⚠️  Please edit backend/.env with your values:"
    echo "   - JWT_SECRET (generate: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
    echo "   - JWT_REFRESH_SECRET (generate another one)"
    echo "   - OPENAI_API_KEY (get from platform.openai.com)"
    echo "   - DATABASE_URL (for development: file:./dev.db)"
fi

cd ..

# Frontend setup
echo ""
echo "Setting up frontend environment..."
cd frontend

if [ -f .env ]; then
    echo "✓ frontend/.env already exists"
else
    cp .env.example .env
    echo "✓ Created frontend/.env"
fi

cd ..

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Run: npm run install:all"
echo "3. Run: npm run dev"
