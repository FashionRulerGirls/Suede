/* Server-side Supabase client (Server Components, Route Handlers, Server
   Actions). Reads/writes the auth session from cookies. */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — safe to ignore; middleware
            // refreshes the session cookie instead.
          }
        },
      },
    },
  );
}

/* Admin client — SERVER ONLY. Uses the service-role key and bypasses RLS.
   Use only in trusted server code (moderation jobs, notification writes).
   Never import this into a Client Component. */
import { createClient as createSbClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
