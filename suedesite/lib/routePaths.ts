import { appState } from '@/lib/appState';

/* Maps the SPA's in-memory routes to real URL paths (and back), so the shopper
   site has bookmarkable, shareable, refresh-safe URLs. Entity pages (brand /
   review / inquiry / member) carry a slug or id and are loadable on a direct
   visit. /admin and /portal are separate Next pages and not handled here. */

export function slugify(s?: string): string {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// route → static path (sections). Entity routes are handled separately.
const SECTION_PATHS: Record<string, string> = {
  landing: '/', lookbook: '/lookbook', capsule: '/capsule', collective: '/collective',
  about: '/about', notifications: '/notifications', yourprofile: '/profile', editprofile: '/profile/edit',
  quiz: '/quiz', consult: '/consultation', suggest: '/suggest', apply: '/apply', brandsignin: '/brand-signin',
  claimbrand: '/claim', privacy: '/privacy', terms: '/terms', signin: '/signin', createaccount: '/join',
  forgot: '/forgot', verify: '/verify', reset: '/reset', createreview: '/write-review', createinquiry: '/ask',
};

export function pathForRoute(route: string, s: any = appState): string {
  if (route === 'brand') { const slug = s.brand?.slug || slugify(s.brand?.name); return slug ? `/brand/${slug}` : '/capsule'; }
  if (route === 'review') { const id = s.review?._id; return id ? `/review/${id}` : '/lookbook'; }
  if (route === 'inquiry') { const id = s.inquiry?._id; return id ? `/inquiry/${id}` : '/lookbook'; }
  if (route === 'member') { const h = (s.member?.handle || '').replace(/^@/, ''); return h ? `/member/${h}` : (s.member?.id ? `/member/${s.member.id}` : '/collective'); }
  return SECTION_PATHS[route] || '/';
}

// pathname → { route, param } (reverse), or null if unrecognised.
export function routeFromPath(pathname: string): { route: string; param?: string } | null {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  const m = p.match(/^\/(brand|review|inquiry|member)\/(.+)$/);
  if (m) return { route: m[1], param: decodeURIComponent(m[2]) };
  const entry = Object.entries(SECTION_PATHS).find(([, path]) => path === p);
  return entry ? { route: entry[0] } : null;
}
