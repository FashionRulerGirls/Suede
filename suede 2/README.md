# Suede — Foundation

The owned-stack foundation for Suede: Next.js (App Router) + Supabase (Postgres, Auth, Storage), everything under your own accounts. This is **build step 1** of the reconstruction spec — auth, profile, and the full database are wired and running. The Capsule, Lookbook, Collective, brand portal, and affiliate layer come in later steps.

## What's in here

```
suede/
├─ supabase/migrations/0001_init.sql   ← full schema + RLS (run this in Supabase)
├─ src/
│  ├─ middleware.js                     ← refreshes sessions, guards /profile
│  ├─ lib/supabase/                     ← server + browser + middleware clients
│  └─ app/
│     ├─ page.js                        ← home ("I'm a brand" entry included)
│     ├─ auth/                          ← login, signup, email confirm, signout
│     └─ profile/page.js                ← protected; reads profile + measurements
├─ .env.local.example
└─ package.json
```

## Setup (about 15 minutes)

### 1. Create the Supabase project
- Go to supabase.com → New project (under **your** account). Pick a region near you, set a DB password.
- When it's ready: **SQL Editor → New query → paste all of `supabase/migrations/0001_init.sql` → Run.** This creates every table, the signup trigger, and RLS policies.

### 2. Get your keys
- Project Settings → **API**. Copy the **Project URL** and the **anon** (or new **publishable `sb_publishable_…`**) key.

### 3. Configure the app
- Copy `.env.local.example` to `.env.local` and fill in both values.
- In Supabase → Authentication → **URL Configuration**, add your redirect URLs:
  `http://localhost:3000/auth/confirm` and (after deploy) `https://your-domain/auth/confirm`.

### 4. Run it
```bash
npm install
npm run dev
```
Open http://localhost:3000. Create an account → confirm via the email link → land on `/profile`. The profile page reads live from the `profiles` and `measurements` tables, so if it renders, the whole stack (auth → cookies → RLS → DB) is working.

### 5. Make yourself admin
After signing up once, in Supabase SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 6. Deploy
- Push to your GitHub (FashionRulerGirls), import the repo in Vercel.
- Add the two env vars in Vercel → Project → Settings → Environment Variables.
- Point suedecapsule.com at the Vercel project. Add the production `/auth/confirm` URL to Supabase Auth settings.

## Notes
- **Auth** uses `@supabase/ssr` with HTTP-only cookies; server-side checks use `getUser()` (token verified), never `getSession()`.
- **RLS** is on for every table. Members read the directory and each other's measurement badges (the Collective model); brand-portal internals and `affiliate_conversions` are locked to admin/service-role. Tighten or open policies as features land.
- **Brand portal** is a separate auth scope (per spec) — the `/brand/*` routes and `brand_accounts` auth are wired in the brand-portal build step, not here.
- **JavaScript, not TypeScript**, to match your existing Quick Fit codebase. Easy to migrate later if you want types.

## Next build steps (from the spec)
2. Profile + measurement intake (plug in Quick Fit + the self-guided tool).
3. The Capsule → 4. The Lookbook → 5. The Collective → 6. Brand portal → 7. Admin → 8. Affiliate → 9. Consign.
