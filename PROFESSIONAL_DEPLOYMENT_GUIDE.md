# 🚀 Professional Deployment Guide

Congratulations on finishing the AI Study Assistant! This guide will help you deploy your application to the internet so you and your friends can access it from anywhere (desktop or mobile) entirely for free!

## Overview of the Architecture
We will use three incredible free services to host your web app:
1. **Neon** or **Supabase** (Database): To store users, notes, quizzes, and chats.
2. **Render** or **Railway** (Backend): To run your Node.js/Express server and AI integrations.
3. **Vercel** (Frontend): To host the React/Vite user interface.

---

## Step 1: Set Up the Database (Neon)
1. Go to [Neon.tech](https://neon.tech) and sign up.
2. Create a new project (name it `ai-study-db`).
3. Once created, copy the **Connection String** (it starts with `postgresql://...`).
4. Save this string; you will need it for the Backend deployment.

---

## Step 2: Deploy the Backend (Render)
1. Go to [Render.com](https://render.com) and sign up with GitHub.
2. Push your `AI STUDY ASSISTANT` code to a new GitHub repository.
3. On Render, click **New +** and select **Web Service**.
4. Connect your GitHub account and select your repository.
5. Configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start`
6. Scroll down to **Environment Variables** and add the following:
   - `DATABASE_URL`: *(paste the connection string from Step 1)*
   - `JWT_SECRET`: *(type a random long password)*
   - `JWT_REFRESH_SECRET`: *(type another random long password)*
   - `OPENAI_API_KEY`: *(paste your real OpenAI API key when you have one)*
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: *(Leave this blank for now, we will come back to update it)*
7. Click **Create Web Service**. Wait 2-3 minutes for it to build and deploy.
8. Once live, copy your backend URL (e.g., `https://ai-study-backend.onrender.com`).

---

## Step 3: Deploy the Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
5. Open **Environment Variables** and add:
   - `VITE_API_URL`: *(paste your Render backend URL here, e.g., `https://ai-study-backend.onrender.com/api`)*
6. Click **Deploy**. Wait for the confetti! 🎉
7. Copy your new frontend URL (e.g., `https://ai-study-frontend.vercel.app`).

---

## Step 4: Final Connection
1. Go back to your Backend dashboard on **Render**.
2. Go to **Environment Variables**.
3. Update `FRONTEND_URL` to be your Vercel URL (e.g., `https://ai-study-frontend.vercel.app`).
4. **Redeploy** the Render service for the changes to take effect.

---

## Step 5: How to Share With Friends! 🌍
Your app is now live! 

### Instructions for your friends:
1. **Send them the link**: Just send them your Vercel URL! 
   *(Example message: "Hey! Check out this new AI Study App I built: https://your-vercel-link.app")*
2. **How they use it**:
   - They click the link on their phone or laptop.
   - They click **Register** to create a free account.
   - They can instantly start pasting in their notes and chatting with the AI!
   - Because you've added mobile responsiveness and draggable high-class animations, it will look stunning on their phones.

Enjoy your new premium application!
