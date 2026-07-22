/* Server-only data for social share previews (Open Graph). Uses a plain anon
   Supabase client — social scrapers are unauthenticated, and published
   reviews/inquiries are public via RLS. Kept separate from contentData so the
   metadata path pulls in no client code. */
import { createClient } from '@supabase/supabase-js';

function anon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function ratingAvg(r: any): number | null {
  const v = ['rating_sizing', 'rating_material', 'rating_value', 'rating_photos', 'rating_service']
    .map((k) => r[k]).filter((x) => x != null);
  return v.length ? Math.round((v.reduce((a: number, b: number) => a + b, 0) / v.length) * 2) / 2 : null;
}

export type OgEntity = {
  kind: 'review' | 'inquiry';
  brand: string;
  product: string;
  snippet: string;
  rating: number | null;
  image: string | null;
  by: string;
};

export async function getOgReview(id: string): Promise<OgEntity | null> {
  const sb = anon(); if (!sb) return null;
  const { data } = await sb.from('reviews')
    .select('id, brand_name, product_name, body, rating_sizing, rating_material, rating_value, rating_photos, rating_service, status, author:profiles!author_id(username, display_name)')
    .eq('id', id).eq('status', 'published').maybeSingle();
  if (!data) return null;
  const { data: media } = await sb.from('media')
    .select('url, kind, position').eq('parent_type', 'review').eq('parent_id', id).order('position').limit(4);
  const rows = (media || []) as any[];
  const image = rows.find((m) => m.kind === 'image')?.url || rows[0]?.url || null;
  const a: any = (data as any).author;
  return {
    kind: 'review',
    brand: (data as any).brand_name || '',
    product: (data as any).product_name || '',
    snippet: ((data as any).body || '').slice(0, 180),
    rating: ratingAvg(data),
    image,
    by: a?.display_name || a?.username || 'A Suede member',
  };
}

export async function getOgInquiry(id: string): Promise<OgEntity | null> {
  const sb = anon(); if (!sb) return null;
  const { data } = await sb.from('inquiries')
    .select('id, brand_name, product_name, body, product_image_url, status, author:profiles!author_id(username, display_name)')
    .eq('id', id).neq('status', 'removed').maybeSingle();
  if (!data) return null;
  const a: any = (data as any).author;
  return {
    kind: 'inquiry',
    brand: (data as any).brand_name || '',
    product: (data as any).product_name || '',
    snippet: ((data as any).body || '').slice(0, 180),
    rating: null,
    image: (data as any).product_image_url || null,
    by: a?.display_name || a?.username || 'A Suede member',
  };
}
