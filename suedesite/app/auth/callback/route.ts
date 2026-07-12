import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* OAuth (Google/Apple) and password-recovery links land here. We exchange the
   one-time code for a real session (stored in cookies) then send the user back
   into the app. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // recovery links open the reset-password screen; everything else goes home
  const dest = type === 'recovery' ? '/?recovery=1' : '/';
  return NextResponse.redirect(`${origin}${dest}`);
}
