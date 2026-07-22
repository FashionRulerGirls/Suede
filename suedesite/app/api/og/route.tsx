import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

// Read lazily at request time (not module load, which breaks the build) and
// cache. next.config's outputFileTracingIncludes bundles these on Vercel.
let _fonts: { cormorant: Buffer; jost: Buffer } | null = null;
function fonts() {
  if (!_fonts) {
    const dir = join(process.cwd(), 'app/api/og/fonts');
    _fonts = {
      cormorant: readFileSync(join(dir, 'Cormorant-Medium.ttf')),
      jost: readFileSync(join(dir, 'Jost-Regular.ttf')),
    };
  }
  return _fonts;
}

// The real Suede wordmark (recolored to ink), embedded as a data URI.
let _wordmark: string | null = null;
function wordmark() {
  if (!_wordmark) {
    const svg = readFileSync(join(process.cwd(), 'app/api/og/assets/wordmark.svg'));
    _wordmark = 'data:image/svg+xml;base64,' + svg.toString('base64');
  }
  return _wordmark;
}

const INK = '#14120F';
const LINEN = '#F4F0EA';
const MUTED = '#6a5f55';

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={filled ? INK : 'none'} stroke={INK} strokeWidth="1.2">
      <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.5 1.4 6.6L12 17.9 5.9 21l1.4-6.6L2.5 9.9l6.6-.7z" />
    </svg>
  );
}

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const kind = p.get('kind') === 'inquiry' ? 'inquiry' : 'review';
  const brand = (p.get('brand') || 'Suede').slice(0, 40);
  const product = (p.get('product') || '').slice(0, 60);
  // Keep the in-card quote short — it must stay legible when a phone shrinks the
  // preview; the full text lives in the shared page's description.
  const snippet = (p.get('snippet') || '').slice(0, 120);
  const by = (p.get('by') || '').slice(0, 40);
  const ratingRaw = parseFloat(p.get('rating') || '');
  const rating = Number.isFinite(ratingRaw) ? ratingRaw : null;
  const img = p.get('img') || '';

  const eyebrow = kind === 'inquiry' ? 'An Inquiry on Suede' : 'A Review on Suede';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: LINEN, fontFamily: 'Jost' }}>
        {img ? (
          <div style={{ display: 'flex', width: 500, height: '100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} width={500} height={630} style={{ objectFit: 'cover', objectPosition: 'center top' }} alt="" />
          </div>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '64px 70px' }}>
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 5, textTransform: 'uppercase', color: MUTED }}>{eyebrow}</div>
          <div style={{ display: 'flex', fontFamily: 'Cormorant', fontSize: 88, color: INK, textTransform: 'uppercase', marginTop: 12, letterSpacing: 2, lineHeight: 1 }}>{brand}</div>
          {rating != null ? (
            <div style={{ display: 'flex', gap: 9, marginTop: 22 }}>
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} filled={i < Math.round(rating)} />)}
            </div>
          ) : null}
          {product ? <div style={{ display: 'flex', fontSize: 30, color: MUTED, marginTop: 22 }}>{product}</div> : null}
          {snippet ? (
            <div style={{ display: 'flex', fontSize: 34, lineHeight: 1.35, color: INK, marginTop: 22 }}>
              {kind === 'review' ? `“${snippet}”` : snippet}
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto', paddingTop: 30 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wordmark()} width={104} height={46} alt="Suede" />
            {by ? <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>· {by}</div> : null}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Cormorant', data: fonts().cormorant, weight: 500, style: 'normal' },
        { name: 'Jost', data: fonts().jost, weight: 400, style: 'normal' },
      ],
    },
  );
}
