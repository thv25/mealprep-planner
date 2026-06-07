# 🥦 MealPrep Planner

A personalized AI-powered meal prep app built with React + Vite, deployed on Vercel.

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1 — Upload to GitHub
1. Go to [github.com](https://github.com) and sign in (create a free account if needed)
2. Click the **+** icon → **New repository**
3. Name it `mealprep-planner`, set it to **Public**, click **Create repository**
4. On your computer, open a terminal in this project folder and run:
```bash
npm install
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mealprep-planner.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Find and import your `mealprep-planner` repo
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **Deploy**

### Step 3 — Add your API key (important!)
1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-your-key-here`
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

Your app is now live at `https://mealprep-planner.vercel.app` 🎉

---

## 🌐 Embed on Your Website

Once deployed, paste this anywhere on your website:

```html
<iframe
  src="https://your-app-name.vercel.app"
  width="100%"
  height="900px"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"
></iframe>
```

Replace `your-app-name` with your actual Vercel URL.

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

Create a `.env` file in the root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
mealprep-planner/
├── api/
│   └── claude.js        ← Serverless proxy (keeps API key safe)
├── src/
│   ├── App.jsx          ← Main app component
│   └── main.jsx         ← React entry point
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## 🔒 How the API key stays safe

The app never calls Anthropic directly from the browser. Instead:
1. Browser → POST `/api/claude` (your Vercel function)
2. Vercel function → Anthropic API (using the secret key stored in Vercel)
3. Response flows back to the browser

Your key is never visible in the browser's network tab or source code.
