import type { Metadata } from 'next';
import App from '@/components/App';
import { getOgReview, getOgInquiry, type OgEntity } from '@/lib/ogData';

/* The shopper site is a single-page app that now uses real URL paths
   (/lookbook, /brand/<slug>, /review/<id>, …). This catch-all serves that same
   app for any non-root path so deep links load and refresh works. More
   specific routes (/admin, /portal, /api, /auth) take precedence over this. */
export const dynamic = 'force-dynamic';

const SITE = 'https://suedecapsule.com';

// Per-entity social preview tags so a shared review/inquiry link unfurls with
// its own photo, title, and text (scrapers read this server-rendered HTML).
export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const slug = params.slug || [];
  const [type, id] = slug;
  let ent: OgEntity | null = null;
  try {
    if (type === 'review' && id) ent = await getOgReview(id);
    else if (type === 'inquiry' && id) ent = await getOgInquiry(id);
  } catch { ent = null; }
  if (!ent) return {}; // fall back to the site-level defaults in layout.tsx

  const path = `/${type}/${id}`;
  const label = ent.kind === 'review' ? 'Review' : 'Inquiry';
  const titleBase = ent.brand ? `${ent.brand}${ent.product ? ' — ' + ent.product : ''}` : label;
  const title = `${titleBase} · ${label} on Suede`;
  const description = ent.snippet
    || `${ent.kind === 'review' ? 'A review' : 'An inquiry'} on Suede — honest fit and quality from people who share your measurements.`;

  const qp = new URLSearchParams({ kind: ent.kind, brand: ent.brand, product: ent.product, snippet: ent.snippet, by: ent.by });
  if (ent.rating != null) qp.set('rating', String(ent.rating));
  if (ent.image) qp.set('img', ent.image);
  const ogImage = `${SITE}/api/og?${qp.toString()}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'article', url: SITE + path, siteName: 'Suede', title, description, images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default function CatchAllPage() {
  return <App />;
}
