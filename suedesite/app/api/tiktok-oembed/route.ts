import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Resolve a TikTok URL to its embeddable video id via TikTok's public oEmbed.
   Needed for share/short links (vm.tiktok.com, tiktok.com/t/…) and /photo/
   posts where the id isn't in the URL. We only ever fetch tiktok.com (the
   user's URL is passed as an oEmbed query param, never fetched directly), so
   there's no SSRF surface; we still require a tiktok.com URL. */

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get('u') || '';
  if (!/^https?:\/\/([a-z0-9-]+\.)?tiktok\.com\//i.test(u)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const r = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(u), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SuedeBot/1.0)' },
    });
    if (!r.ok) return NextResponse.json({ ok: false }, { status: 502 });
    const data: any = await r.json();
    const html: string = data.html || '';
    const id =
      (html.match(/data-video-id="(\d+)"/) || [])[1] ||
      (String(data.embed_product_id || '').match(/\d+/) || [])[0] ||
      null;
    return NextResponse.json({
      ok: !!id,
      videoId: id,
      thumbnail: data.thumbnail_url || null,
      author: data.author_name || null,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
