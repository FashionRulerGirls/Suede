'use client';
import React from 'react';
/* Suede — The Capsule (brand directory) screen. */
import { BrandCard, SectionHeading, Button, Icon, StarRating } from '@/components/ds';
import { SUEDE_BRANDS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';

function CapsuleBrandCell({ b, onExplore, onRoute }: any) {
  const go = () => { appState.brand = b; onRoute('brand'); };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '28px 150px 200px', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', gap: 16 }}>
        <span onClick={go} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '0.02em', color: 'var(--text-heading)', whiteSpace: 'nowrap', cursor: 'pointer' }}>{b.name}</span>
        <Icon name="user" size={20} color="var(--text-secondary)" />
      </div>
      <div onClick={go} style={{ height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', cursor: 'pointer' }}>
        <img src={b.image} alt={b.name} style={{ height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', gap: 16 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0, maxWidth: 200 }}>{b.tagline}</p>
        <StarRating value={b.rating} size={16} />
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>{b.reviews} Reviews</div>
          <div>{b.followers} Followers</div>
        </div>
        <Button variant="primary" size="sm" onClick={onExplore}>Explore</Button>
      </div>
    </div>
  );
}

function ExploreModal({ brand, onClose, onRoute }: any) {
  if (!brand) return null;
  const row = (icon: any, title: any, sub: any) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <Icon name={icon} size={22} color="var(--text-primary)" />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
  const lockBtn = (label: any) => (
    <button onClick={() => onRoute('signin')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--surface-card)', border: '1px solid var(--border-default)', padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>
      <Icon name="lock" size={15} color="var(--text-muted)" />{label}
    </button>
  );
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,18,15,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', padding: '28px 32px 34px', position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 22, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
          <Icon name="close" size={22} />
        </button>
        <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 28, color: 'var(--text-heading)', margin: '4px 0 18px', display: 'none' }}>Engage</h2>
        <div style={{ height: 4 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {row('star', 'Leave a Review', 'Give a review to the Brand')}
          {lockBtn('Sign in to Review')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
          {row('mail', 'Leave an Inquiry', 'Inquire about something')}
          {lockBtn('Sign in to Inquire')}
        </div>
      </div>
    </div>
  );
}

export function CapsuleScreen({ onRoute, authed = false }: any) {
  const allBrands = SUEDE_BRANDS;
  const [explore, setExplore] = React.useState<any>(null);
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('az');
  const [drop, setDrop] = React.useState(appState.capsuleDrop || 'All');
  React.useEffect(() => { appState.capsuleDrop = null; }, []);
  const { SearchBar, Dropdown, CollapsibleToolbar } = SuedeControls;
  const brandDrop = (b: any) => b.drop || 'Drop 00';
  const numVal = (v: any) => { if (v == null) return 0; const s = String(v).toLowerCase().replace(/,/g, '').trim(); const n = parseFloat(s); if (isNaN(n)) return 0; return s.endsWith('k') ? n * 1000 : n; };
  let brands = allBrands.filter((b: any) => b.name.toLowerCase().includes(query.trim().toLowerCase()) && (drop === 'All' || brandDrop(b) === drop));
  if (sort === 'az') brands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'reviews') brands = [...brands].sort((a, b) => numVal(b.reviews) - numVal(a.reviews));
  else if (sort === 'followers') brands = [...brands].sort((a, b) => numVal(b.followers) - numVal(a.followers));
  else if (sort === 'rating') brands = [...brands].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 0' }}>      <SectionHeading
        eyebrow="Brand Directory"
        title="The Capsule"
        subtitle="A curated collection of minority-owned and emerging brands, each vetted for sizing, quality, and design excellence."
        size="lg"
      />

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center', zIndex: 30, pointerEvents: 'none' }}>
        <button onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })} aria-label="Scroll down" style={{ pointerEvents: 'auto', width: 48, height: 48, borderRadius: 'var(--radius-pill)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', animation: 'suedeScrollBounce 1.8s var(--ease-inout) infinite' }}>
          <style>{`@keyframes suedeScrollBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } } @media (prefers-reduced-motion: reduce) { button[aria-label="Scroll down"] { animation: none !important; } }`}</style>
          <Icon name="chevron-down" size={24} color="currentColor" />
        </button>
      </div>

      <CollapsibleToolbar align="flex-end">
        <SearchBar value={query} onChange={setQuery} placeholder="Search Capsule brands" />
        <Dropdown label="Sort" value={sort} onChange={setSort} options={[{ value: 'az', label: 'A → Z' }, { value: 'reviews', label: 'Most Reviews' }, { value: 'followers', label: 'Most Followers' }, { value: 'rating', label: 'Highest Rating' }]} />
      </CollapsibleToolbar>

      <div style={{ position: 'relative', marginTop: 32 }}>
        {brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-heading)', margin: 0 }}>No brands found</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={() => { appState.lookbookTab = 'reviews'; onRoute('lookbook'); }}>Browse other brands in our Lookbook</Button>
              <Button variant="primary" size="sm" onClick={() => onRoute('suggest')}>Suggest a Brand for The Capsule</Button>
            </div>
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '56px 40px' }}>
          {(authed ? brands : brands.slice(0, 6)).map((b: any, i: number) => (
            <div key={b.name}>
              <BrandCard layout="feature" name={b.name} image={b.image} tagline={b.tagline}
                rating={b.rating} reviews={b.reviews} followers={b.followers}
                onView={() => { appState.brand = b; onRoute('brand'); }}
                onFollow={() => { if (!authed) onRoute('signin'); }}
                onEdit={() => setExplore(b)} />
            </div>
          ))}
        </div>
        )}

        {/* locked fade — guests only */}
        {!authed && brands.length > 6 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: 'linear-gradient(180deg, rgba(248,246,243,0) 0%, var(--paper) 64%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 22, paddingBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sign in to see more</span>
          <Button variant="primary" shape="pill" onClick={() => onRoute('signin')}>Sign In</Button>
        </div>
        )}
      </div>

      <ExploreModal brand={explore} onClose={() => setExplore(null)} onRoute={onRoute} />

      <div style={{ maxWidth: 1240, margin: '64px auto 0', padding: '40px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>Know a brand that deserves to be featured in the Capsule?</p>
        <div style={{ marginTop: 18 }}>
          <Button variant="primary" shape="pill" onClick={() => onRoute('suggest')}>Complete our Suggestion Form</Button>
        </div>
      </div>
    </div>
  );
}
