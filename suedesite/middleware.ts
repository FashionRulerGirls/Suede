import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { GATE_COOKIE, gateToken } from '@/lib/gate';

export async function middleware(request: NextRequest) {
  // Pre-launch gate: when SITE_GATE_PASSWORD is set, block every page until a
  // visitor has proven the password (via the /gate form → /api/gate cookie).
  const pw = process.env.SITE_GATE_PASSWORD;
  if (pw) {
    const { pathname } = request.nextUrl;
    const isGate = pathname === '/gate' || pathname.startsWith('/api/gate');
    if (!isGate) {
      const token = request.cookies.get(GATE_COOKIE)?.value;
      const expected = await gateToken(pw);
      if (token !== expected) {
        const url = request.nextUrl.clone();
        url.pathname = '/gate';
        const dest = pathname + (request.nextUrl.search || '');
        url.search = dest && dest !== '/' ? `?next=${encodeURIComponent(dest)}` : '';
        return NextResponse.redirect(url);
      }
    }
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // everything except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|assets|brand-portal|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
