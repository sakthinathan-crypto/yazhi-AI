# YAZHI – Production Deployment Guide

## 1. Backend Deployment (Railway)
1. Fork or push the repository to GitHub.
2. Sign in to [Railway](https://railway.app/).
3. Click **New Project** > **Deploy from GitHub repo**.
4. Select the repository and set the **Root Directory** to `/backend`.
5. Railway will automatically detect the `Dockerfile`.
6. Add the following environment variables in Railway project settings:
   - `GEMINI_API_KEY`
   - `EXOTEL_ACCOUNT_SID`
   - `EXOTEL_API_KEY`
   - `EXOTEL_API_TOKEN`
   - `EXOTEL_PHONE_NUMBER`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `APP_URL` (set to your generated railway domain, e.g. `https://yazhi-backend.up.railway.app`)
7. Generate a public domain under **Settings > Domains**.
8. Verify health endpoint: `https://<your-railway-url>/api/health`.

---

## 2. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com/).
2. Import the Git repository.
3. Configure the build settings:
   - Framework Preset: **Vite**
   - Root Directory: `.` (or `/frontend` if deployed from isolated subfolder)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-railway-url>`
5. Click **Deploy**.

---

## 3. Database Deployment (Supabase)
1. Create a new project in [Supabase](https://supabase.com/).
2. Open the **SQL Editor**.
3. Paste the contents of `database/schema.sql` and click **Run**.
4. Copy the Project URL and Service Role Key from **Settings > API** to your backend environment variables.
