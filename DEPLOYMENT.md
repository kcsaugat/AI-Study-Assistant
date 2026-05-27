# 🚀 Deployment Guide - AI Study Assistant

This guide will help you deploy the AI Study Assistant to production using Railway (backend) and Vercel (frontend).

---

## 📋 Prerequisites

Before starting, make sure you have:
- A GitHub account ([github.com](https://github.com))
- A Railway account ([railway.app](https://railway.app)) 
- A Vercel account ([vercel.com](https://vercel.com))
- OpenAI API Key ([platform.openai.com/api-keys](https://platform.openai.com/api-keys))
- PostgreSQL database (Railway provides this)

---

## 🔧 Step 1: Push to GitHub

### 1.1 Initialize git locally (if not already done)

```bash
cd "AI STUDY ASSISTANT"
git init
git add .
git commit -m "Initial commit: AI Study Assistant"
```

### 1.2 Create a repository on GitHub

Go to [github.com/new](https://github.com/new) and create a repository named `ai-study-assistant`.

### 1.3 Connect and push

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-study-assistant.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Connect Railway to GitHub

1. Go to [railway.app](https://railway.app)
2. Sign in / Sign up with GitHub
3. Click **"+ New Project"**
4. Select **"Deploy from GitHub repo"**
5. Authorize Railway to access your GitHub account
6. Select the `ai-study-assistant` repository
7. Click **"Deploy Now"**

### 2.2 Configure Environment Variables on Railway

After Railway creates the project:

1. Go to your Railway project
2. Click the **Backend** service
3. Go to **Variables** tab
4. Add the following environment variables:

```
DATABASE_URL = (Railway creates this automatically for PostgreSQL)
JWT_SECRET = generate-a-random-64-character-string-here
JWT_REFRESH_SECRET = generate-another-random-64-character-string-here
OPENAI_API_KEY = sk-your-openai-api-key-here
NODE_ENV = production
PORT = 5000
FRONTEND_URL = https://your-vercel-app.vercel.app
```

To generate random secrets, you can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Add PostgreSQL Database

1. In the Railway project, click **"+ Add Service"**
2. Select **"PostgreSQL"**
3. Railway will automatically add the `DATABASE_URL` variable

### 2.4 Deploy

Once variables are set:
1. Railway should auto-deploy
2. You'll see logs confirming the deployment
3. Get your backend URL from the Railway dashboard (usually something like `https://backend-production.railway.app`)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Find and select `ai-study-assistant`
5. Click **"Import"**

### 3.2 Configure Vercel Settings

On the Vercel import page:

- **Project Name**: `ai-study-assistant`
- **Framework Preset**: Select `Vite`
- **Root Directory**: Leave blank (or set to `./`)
- **Build Command**: `npm run build --prefix frontend`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install && npm install --prefix frontend`

### 3.3 Add Environment Variables

Before deploying, add this environment variable:

```
VITE_API_URL = https://backend-production.railway.app/api
```

(Replace with your actual Railway backend URL + `/api`)

### 3.4 Deploy

Click **"Deploy"** and Vercel will build and deploy your frontend!

---

## ✅ Step 4: Test the Live App

Once both are deployed:

1. Get your Vercel URL (e.g., `https://ai-study-assistant.vercel.app`)
2. Open it in your browser
3. Create an account and test all features:
   - Upload a note
   - Generate a summary
   - Create a quiz
   - Generate flashcards
   - Chat with the AI tutor

---

## 📱 Access Your App

### Desktop
Visit: `https://ai-study-assistant.vercel.app`

### Mobile
Use the same URL on your phone's browser. The app is fully responsive and works on all devices.

---

## 🔧 Troubleshooting

### Backend not connecting
- Check that `FRONTEND_URL` on Railway matches your Vercel URL
- Check that `VITE_API_URL` on Vercel matches your Railway URL
- Verify all environment variables are set correctly

### Database errors
- Make sure PostgreSQL service is running on Railway
- Check that `DATABASE_URL` is set

### Deployment fails
- Check the logs in Railway/Vercel dashboards
- Verify all environment variables are configured
- Make sure your GitHub repo has all the files

---

## 🎉 Done!

Your AI Study Assistant is now live! Share the Vercel URL with others to let them use your app.

**Frontend URL**: `https://ai-study-assistant.vercel.app`
**Backend URL**: `https://backend-production.railway.app`

