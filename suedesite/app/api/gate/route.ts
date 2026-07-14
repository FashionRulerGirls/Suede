import { NextResponse } from 'next/server';
import { GATE_COOKIE, gateToken, timingSafeEqualHex } from '@/lib/gate';

// Verify the pre-launch password. On success, set a hashed cookie the
// middleware recognises for 30 days. No-ops (allows through) when the gate
// is disabled.
export async function POST(request: Request) {
  const pw = process.env.SITE_GATE_PASSWORD;
  if (!pw) return NextResponse.json({ ok: true });

  let password = '';
  try {
    const body = await request.json();
    password = String(body?.password ?? '');
  } catch {
    // no/invalid body → treated as wrong password
  }

  // Compare SHA-256 digests in constant time: avoids a timing side-channel and
  // never branches on the plaintext password length.
  if (!timingSafeEqualHex(await gateToken(password), await gateToken(pw))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, await gateToken(pw), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
