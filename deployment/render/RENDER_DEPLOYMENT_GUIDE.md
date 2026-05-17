# Render Deployment Guide
# Real-Time Multi-Agent RL Recommendation Platform
# Completely FREE — No credit card needed

---

## What Render Gives You Free

| Resource        | Free Limit              |
|-----------------|-------------------------|
| Web Services    | 1 free service          |
| Static Sites    | Unlimited               |
| MongoDB         | 1 GB free (90 days)     |
| Bandwidth       | 100 GB/month            |
| Build Minutes   | 500 min/month           |

---

## STEP 1 — Push Project to GitHub

Render deploys FROM GitHub. So first push your project to GitHub.

### Create GitHub Account (if you don't have one)
```
Go to: https://github.com
Sign up with your email
```

### Push Project to GitHub
```bash
# On your laptop — install Git if not installed
# https://git-scm.com/downloads

# Open terminal in your project folder
cd mtech-project-v2

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - MTech RL Recommendation Platform"

# Go to github.com → Click "+" → New repository
# Name: mtech-rl-project
# Keep it Public
# Click "Create repository"

# Connect and push (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mtech-rl-project.git
git branch -M main
git push -u origin main
```

---

## STEP 2 — Sign Up on Render

```
1. Go to: https://render.com
2. Click "Get Started for Free"
3. Click "Continue with GitHub"
4. Authorize Render to access GitHub
5. You are in — no credit card asked!
```

---

## STEP 3 — Set Up MongoDB (Free Database)

```
1. On Render dashboard → click "New +"
2. Click "PostgreSQL" ... wait — for MongoDB:
   → Click "New +" → "Web Service"

Actually for MongoDB free use MongoDB Atlas:
Go to: https://www.mongodb.com/atlas
→ Sign up free (no credit card)
→ Create free cluster (M0 — forever free)
→ Click "Connect" → "Drivers"
→ Copy the connection string:
   mongodb+srv://username:password@cluster.mongodb.net/mtech_rl_rec
```

---

## STEP 4 — Deploy Backend on Render

```
1. Render Dashboard → Click "New +" → "Web Service"
2. Connect your GitHub → Select "mtech-rl-project"
3. Fill these settings:

   Name:           mtech-rl-backend
   Region:         Singapore (closest to India)
   Branch:         main
   Root Directory: backend
   Runtime:        Node
   Build Command:  npm install
   Start Command:  node server.js
   Plan:           Free

4. Add Environment Variables (click "Add Environment Variable"):

   Key: NODE_ENV          Value: production
   Key: PORT              Value: 5000
   Key: JWT_SECRET        Value: (click Generate — auto creates secure key)
   Key: MONGO_URI         Value: (paste your MongoDB Atlas connection string)
   Key: ALLOWED_ORIGINS   Value: https://mtech-rl-frontend.onrender.com

5. Click "Create Web Service"
6. Wait 3-5 minutes for build to complete
7. You get a URL like: https://mtech-rl-backend.onrender.com
```

---

## STEP 5 — Deploy Frontend on Render

```
1. Render Dashboard → Click "New +" → "Static Site"
2. Connect same GitHub repo
3. Fill these settings:

   Name:             mtech-rl-frontend
   Branch:           main
   Root Directory:   frontend
   Build Command:    npm install && npm run build
   Publish Directory: build

4. Add Environment Variable:
   Key: REACT_APP_API_URL
   Value: https://mtech-rl-backend.onrender.com

5. Click "Create Static Site"
6. Wait 3-5 minutes
7. You get URL: https://mtech-rl-frontend.onrender.com
```

---

## STEP 6 — Update Backend URL in Frontend

In your project, open:
frontend/src/utils/api.js

Change:
```js
const API = axios.create({ baseURL: "/api" });
```

To:
```js
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "/api"
});
```

Then push to GitHub — Render auto-redeploys!

---

## STEP 7 — Seed the Database

```
1. Go to Render Dashboard
2. Click your backend service "mtech-rl-backend"
3. Click "Shell" tab (top right)
4. Type:
   node scripts/seed.js
5. You should see:
   Seeded 12 items, 1 admin, 1 student
```

---

## STEP 8 — Access Your Live App

```
Your live URLs:
Frontend: https://mtech-rl-frontend.onrender.com
Backend:  https://mtech-rl-backend.onrender.com/api/health
```

Share the frontend URL with your professor!

---

## Important Notes for Free Tier

| Issue              | Reason & Fix                                      |
|--------------------|---------------------------------------------------|
| App sleeps after 15 min | Free tier spins down — first visit takes 30-60 sec to wake up |
| Build fails        | Check build logs in Render dashboard              |
| MongoDB connection  | Make sure Atlas IP whitelist is set to 0.0.0.0/0 |
| CORS error         | Make sure ALLOWED_ORIGINS has your frontend URL   |

---

## Demo Credentials
```
Admin:   admin@mtech.edu   / admin123
Student: student@mtech.edu / student123
```
