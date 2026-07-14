import { NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import net from 'node:net';

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

// ── SSRF guard ──────────────────────────────────────────────────────────
// This endpoint fetches a user-supplied URL server-side, so it must refuse to
// reach internal/loopback/link-local hosts (e.g. cloud metadata at
// 169.254.169.254, localhost, RFC1918 ranges) — directly or via a redirect.

class BlockedUrlError extends Error {}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, o) => (acc * 256) + Number(o), 0) >>> 0;
}

// base/bits CIDR ranges that must never be fetched.
const BLOCKED_V4: [string, number][] = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4], ['255.255.255.255', 32],
];

function isPrivateV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return BLOCKED_V4.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (n & mask) === (ipv4ToInt(base) & mask);
  });
}

function isPrivateV6(ip: string): boolean {
  const a = ip.toLowerCase().split('%')[0]; // drop any zone id
  if (a === '::1' || a === '::') return true;
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped
  if (mapped) return isPrivateV4(mapped[1]);
  const head = parseInt(a.split(':')[0] || '0', 16);
  if ((head & 0xfe00) === 0xfc00) return true; // fc00::/7  unique-local
  if ((head & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((head & 0xff00) === 0xff00) return true; // ff00::/8  multicast
  return false;
}

function isBlockedIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) return isPrivateV4(ip);
  if (v === 6) return isPrivateV6(ip);
  return true; // unrecognisable → refuse
}

// Resolve the host and reject if ANY resolved address is non-public. (Bare IP
// literals are checked directly.) Note: a determined attacker could still
// DNS-rebind between this check and the fetch; this blocks the common cases.
async function assertPublicHost(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, ''); // strip IPv6 brackets
  if (!host) throw new BlockedUrlError('empty host');
  const addrs = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new BlockedUrlError('unresolved host');
  for (const { address } of addrs) {
    if (isBlockedIp(address)) throw new BlockedUrlError(`blocked address ${address}`);
  }
}

// Follow redirects manually so each hop's host is re-validated before we fetch
// it — `redirect: 'follow'` would let a public URL bounce to an internal one.
async function safeFetch(start: URL, signal: AbortSignal): Promise<Response> {
  let current = start;
  for (let hop = 0; hop < 5; hop++) {
    if (current.protocol !== 'http:' && current.protocol !== 'https:') {
      throw new BlockedUrlError('bad protocol');
    }
    await assertPublicHost(current.hostname);
    const res = await fetch(current.toString(), {
      signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const loc = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
    if (!loc) return res;
    current = new URL(loc, current);
  }
  throw new BlockedUrlError('too many redirects');
}

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
    const res = await safeFetch(target, controller.signal);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `The site returned an error (${res.status}). Try entering details manually.` }, { status: 502 });
    }
    html = await res.text();
  } catch (e: any) {
    if (e instanceof BlockedUrlError) {
      return NextResponse.json({ ok: false, error: "That link isn't allowed. Please enter the details manually." }, { status: 400 });
    }
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
