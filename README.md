# Pocket Fund – Internal Support Dashboard (Supabase Edition)

Real-time, multi-user HR dashboard with persistent cloud database.

---

## 🚀 Setup Guide (10 minutes)

### Step 1: Create Supabase Project (2 min)

1. Go to **[supabase.com](https://supabase.com)** → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `pocket-fund`
   - **Database Password:** (save this somewhere)
   - **Region:** Pick closest to your team (e.g., Mumbai for India)
4. Wait ~1 minute for the project to spin up

### Step 2: Create the Database Table (1 min)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy-paste the **entire contents** of `sql/schema.sql` into the editor
4. Click **"Run"** (green button)
5. You should see "Success" — that's it!

### Step 3: Get Your API Keys (1 min)

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** → looks like `https://abcdefg.supabase.co`
   - **anon public** key → the long string under "Project API keys"

### Step 4: Create `.env` File (1 min)

In your project folder, create a file called `.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 3.

### Step 5: Install & Run Locally (2 min)

```bash
cd pocket-fund-supabase
npm install
npm run dev
```

Open `http://localhost:5173` — you should see the login screen.
Log in with `hello@pocket-fund.com` / `920537` to test as admin.

### Step 6: Deploy to Vercel (3 min)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Supabase backend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pocket-fund.git
   git push -u origin main
   ```

2. In **Vercel Dashboard**:
   - Import the repo (or if updating existing project, it auto-deploys)
   - Go to **Settings** → **Environment Variables**
   - Add these two:
     | Key | Value |
     |-----|-------|
     | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
     | `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
   - **Redeploy** (Deployments tab → click "..." → Redeploy)

3. Done! Your app is now live with persistent data.

---

## ✅ What Changed from Previous Version

| Before | After |
|--------|-------|
| localStorage (browser only) | Supabase PostgreSQL (cloud) |
| Data lost on cache clear | Data persists forever |
| Each browser has own data | Everyone shares same data |
| No sync between users | Auto-syncs every 30 seconds |

The app code is 99% identical. Only the **storage adapter** changed — it now routes to Supabase instead of localStorage. Session (who's logged in) stays in localStorage since that's per-device.

---

## 🔄 How Multi-User Sync Works

- Data auto-refreshes from Supabase every **30 seconds**
- Green WiFi icon in header = connected & synced
- Click it to manually sync anytime
- When you create a ticket, leave request, or announcement, it's instantly saved to the cloud
- Other users see changes on their next auto-refresh (max 30s delay)

---

## 🔐 Login Credentials

| Name | Email | Passcode |
|------|-------|----------|
| **Admin** | hello@pocket-fund.com | 920537 |
| Dev | dev@pocket-fund.com | 614852 |
| Aum | aum@pocket-fund.com | 735926 |
| Aabhas | aabhas@pocketfund.org | 847291 |

See `src/App.jsx` → `INITIAL_EMPLOYEES` for all 18 accounts.

---

## 🗄️ Database

Your data lives in a single `app_data` table in Supabase (key-value store):

| Key | Contains |
|-----|----------|
| `pocketfund-employees` | All employee records |
| `pocketfund-tickets` | All support tickets |
| `pocketfund-leaves` | All leave requests |
| `pocketfund-announcements` | All announcements |
| `pocketfund-notifications` | All notifications |
| `pocketfund-salary` | Salary status records |
| `pocketfund-activities` | Activity log |

You can view/edit this data anytime in Supabase Dashboard → Table Editor → `app_data`.

---

## ⚠️ Important Notes

- **First launch**: The first user to open the app seeds the database with initial employee data. This takes a few seconds.
- **Environment variables**: The `.env` file must NOT be committed to Git (it's in `.gitignore`). Add the values directly in Vercel's Environment Variables settings.
- **Supabase free tier**: 500MB database, 5GB bandwidth, unlimited API requests — more than enough for your team.
