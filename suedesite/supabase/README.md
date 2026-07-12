# Suede — Supabase setup (Phase 1: Foundation)

This folder is the **database blueprint**. Running it turns your empty Supabase
project into Suede's real backend. You only do this once (and again if the schema
changes). Full design rationale lives in [`../docs/BACKEND_PLAN.md`](../docs/BACKEND_PLAN.md).

```
supabase/
  migrations/
    0001_init.sql      ← all tables + Suede Match function + brand_stats view
    0002_rls.sql       ← security rules (who can read/write what)
    0003_storage.sql   ← file buckets for avatars & review photos
  seed.sql             ← your 16 brands
```

---

## Step 1 — Apply the SQL (≈5 minutes, no coding)

**Easiest way — the Supabase dashboard:**

1. Open your project → **SQL Editor** → **New query**.
2. Open `migrations/0001_init.sql`, copy **all** of it, paste, click **Run**.
3. Repeat for `0002_rls.sql`, then `0003_storage.sql`, then `seed.sql` —
   **in that order.**
4. Check **Table Editor** — you should see `brands` with 16 rows, plus all the
   other tables.

*(Prefer the command line? With the Supabase CLI: `supabase link` then
`supabase db push`, and `supabase db execute -f supabase/seed.sql` for the seed.)*

Everything is re-runnable, so if you paste one twice it won't break.

---

## Step 2 — Connect the app

1. In your project → **Settings → API**, copy the **Project URL**, the **anon
   key**, and the **service_role key**.
2. In `suedesite/`, copy `.env.local.example` to **`.env.local`** and paste those
   three values in. (`.env.local` is git-ignored — the secrets never get committed.)
3. Restart `npm run dev`.

The app already has the Supabase clients wired (`lib/supabase/client.ts` for the
browser, `lib/supabase/server.ts` for the server). Screens get connected to real
data in the **next phases** — for now the app still runs on the mock data.

---

## Step 3 — Turn on Google & Apple sign-in

Dashboard → **Authentication → Providers**:

- **Google** — enable it, paste a Google OAuth client id/secret (free — from Google
  Cloud Console).
- **Apple** — enable it (requires a **paid Apple Developer account**).
- Add your site URL + `http://localhost:3000` under **URL Configuration** so redirects work.

New sign-ups automatically get a `profiles` row (a trigger handles it).

---

## Step 4 — Make yourself an admin

After you've signed up once, run this in the SQL Editor (use your email):

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

That unlocks the future admin dashboard and lets you manage brands/moderation.

---

## Good to know

- **Brand images** currently point at `/assets/models/*.png` (bundled with the app).
  Later we'll move them into the `brand-assets` bucket; for now they just work.
- **Ratings & follower counts start at 0.** The old numbers (e.g. "234 reviews")
  were mock — real numbers now come from real reviews via the `brand_stats` view.
- **Measurements** are stored as inches; raw numbers are never exposed to other
  members — only the Suede Match score/confidence, via a locked-down function.
- **Nothing is destructive.** These scripts only create/seed; they don't drop data.

Once this is applied and `.env.local` is set, tell me and we start **Phase 2 —
Auth & Profiles** (real sign-in + persisting Edit Profile / measurements).
