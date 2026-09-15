import { NextResponse } from 'next/server';

// Returns the currently deployed build id. Never cached, so an installed PWA
// can poll it and compare against its own NEXT_PUBLIC_BUILD to detect a newer
// deploy and reload. See components/RegisterSW.tsx.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { build: process.env.NEXT_PUBLIC_BUILD || 'dev' },
    { headers: { 'cache-control': 'no-store, no-cache, must-revalidate, max-age=0' } },
  );
}
