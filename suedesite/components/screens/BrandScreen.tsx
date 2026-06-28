'use client';
import React from 'react';
/* Suede — Brand detail page (one per Capsule brand). */
import { StarRating, MeasurementSpec, Button, Tabs, Icon, ReviewCard, Avatar, Badge } from '@/components/ds';
import { SUEDE_BRANDS, SUEDE_REVIEWS, SUEDE_INQUIRIES } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { InquiryCard } from '@/components/screens/LookbookScreen';

function BrandStat({ value, label, icon, breakdown }: any) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => breakdown && setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={breakdown ? 'hero-dest' : undefined}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, cursor: breakdown ? 'default' : 'inherit' }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 40, lineHeight: 1, color: 'var(--text-heading)' }}>{value}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        {icon && <Icon name={icon} size={15} color="var(--text-secondary)" />}{label}
      </span>
      {breakdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 14px)', left: 0, transform: `translateY(${hover ? '0' : '-6px'})`,
          width: 320, zIndex: 20, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
          opacity: hover ? 1 : 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
        }}>
          <span style={{ width: 14, height: 14, position: 'absolute', top: -7, left: 24, background: 'var(--surface-card)', borderLeft: '1px solid var(--border-subtle)', borderTop: '1px solid var(--border-subtle)', transform: 'rotate(45deg)' }} />
          {breakdown.map(([lbl, val]: any) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{lbl}</span>
              <StarRating value={val} size={14} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingRotator({ items }: any) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 2600);
    return () => clearInterval(t);
  }, [items.length]);
  const [lbl, val] = items[idx];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'ratingRise 520ms var(--ease-out)' }}>
        <style>{`@keyframes ratingRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes starPop{from{opacity:0;transform:translateY(8px) scale(0.4) rotate(-40deg)}60%{opacity:1;transform:translateY(0) scale(1.18) rotate(6deg)}to{opacity:1;transform:translateY(0) scale(1) rotate(0)}}`}</style>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>{lbl}</span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {[0, 1, 2, 3, 4].map(s => {
            const fill = Math.max(0, Math.min(1, val - s));
            const gid = 'bg' + idx + '_' + s;
            return (
              <svg key={s} width="22" height="22" viewBox="0 0 24 24" style={{ display: 'block', opacity: 0, animation: `starPop 360ms var(--ease-out) ${s * 110}ms forwards` }}>
                <defs><linearGradient id={gid}><stop offset={`${fill * 100}%`} stopColor="var(--ink-900)" /><stop offset={`${fill * 100}%`} stopColor="var(--white)" /></linearGradient></defs>
                <path d="M12 3.2l2.66 5.7 6.14.72-4.6 4.2 1.24 6.06L12 16.9l-5.48 2.98 1.24-6.06-4.6-4.2 6.14-.72z" fill={`url(#${gid})`} stroke="var(--ink-900)" strokeWidth="1.2" />
              </svg>
            );
          })}
        </span>
      </div>
    </div>
  );
}

