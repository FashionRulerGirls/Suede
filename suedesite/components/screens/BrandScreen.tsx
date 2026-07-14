'use client';
import React from 'react';
/* Suede — Brand detail page (one per Capsule brand). */
import { StarRating, MeasurementSpec, Button, Tabs, Icon, ReviewCard, Avatar, Badge } from '@/components/ds';
import { SUEDE_BRANDS, SUEDE_REVIEWS, SUEDE_INQUIRIES } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { InquiryCard } from '@/components/screens/LookbookScreen';
import { ExploreModal } from '@/components/screens/ExploreModal';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadBrandReviews, loadBrandInquiries, resolveBrandId, isFollowingBrand, setBrandFollow, brandFollowerCount } from '@/lib/contentData';

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
  const { user } = useAuth();
  // Guests / demo see the sample feed; real signed-in members see this brand's
  // live reviews & inquiries from the database.
  const real = !!user;
  const [dbReviews, setDbReviews] = React.useState<any[]>([]);
  const [dbInq, setDbInq] = React.useState<any[]>([]);
  const [brandId, setBrandId] = React.useState<string | null>(null);
  const [following, setFollowing] = React.useState(false);
  const [followers, setFollowers] = React.useState(0);
  const [followBusy, setFollowBusy] = React.useState(false);
  const [explore, setExplore] = React.useState(false);
  React.useEffect(() => {
    const sb = createClient();
    if (!sb || !user || !brand?.name) { setDbReviews([]); setDbInq([]); setBrandId(null); setFollowing(false); setFollowers(0); return; }
    let active = true;
    loadBrandReviews(sb, brand.name, user.id).then((r) => { if (active) setDbReviews(r); }).catch(() => {});
    loadBrandInquiries(sb, brand.name, user.id).then((q) => { if (active) setDbInq(q); }).catch(() => {});
    resolveBrandId(sb, brand.name).then(async (id) => {
      if (!active || !id) return;
      setBrandId(id);
      const [isF, fc] = await Promise.all([isFollowingBrand(sb, user.id, id), brandFollowerCount(sb, id)]);
      if (active) { setFollowing(isF); setFollowers(fc); }
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.id, brand?.name]);

  const toggleFollow = async () => {
    if (!user) { onRoute('signin'); return; }
    const sb = createClient();
    if (!sb || !brandId) return;
    const on = !following;
    setFollowing(on); setFollowers((n) => n + (on ? 1 : -1)); setFollowBusy(true);
    try { await setBrandFollow(sb, user.id, brandId, on); }
    catch { setFollowing(!on); setFollowers((n) => n + (on ? -1 : 1)); }
    finally { setFollowBusy(false); }
  };
  const [tab, setTab] = React.useState('reviews');
  const [bQuery, setBQuery] = React.useState('');
  const [bSort, setBSort] = React.useState('date');
  const reviews = SUEDE_REVIEWS;
  const inquiries = SUEDE_INQUIRIES || [];
  const reviewFeed = real ? dbReviews : [...reviews, ...reviews].slice(0, 2).map(r => ({ ...r, brand: brand.name }));
  const inqFeed = real ? dbInq : [...inquiries, ...inquiries].slice(0, 2).map(r => ({ ...r, brand: brand.name }));
  // Real-account stat values derive from the loaded feed; guests keep the
  // brand's sample aggregates.
  const ratedVals = dbReviews.map((r) => r.rating).filter((v) => v != null);
  const rAvg = ratedVals.length ? ratedVals.reduce((a: number, b: number) => a + b, 0) / ratedVals.length : 0;
  const statRating = real ? rAvg.toFixed(1) : ((brand.rating && brand.rating.toFixed ? brand.rating.toFixed(1) : brand.rating) || '0.0');
  const statReviews = real ? String(dbReviews.length) : (brand.reviews || '0');
  const statInquiries = real ? String(dbInq.length) : (brand.inquiries || '0');
  const statFollowers = real ? String(followers) : (brand.followers || '0');
  const [flipped, setFlipped] = React.useState(false);
  const [docNote, setDocNote] = React.useState<string | null>(null);
  const [rateOpen, setRateOpen] = React.useState(false);
  const website = 'www.' + brand.name.toLowerCase().replace(/[^a-z]/g, '') + '.com';

  return (
    <div className="sd-brand-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
      <style>{`.rating-stat:hover .rating-pop{opacity:1 !important;visibility:visible !important;transform:translateY(0) !important}`}</style>
      <button onClick={() => onRoute('capsule')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
        <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to The Capsule
      </button>

      {/* Flip card */}
      <div style={{ perspective: 2000 }}>
      <div style={{ position: 'relative', transition: 'transform 700ms var(--ease-inout)', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
      {/* FRONT — Dark suede hero box */}
      <div className="sd-brandcard-front" style={{ position: 'relative', minHeight: 420, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', visibility: flipped ? 'hidden' : 'visible', transition: 'visibility 0s linear 350ms', backgroundImage: `linear-gradient(rgba(250,249,246,0.4), rgba(250,249,246,0.4)), url(/assets/imagery/suede-card-bg.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Centered brand name */}
        <div className="sd-brandname-block" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, pointerEvents: 'none', padding: '0 40px' }}>
          <h1 className="sd-brandname" style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 88, lineHeight: 1, letterSpacing: '0.04em', color: 'var(--ink-900)', margin: 0, textTransform: 'uppercase', textAlign: 'center' }}>
            {brand.name}
            <span style={{ verticalAlign: 'super', marginLeft: 12, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
              {real && brandId && (
                <button className="sd-brand-follow" onClick={toggleFollow} disabled={followBusy} aria-label={following ? 'Following' : 'Follow'} title={following ? 'Following' : 'Follow'}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink-900)', display: 'inline-flex' }}>
                  <Icon name={following ? 'check' : 'user-plus'} size={26} color="var(--ink-900)" />
                </button>
              )}
              <button className="sd-brand-engage" onClick={() => setExplore(true)} aria-label="Leave a review or inquiry" title="Leave a review or inquiry"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink-900)', display: 'inline-flex' }}>
                <Icon name="pen" size={22} color="var(--ink-900)" />
              </button>
            </span>
          </h1>
          <span className="sd-brandtag" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-600)', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{brand.tagline}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom info bar — only the confirmed "learn more" affordance; founded
            year, location, and socials are hidden until we have real data. */}
        <div className="sd-brandbar" style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'center', padding: '0 40px 28px' }}>
          <button onClick={() => setFlipped(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.02em', color: 'var(--ink-900)', textAlign: 'center', whiteSpace: 'nowrap' }}>
            Swipe to learn more <Icon name="arrow-right" size={17} color="var(--ink-900)" />
          </button>
        </div>
      </div>

      {/* BACK — bio + documents */}
      <div className="sd-brandcard-back" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', visibility: flipped ? 'visible' : 'hidden', transition: 'visibility 0s linear 350ms', transform: 'rotateY(180deg)', backgroundImage: `linear-gradient(rgba(250,249,246,0.4), rgba(250,249,246,0.4)), url(/assets/imagery/suede-card-bg.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: '36px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{brand.name}</span>
        </div>
        <div className="sd-brandback-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start', marginTop: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>The Brand</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0, maxWidth: 450 }}>{brand.tagline}</p>
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
        <div className="sd-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {[[statRating, 'Rating', 'star'], [statReviews, 'Reviews', 'reviews'], [statInquiries, 'Inquiries', 'message'], [statFollowers, 'Followers', 'user']].map(([val, lbl, ic]: any) => {
            const isRating = lbl === 'Rating';
            const base = real ? rAvg : (brand.rating || 4.5);
            const breakdown = (isRating && base > 0) ? [
              ['Sizing accuracy', Math.max(1, Math.min(5, Math.round((base - 0.3) * 2) / 2))],
              ['Material quality', Math.max(1, Math.min(5, Math.round((base + 0.2) * 2) / 2))],
              ['Value for price', Math.max(1, Math.min(5, Math.round((base - 0.1) * 2) / 2))],
              ['True to photos', Math.max(1, Math.min(5, Math.round((base + 0.1) * 2) / 2))],
              ['Customer service', Math.max(1, Math.min(5, Math.round(base * 2) / 2))],
            ] : null;
            return (
              <div key={lbl} className={isRating ? ('rating-stat' + (rateOpen ? ' rating-open' : '')) : undefined} onClick={isRating ? () => setRateOpen(o => !o) : undefined} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', cursor: isRating ? 'default' : 'inherit' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 46, lineHeight: 1, letterSpacing: '0.01em', color: 'var(--text-heading)' }}>{val}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  <Icon name={ic} size={15} color="var(--text-secondary)" />{lbl}
                </span>
                {breakdown && (
                  <div className="rating-pop sd-brating-pop" style={{ position: 'absolute', top: 'calc(100% + 14px)', left: '50%', marginLeft: -130, width: 260, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11, opacity: 0, visibility: 'hidden', transform: 'translateY(-6px)', transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), visibility var(--dur-base)', zIndex: 20 }}>
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
      {(() => {
        const activeFeed = (tab === 'reviews' ? reviewFeed : inqFeed).filter(r => (r.product || '').toLowerCase().includes(bQuery.trim().toLowerCase()));
        if (activeFeed.length === 0) {
          return (
            <div style={{ textAlign: 'center', padding: '54px 0 28px' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-heading)', margin: '0 0 6px' }}>No {tab === 'reviews' ? 'reviews' : 'inquiries'} yet</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>Be the first to {tab === 'reviews' ? `review ${brand.name}` : `ask about ${brand.name}`}.</p>
              <Button variant="primary" size="sm" onClick={() => onRoute(tab === 'reviews' ? 'createreview' : 'createinquiry')}>{tab === 'reviews' ? 'Write a Review' : 'Leave an Inquiry'}</Button>
            </div>
          );
        }
        return (
          <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, paddingBottom: 20 }}>
            {tab === 'reviews'
              ? activeFeed.slice().sort((a, b) => bSort === 'high' ? (b.rating || 0) - (a.rating || 0) : bSort === 'low' ? (a.rating || 0) - (b.rating || 0) : 0).map((r, i) => <ReviewCard key={i} {...r} onSeeFull={() => { appState.review = r; onRoute('review'); }} onReviewer={() => { if (!r.reviewer) return; appState.member = { id: r.authorId, name: r.reviewer.name, handle: r.reviewer.handle, avatar: r.reviewer.avatar, social: r.reviewer.handle, bio: "I love to explore the brands and Fashion. It's my hobbyy.", measurements: r.measurements, followers: '30', reviews: '24', inquiries: '12', brands: '8' }; onRoute('member'); }} />)
              : activeFeed.map((r, i) => <InquiryCard key={i} {...r} onOpen={() => { appState.inquiry = r; onRoute('inquiry'); }} onAsker={() => { if (!r.asker) return; appState.member = { id: r.authorId, name: r.asker.name, handle: r.asker.handle, avatar: r.asker.avatar, social: r.asker.handle, bio: "I love to explore the brands and Fashion. It's my hobbyy.", measurements: r.measurements, followers: '30', reviews: '24', inquiries: '12', brands: '8' }; onRoute('member'); }} />)}
          </div>
        );
      })()}
      </div>

      <ExploreModal brand={explore ? brand : null} authed={authed} onClose={() => setExplore(false)} onRoute={onRoute} />
    </div>
  );
}
