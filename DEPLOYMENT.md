# GovSense AI — Deployment Guide

This guide walks through deploying the full stack: **MongoDB Atlas** (database) →
**Render** (backend API) → **Vercel** (frontend) → **n8n** (automation).

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → add a database user with a strong password.
3. **Network Access** → add `0.0.0.0/0` (allow access from anywhere) so Render can connect,
   or restrict to Render's outbound IPs if you're on a paid Render plan with static IPs.
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/govsense-ai
   ```
5. Save this as `MONGO_URI` for the backend.

---

## 2. Backend → Render

1. Push the `backend/` folder to a Git repository (GitHub/GitLab/Bitbucket).
2. In [Render](https://render.com), **New → Web Service** → connect the repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18+ (set via `engines` in `package.json`, already configured)
4. Add environment variables (Render dashboard → **Environment**) — copy every key from
   `backend/.env.example` and fill in real values:

   | Variable | Notes |
   |---|---|
   | `MONGO_URI` | From step 1 |
   | `JWT_SECRET` / `JWT_REFRESH_SECRET` | Generate with `openssl rand -hex 32` |
   | `CLIENT_URL` | Your deployed Vercel URL, e.g. `https://govsense-ai.vercel.app` |
   | `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/) |
   | `AI_PROVIDER` | `gemini` or `huggingface` |
   | `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | SMTP credentials (Gmail App Password works) |
   | `N8N_WEBHOOK_URL` | Your n8n Workflow 1 webhook (production URL) |
   | `N8N_API_KEY` | Any random string — must match the same value in n8n |
   | `PORT` | Render sets this automatically; the app reads `process.env.PORT` |

5. Deploy. Once live, verify with:
   ```
   curl https://your-backend.onrender.com/api/health
   ```
6. **First-time setup**: run the seed script once to create the default admin account,
   departments, and categories. Render → **Shell** tab:
   ```
   npm run seed
   ```
   Then immediately log in as the seeded admin and change the password.

> **Free tier note**: Render's free web services spin down after inactivity, causing a
> ~30-60s cold start on the first request. Fine for demos; use a paid instance (or a
> cron-based keep-alive ping) for production.

---

## 3. Frontend → Vercel

1. Push the `frontend/` folder to the same or a separate repo.
2. In [Vercel](https://vercel.com), **Add New → Project** → import the repo.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment variables:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_APP_NAME` | `GovSense AI` |

5. Deploy. Vercel gives you a URL like `https://govsense-ai.vercel.app` — set this as
   `CLIENT_URL` back in Render (step 2) and redeploy the backend so CORS and email links work.

---

## 4. CORS checklist

The backend's CORS config (`server.js`) reads `CLIENT_URL` from env and allows only that
origin with credentials. If you add a custom domain or a preview deployment URL, either:
- Update `CLIENT_URL` to the new domain, or
- Modify the `cors()` call in `server.js` to accept an array of allowed origins.

---

## 5. n8n hosting

Pick one:
- **n8n Cloud** (managed, easiest) — [n8n.io/cloud](https://n8n.io/cloud)
- **Self-hosted on Render/Railway** — deploy the official `n8nio/n8n` Docker image
- **Self-hosted on a VPS** — `docker run -it --rm -p 5678:5678 n8nio/n8n`

Once running:
1. Import all 4 JSON files from `n8n/workflows/` (Workflows → Import from File).
2. Set the environment variables listed in `n8n/README.md` (`BACKEND_URL`, `N8N_API_KEY`, etc.).
3. Add SMTP, Slack, and Google Drive credentials as needed.
4. Activate each workflow. Copy Workflow 1's **production webhook URL** into the backend's
   `N8N_WEBHOOK_URL` env var on Render, then redeploy.

---

## 6. Custom domains (optional)

- **Vercel**: Project → Settings → Domains → add your domain, update DNS as instructed.
- **Render**: Service → Settings → Custom Domain → add your domain, update DNS.
- Remember to update `CLIENT_URL` (backend) and `VITE_API_BASE_URL` (frontend) to match
  your final domains, and re-deploy both.

---

## 7. Post-deploy checklist

- [ ] `GET /api/health` returns `{ success: true }`
- [ ] Seed script run once (`npm run seed`) and admin password changed
- [ ] Citizen registration → email verification link works (check spam folder first)
- [ ] Submit a test feedback → confirm AI sentiment appears within a few seconds
- [ ] Officer login (create via Admin → Manage Officers, then approve) → dashboard loads
      with charts
- [ ] PDF and Excel export download correctly
- [ ] n8n Workflow 1 fires on feedback submission (check n8n execution log)
- [ ] Dark mode, language switcher, and voice input all function in production