export function BrandScreen({ onRoute, authed = false }: any) {
  const brand = appState.brand || SUEDE_BRANDS[1];
  const [tab, setTab] = React.useState('reviews');
  const [bQuery, setBQuery] = React.useState('');
  const [bSort, setBSort] = React.useState('date');
  const reviews = SUEDE_REVIEWS;
  const inquiries = SUEDE_INQUIRIES || [];
  const feed = [...reviews, ...reviews].slice(0, 2).map(r => ({ ...r, brand: brand.name }));
  const inqFeed = [...inquiries, ...inquiries].slice(0, 2).map(r => ({ ...r, brand: brand.name }));
  const [flipped, setFlipped] = React.useState(false);
  const [docNote, setDocNote] = React.useState<string | null>(null);
  const handle = brand.social || ('@' + brand.name.toLowerCase().replace(/\s+/g, ''));
  const website = 'www.' + brand.name.toLowerCase().replace(/[^a-z]/g, '') + '.com';

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
      <style>{`.rating-stat:hover .rating-pop{opacity:1 !important;visibility:visible !important;transform:translateY(0) !important}`}</style>
      <button onClick={() => onRoute('capsule')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
        <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to The Capsule
      </button>

      {/* Flip card */}
      <div style={{ perspective: 2000 }}>
      <div style={{ position: 'relative', transition: 'transform 700ms var(--ease-inout)', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
      {/* FRONT — Dark suede hero box */}
      <div style={{ position: 'relative', minHeight: 420, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundImage: `linear-gradient(rgba(250,249,246,0.4), rgba(250,249,246,0.4)), url(${brand.hero || '/assets/imagery/suede-card-bg.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Centered brand name */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, pointerEvents: 'none', padding: '0 40px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 88, lineHeight: 1, letterSpacing: '0.04em', color: 'var(--ink-900)', margin: 0, textTransform: 'uppercase', textAlign: 'center' }}>{brand.name}</h1>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-600)', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{brand.tagline}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom info bar */}
        <div style={{ position: 'relative', zIndex: 3, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 24, padding: '0 40px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-600)' }}>Founded – {brand.founded || '—'} · {brand.location || '—'}</span>
          </div>
          <button onClick={() => setFlipped(true)} style={{ justifySelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.02em', color: 'var(--ink-900)', textAlign: 'center', whiteSpace: 'nowrap' }}>
            Swipe to learn more <Icon name="arrow-right" size={17} color="var(--ink-900)" />
          </button>
          <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-900)' }}><Icon name="instagram" size={18} color="var(--ink-900)" />{handle}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-900)' }}><Icon name="tiktok" size={18} color="var(--ink-900)" />{handle}</span>
          </div>
        </div>
      </div>

      {/* BACK — bio + documents */}
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundImage: `linear-gradient(rgba(250,249,246,0.4), rgba(250,249,246,0.4)), url(${brand.hero || '/assets/imagery/suede-card-bg.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: '36px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{brand.name}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start', marginTop: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>The Brand</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0, maxWidth: 450 }}>{brand.founder || ''} Every piece is produced in considered, limited runs — a deliberate stand against overproduction. We design for longevity: garments meant to be worn, kept, and remembered season after season.</p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Documents</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {['Size Guide', 'Return Policy', 'Shipping', 'Sustainability'].map((doc, i, a) => (
                <button key={doc} onClick={() => setDocNote(doc)} className="measure-opt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 4px', background: 'none', border: 'none', borderBottom: i < a.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--text-primary)' }}>{doc}</span>
                  {docNote === doc
                    ? <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Coming soon</span>
                    : <Icon name="arrow-right" size={16} color="var(--text-secondary)" className="measure-arrow" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: 24 }}>
          <button onClick={() => setFlipped(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.02em', color: 'var(--ink-900)', whiteSpace: 'nowrap' }}><Icon name="arrow-left" size={17} color="var(--ink-900)" /> Back</button>
        </div>
      </div>
      </div>
      </div>

      {/* Stats strip */}
      <div style={{ padding: '44px 0 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {[[(brand.rating && brand.rating.toFixed ? brand.rating.toFixed(1) : brand.rating) || '0.0', 'Rating', 'star'], [brand.reviews || '0', 'Reviews', 'reviews'], [brand.inquiries || '0', 'Inquiries', 'message'], [brand.followers || '0', 'Followers', 'user']].map(([val, lbl, ic]: any) => {
            const isRating = lbl === 'Rating';
            const base = brand.rating || 4.5;
            const breakdown = isRating ? [
              ['Sizing accuracy', Math.max(1, Math.min(5, Math.round((base - 0.3) * 2) / 2))],
              ['Material quality', Math.max(1, Math.min(5, Math.round((base + 0.2) * 2) / 2))],
              ['Value for price', Math.max(1, Math.min(5, Math.round((base - 0.1) * 2) / 2))],
              ['True to photos', Math.max(1, Math.min(5, Math.round((base + 0.1) * 2) / 2))],
              ['Customer service', Math.max(1, Math.min(5, Math.round(base * 2) / 2))],
            ] : null;
            return (
              <div key={lbl} className={isRating ? 'rating-stat' : undefined} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', cursor: isRating ? 'default' : 'inherit' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 46, lineHeight: 1, letterSpacing: '0.01em', color: 'var(--text-heading)' }}>{val}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  <Icon name={ic} size={15} color="var(--text-secondary)" />{lbl}
                </span>
                {breakdown && (
                  <div className="rating-pop" style={{ position: 'absolute', top: 'calc(100% + 14px)', left: '50%', marginLeft: -130, width: 260, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11, opacity: 0, visibility: 'hidden', transform: 'translateY(-6px)', transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), visibility var(--dur-base)', zIndex: 20 }}>
                    <span style={{ width: 14, height: 14, position: 'absolute', top: -7, left: '50%', marginLeft: -7, background: 'var(--surface-card)', borderLeft: '1px solid var(--border-subtle)', borderTop: '1px solid var(--border-subtle)', transform: 'rotate(45deg)' }} />
                    {breakdown.map(([blbl, bval]: any) => (
                      <div key={blbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{blbl}</span>
                        <StarRating value={bval} size={14} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => window.open('https://' + website, '_blank', 'noopener,noreferrer')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 4 }}>{website}</button>
        </div>
      </div>

      <div>
      {/* Tabs */}
      <div style={{ marginTop: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <Tabs items={[{ label: 'Reviews', value: 'reviews' }, { label: 'Inquiries', value: 'inquiries' }]} value={tab} onChange={setTab} align="stretch" />
      </div>

      {/* Search & sort */}
      {(() => {
        const Controls: any = SuedeControls || {};
        const SearchBar = Controls.SearchBar, Dropdown = Controls.Dropdown, CollapsibleToolbar = Controls.CollapsibleToolbar;
        if (!CollapsibleToolbar) return null;
        return (
          <CollapsibleToolbar align="space-between">
            <SearchBar value={bQuery} onChange={setBQuery} placeholder="Search reviews" />
            <Dropdown label="Sort" value={bSort} onChange={setBSort} options={[{ value: 'date', label: 'Latest' }, { value: 'high', label: 'Rating: High → Low' }, { value: 'low', label: 'Rating: Low → High' }]} />
          </CollapsibleToolbar>
        );
      })()}

      {/* Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, paddingBottom: 20 }}>
        {tab === 'reviews'
          ? feed.filter(r => (r.product || '').toLowerCase().includes(bQuery.trim().toLowerCase())).slice().sort((a, b) => bSort === 'high' ? (b.rating || 0) - (a.rating || 0) : bSort === 'low' ? (a.rating || 0) - (b.rating || 0) : 0).map((r, i) => <ReviewCard key={i} {...r} onSeeFull={() => { appState.review = r; onRoute('review'); }} onReviewer={() => { appState.member = { name: r.reviewer.name, handle: r.reviewer.handle, avatar: r.reviewer.avatar, social: r.reviewer.handle, bio: "I love to explore the brands and Fashion. It's my hobbyy.", measurements: r.measurements, followers: '30', reviews: '24', inquiries: '12', brands: '8' }; onRoute('member'); }} />)
          : inqFeed.filter(r => (r.product || '').toLowerCase().includes(bQuery.trim().toLowerCase())).map((r, i) => <InquiryCard key={i} {...r} onOpen={() => { appState.inquiry = r; onRoute('inquiry'); }} onAsker={() => { appState.member = { name: r.asker.name, handle: r.asker.handle, avatar: r.asker.avatar, social: r.asker.handle, bio: "I love to explore the brands and Fashion. It's my hobbyy.", measurements: r.measurements, followers: '30', reviews: '24', inquiries: '12', brands: '8' }; onRoute('member'); }} />)}
      </div>
      </div>
    </div>
  );
}
