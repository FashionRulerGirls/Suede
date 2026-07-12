import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/* Landing spot for OAuth (Google), email-confirmation, and password-recovery
   links. Supabase can send these back in a few shapes, so we handle all of
   them: a PKCE `code`, or a `token_hash` + `type` (email OTP). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | 'recovery' | null;
  const errorDescription = searchParams.get('error_description');
  const isRecovery = type === 'recovery';

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(errorDescription)}`);
  }

  const supabase = createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('This link is invalid or has expired.')}`);
  }

  return NextResponse.redirect(`${origin}${isRecovery ? '/?recovery=1' : '/'}`);
}
