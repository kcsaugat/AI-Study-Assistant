# 🚀 FULLY AUTOMATED DEPLOYMENT GUIDE

> **Status**: All code is production-ready. Just follow these 3 simple steps to deploy!

---

## ⚠️ IMPORTANT: Install Git First

Before proceeding, install Git for Windows from: **https://git-scm.com/download/win**

1. Download Git for Windows
2. Run the installer
3. Accept all defaults
4. Restart your computer

Then come back and run the deployment script below.

---

## 📊 What You'll Get

After deployment, you'll have:

```
Frontend URL: https://ai-study-assistant.vercel.app
Backend URL: https://ai-study-assistant-api.railway.app
GitHub Repo: https://github.com/saugat287/ai-study-assistant
```

Anyone in the world can access your app using just the **Frontend URL**!

---

## 🎯 Deployment in 3 Steps

### STEP 1: Push to GitHub

Open PowerShell in your project folder and run:

```powershell
cd "C:\Users\ksaug\Desktop\AI STUDY ASSISTANT"

# Initialize Git (only first time)
git init
git config user.name "Saugat"
git config user.email "your-email@gmail.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Study Assistant - Fully functional with glasmorphic UI"

# Add remote (replace saugat287 with your GitHub username)
git remote add origin https://github.com/saugat287/ai-study-assistant.git

# Rename to main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Expected output**: "Enumerating objects: 100%, done..."

✅ **When done**: Your code appears at `https://github.com/saugat287/ai-study-assistant`

---

### STEP 2: Deploy Backend to Railway

1. Go to **https://railway.app**
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. Select your **ai-study-assistant** repository
5. Add a PostgreSQL database (+ New → Database → PostgreSQL)
6. Set these environment variables in Railway:

```
DATABASE_URL         = (auto-generated, copy from PostgreSQL service)
JWT_SECRET           = (Generate: run below in PowerShell)
JWT_REFRESH_SECRET   = (Generate: run below in PowerShell)
OPENAI_API_KEY       = sk-... (from https://platform.openai.com)
NODE_ENV             = production
FRONTEND_URL         = https://ai-study-assistant.vercel.app
```

**Generate JWT secrets in PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

✅ **When done**: You'll see a URL like `https://ai-study-assistant-api.railway.app`
Save this URL! You'll need it for Step 3.

---

### STEP 3: Deploy Frontend to Vercel

1. Go to **https://vercel.com**
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your **ai-study-assistant** repo
5. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build --prefix frontend`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && npm install --prefix frontend`
6. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://ai-study-assistant-api.railway.app/api` (from Railway Step 2)

✅ **When done**: Your app goes live at `https://ai-study-assistant.vercel.app`

---

## 🌐 Your Live App

After all 3 steps:

```
SHARE THIS URL WITH FRIENDS:
👉 https://ai-study-assistant.vercel.app
```

That's it! Anyone can visit this URL and use your AI Study Assistant!

---

## 🧪 Test Your Deployment

Open your Vercel URL and test:

- [ ] Sign up with email
- [ ] Create a note
- [ ] Summarize the note
- [ ] Generate a quiz
- [ ] Generate flashcards
- [ ] Chat with AI tutor
- [ ] Toggle dark mode
- [ ] Test on mobile phone

---

## 📱 How Your Friend Uses It

Your friend just needs to:

1. Visit: `https://ai-study-assistant.vercel.app`
2. Click "Register"
3. Create account with email
4. Start studying!

They **don't need to install anything**, no code, no setup. Just the URL!

---

## 🔐 Security Notes

- All passwords are encrypted with bcryptjs
- All API requests use HTTPS
- JWT tokens expire automatically
- Your OpenAI API key is secured on Railway (not exposed)
- Database credentials never leave Railway's secure servers

---

## 💾 Environment Variables Quick Reference

### What is an environment variable?
A secret setting that tells your app how to run in production.

### Why do we need them?
- Your OpenAI API key (secret!)
- Database connection (secret!)
- JWT tokens (secret!)

### Where do they go?
- **Backend**: Railway Dashboard → Environment Variables
- **Frontend**: Vercel Dashboard → Settings → Environment Variables

### Never share these!
```
DATABASE_URL (contains password)
JWT_SECRET (used to sign tokens)
OPENAI_API_KEY (costs money if exposed!)
```

---

## 🆘 Troubleshooting

### "Git not found"
→ Install Git from https://git-scm.com/download/win then restart

### "npm: command not found"
→ Install Node.js from https://nodejs.org then restart

### Railway deployment fails
→ Make sure `DATABASE_URL` is set in Environment Variables

### Vercel shows "API connection failed"
→ Make sure `VITE_API_URL` in Vercel matches your Railway backend URL

### "Cannot find backend"
→ Wait 5 minutes for Railway to fully deploy, then try again

---

## 📞 Support URLs

- GitHub Issues: `https://github.com/saugat287/ai-study-assistant/issues`
- OpenAI API: `https://platform.openai.com`
- Railway Help: `https://docs.railway.app`
- Vercel Help: `https://vercel.com/docs`

---

## ✨ Features Your App Has

✅ **Authentication** - Sign up, login, logout
✅ **Notes** - Create, read, update, delete notes
✅ **AI Summarize** - Generate summaries with OpenAI
✅ **Quiz Generator** - Create multiple-choice quizzes
✅ **Flashcards** - Generate and study flashcards
✅ **AI Tutor** - Chat with AI about your study material
✅ **Dark Mode** - Switch between light and dark themes
✅ **Mobile Responsive** - Works on phones, tablets, laptops
✅ **Glasmorphic UI** - Modern, futuristic design
✅ **Fast & Secure** - Production-grade security

---

## 🎉 You're Done!

After these 3 steps, you have a **professional, live web application** that:
- Works from any device (desktop, mobile, tablet)
- Is used by anyone with the URL
- Is secure and production-ready
- Scales automatically
- Costs almost nothing to run

**Share this URL with your friends:**
```
https://ai-study-assistant.vercel.app
```

Enjoy your app! 🚀

