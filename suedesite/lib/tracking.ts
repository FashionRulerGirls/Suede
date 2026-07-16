import type { SupabaseClient } from '@supabase/supabase-js';

/* Suede — outbound-click attribution (MVP).
   First-party and honest: these run only when a shopper explicitly clicks a
   "Shop at <brand>" link on Suede. We add transparent utm tags so the brand
   can see Suede-sourced traffic/orders in their own analytics, and we log the
   click so Suede can report the interest it drove. No last-click override, no
   background tabs, no injecting into anyone else's checkout. */

// Append transparent source tags to the brand's own URL. Returns null if the
// URL isn't a valid http(s) link (so we never open something unsafe).
export function taggedShopUrl(
  rawUrl: string,
  opts: { campaign?: string; content?: string } = {},
): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.searchParams.set('utm_source', 'suede');
    u.searchParams.set('utm_medium', 'referral');
    if (opts.campaign) u.searchParams.set('utm_campaign', opts.campaign);
    if (opts.content) u.searchParams.set('utm_content', opts.content);
    return u.toString();
  } catch {
    return null;
  }
}

// Fire-and-forget: logging must never block or break the click-through.
export async function logOutboundClick(
  sb: SupabaseClient | null,
  row: {
    brandId?: string | null;
    brandName?: string;
    productName?: string;
    targetUrl: string;
    memberId?: string | null;
    sourcePage?: string;
  },
): Promise<void> {
  if (!sb) return;
  try {
    await sb.from('outbound_clicks').insert({
      brand_id: row.brandId || null,
      brand_name: row.brandName || null,
      product_name: row.productName || null,
      target_url: row.targetUrl,
      member_id: row.memberId || null,
      source_page: row.sourcePage || null,
    });
  } catch {
    /* swallow — a failed log should never stop the shopper reaching the brand */
  }
}

// Convenience: tag + log + open in a new tab. Returns true if it navigated.
export function shopOut(
  sb: SupabaseClient | null,
  args: {
    rawUrl?: string | null;
    brandId?: string | null;
    brandName?: string;
    productName?: string;
    memberId?: string | null;
    sourcePage?: string;
    campaign?: string;
    content?: string;
  },
): boolean {
  if (!args.rawUrl) return false;
  const tagged = taggedShopUrl(args.rawUrl, { campaign: args.campaign, content: args.content });
  if (!tagged) return false;
  void logOutboundClick(sb, {
    brandId: args.brandId,
    brandName: args.brandName,
    productName: args.productName,
    targetUrl: tagged,
    memberId: args.memberId,
    sourcePage: args.sourcePage,
  });
  if (typeof window !== 'undefined') window.open(tagged, '_blank', 'noopener,noreferrer');
  return true;
}
