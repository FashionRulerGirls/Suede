import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Reads basic product metadata (name, image, brand, price) from a pasted
   product URL. Runs server-side so we can fetch cross-origin pages that the
   browser would otherwise block via CORS. Falls back gracefully when a page
   exposes no usable metadata. */

type Product = {
  title: string | null;
  image: string | null;
  brand: string | null;
  price: string | null;
  url: string;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}

// Pull a <meta> content value by property/name, order-independent.
function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*\\bcontent=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+\\bcontent=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1]);
  }
  return null;
}

// Best-effort schema.org Product lookup from JSON-LD blocks.
function fromJsonLd(html: string): Partial<Product> {
  const out: Partial<Product> = {};
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const json = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    let data: any;
    try { data = JSON.parse(json); } catch { continue; }
    const nodes = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
    for (const node of nodes) {
      const type = node && node['@type'];
      const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
      if (!isProduct) continue;
      if (!out.title && typeof node.name === 'string') out.title = decodeEntities(node.name);
      if (!out.image) {
        const img = Array.isArray(node.image) ? node.image[0] : node.image;
        if (typeof img === 'string') out.image = img;
        else if (img && typeof img.url === 'string') out.image = img.url;
      }
      if (!out.brand) {
        const brand = node.brand;
        if (typeof brand === 'string') out.brand = decodeEntities(brand);
        else if (brand && typeof brand.name === 'string') out.brand = decodeEntities(brand.name);
      }
      if (!out.price) {
        const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        const price = offers && (offers.price ?? offers.lowPrice);
        const cur = offers && (offers.priceCurrency || '');
        if (price != null) out.price = `${cur ? cur + ' ' : ''}${price}`.trim();
      }
    }
  }
  return out;
}

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const raw = (body?.url || '').toString().trim();

  if (!raw) {
    return NextResponse.json({ ok: false, error: 'Please paste a product link first.' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
    if (target.protocol !== 'http:' && target.protocol !== 'https:') throw new Error('bad protocol');
  } catch {
    return NextResponse.json({ ok: false, error: "That doesn't look like a valid link. Include https://" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  let html = '';
  try {
    const res = await fetch(target.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `The site returned an error (${res.status}). Try entering details manually.` }, { status: 502 });
    }
    html = await res.text();
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'The page took too long to respond.' : "Couldn't reach that link.";
    return NextResponse.json({ ok: false, error: `${msg} Try entering details manually.` }, { status: 502 });
    } finally {
    clearTimeout(timeout);
  }

  const ld = fromJsonLd(html);
  const titleTag = (() => {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? decodeEntities(m[1]) : null;
  })();

  const product: Product = {
    title: ld.title || metaContent(html, 'og:title') || metaContent(html, 'twitter:title') || titleTag,
    image: ld.image || metaContent(html, 'og:image') || metaContent(html, 'twitter:image'),
    brand: ld.brand || metaContent(html, 'og:site_name') || metaContent(html, 'product:brand'),
    price:
      ld.price ||
      metaContent(html, 'product:price:amount') ||
      metaContent(html, 'og:price:amount') ||
      null,
  url: target.toString(),
  };

  // Resolve a relative image URL against the page origin.
  if (product.image && !/^https?:\/\//i.test(product.image)) {
    try { product.image = new URL(product.image, target).toString(); } catch { product.image = null; }
  }

  if (!product.title && !product.image) {
    return NextResponse.json(
      { ok: false, error: "Couldn't read product details from this page. Please enter them manually." },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true, product });
}
