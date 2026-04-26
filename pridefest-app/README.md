# 🌈 Shoals PrideFest 2026 — Project Tracker

Subcommittee project tracker with passcode-protected workspaces and a board-level overview.

---

## PASSCODES — KEEP THIS SAFE

| Subcommittee | Passcode |
|---|---|
| Venue Design & Local Art | `VENUE826` |
| Operations, Safety & Logistics | `OPS2026` |
| Community Outreach / Partnerships / Fundraising | `OUT417` |
| Programming & Entertainment | `PROG553` |
| Branding & Marketing: DESIGN | `BRD991` |
| Branding & Marketing: IMPLEMENTATION | `BRI664` |
| **Board (View Only)** | `BOARD2026` |

---

## DEPLOYMENT — Step by Step

### STEP 1 — Set up Supabase (your database)

1. Go to **supabase.com** and click "Start your project"
2. Sign in with GitHub (use that same GitHub account)
3. Click **"New Project"**
4. Name it `shoals-pridefest` — pick any password — choose closest region — click Create
5. Wait about 2 minutes for it to set up
6. Once ready, click **"SQL Editor"** in the left sidebar
7. Click **"New Query"**
8. Open the file `supabase_setup.sql` from this folder, copy everything, paste it in, click **Run**
9. You should see "Success" — your database tables are created
10. Now go to **Project Settings → API** (left sidebar)
11. Copy the **"Project URL"** — save it somewhere
12. Copy the **"anon public"** key — save it somewhere

### STEP 2 — Put your app code on GitHub

1. Go to **github.com** and log in
2. Click the **+** button (top right) → **New repository**
3. Name it `shoals-pridefest-tracker`
4. Leave it **Public** (required for free Vercel hosting)
5. Click **Create repository**
6. GitHub will show you a page with instructions — look for the section that says **"…or upload an existing file"** and click it
7. Drag ALL the files and folders from this project folder into the upload area
8. Scroll down, click **Commit changes**

### STEP 3 — Deploy on Vercel

1. Go to **vercel.com** and click "Sign Up" → choose "Continue with GitHub"
2. Click **"Add New Project"**
3. Find `shoals-pridefest-tracker` in your repository list and click **Import**
4. Vercel will auto-detect it's a React app — don't change any settings
5. BEFORE you click Deploy, look for **"Environment Variables"** and add these two:
   - Name: `REACT_APP_SUPABASE_URL` / Value: (paste your Supabase Project URL)
   - Name: `REACT_APP_SUPABASE_ANON_KEY` / Value: (paste your Supabase anon key)
6. Click **Deploy**
7. Wait about 2 minutes — Vercel will give you a live URL like `shoals-pridefest-tracker.vercel.app`

### STEP 4 — Share it!

- Send the URL to each subcommittee lead along with their passcode
- Send the board URL + board passcode (`BOARD2026`) to the board
- That's it — the app is live!

---

## TO CHANGE A PASSCODE

Open `src/App.js` and find the `PASSCODES` section near the top.
Change any code value, save the file, commit it to GitHub, and Vercel will automatically redeploy.

---

## NEED HELP?

The app was built by Claude (Anthropic's AI). If something breaks or you need changes, bring this entire project folder back to Claude and describe what you need.
