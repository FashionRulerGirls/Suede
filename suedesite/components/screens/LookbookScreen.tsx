'use client';
/* Suede — The Lookbook (review feed) screen. */
import React from 'react';
import { ReviewCard, SectionHeading, Tabs, Button, Avatar, MeasurementSpec, Badge, Icon } from '@/components/ds';
import { SUEDE_BRANDS, SUEDE_REVIEWS, SUEDE_INQUIRIES } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';

export function InquiryCard({ asker = {}, measurements = {}, product, size, brand, image, question, responses = [], helpful, hideMeasurements = false, onOpen, onAsker, onBrand }: any) {
  const link = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 };
  const [voted, setVoted] = React.useState(false);
  const helpfulCount = helpful != null ? helpful : (responses || []).reduce((s: any, x: any) => s + (x.likes || 0), 0);
  return (
    <article style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', padding: 22, height: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span onClick={onAsker} style={{ cursor: onAsker ? 'pointer' : 'default' }}>
          <Avatar src={asker.avatar} name={asker.name} handle={asker.handle} size="sm" showName />
        </span>
        {!hideMeasurements && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <MeasurementSpec {...measurements} size="sm" tone="muted" />
          <span style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '1'; t.style.pointerEvents = 'auto'; } }}
            onMouseLeave={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '0'; t.style.pointerEvents = 'none'; } }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--text-muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rating-positive)', flex: 'none' }} />Suede Match
            </span>
            <span data-tip style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, whiteSpace: 'nowrap', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 20 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)' }}>High Confidence</span>
            </span>
          </span>
        </div>
        )}
      </div>

      {/* body: text + image */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 132px', gap: 18, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div onClick={onBrand} style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-heading)', cursor: onBrand ? 'pointer' : 'default' }}>{brand}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{product}</span>
            {size && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '4px 9px', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)' }}><Icon name="search" size={11} color="var(--text-muted)" />Size {size}</span>}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '14px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 44 }}>{question}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 'auto', paddingTop: 18 }}>
            <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{responses.length} {responses.length === 1 ? 'Response' : 'Responses'}</span>
              <button onClick={(e) => { e.stopPropagation(); setVoted(v => !v); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: voted ? 'var(--rating-positive)' : 'var(--text-muted)' }}>
                <Icon name="thumbs-up" size={15} color={voted ? 'var(--rating-positive)' : 'var(--text-muted)'} />{helpfulCount + (voted ? 1 : 0)} Helpful
              </button>
            </span>
            <span style={{ display: 'flex', gap: 22, justifyContent: 'flex-end' }}>
              <button style={link} onClick={onOpen}>Respond</button>
              <button style={link} onClick={onOpen}>View Product</button>
            </span>
          </div>
        </div>
        <div style={{ borderRadius: 0, overflow: 'hidden', aspectRatio: '3/4', background: 'var(--linen)' }}>
          <img src={image} alt={product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </article>
  );
}

export function LookbookScreen({ onRoute, authed = false }: any) {
  const [tab, setTab] = React.useState(appState.lookbookTab || 'reviews');
  React.useEffect(() => { appState.lookbookTab = null; }, []);
  const isReviews = tab === 'reviews';
  const { SearchBar, Dropdown, FilterChip, CollapsibleToolbar } = SuedeControls;
  const capsuleNames = (SUEDE_BRANDS || []).map(b => b.name);
  const catOf = (p: any) => ({ 'Two Piece Motor Set': 'Bottoms', 'Bomber Jacket': 'Outerwear', 'The Nyomi Maxi': 'Dresses', 'Corset Top': 'Tops' }[p] || 'Dresses');
  const brandTypeOf = (b: any) => capsuleNames.includes(b) ? 'Capsule' : 'Non-Capsule';

  const [query, setQuery] = React.useState('');
  // review controls
  const [rSort, setRSort] = React.useState('date');
  const [rBrandType, setRBrandType] = React.useState('All');
  const [rRating, setRRating] = React.useState('All');
  const [rCategory, setRCategory] = React.useState('All');
  const [rMatch, setRMatch] = React.useState(false);
  // inquiry controls
  const [iSort, setISort] = React.useState('date');
  const [iBrandType, setIBrandType] = React.useState('All');
  const [iHasResp, setIHasResp] = React.useState(false);
  const [iOfficial, setIOfficial] = React.useState(false);

  const q = query.trim().toLowerCase();
  let reviews = [...(SUEDE_REVIEWS || []), ...(SUEDE_REVIEWS || [])].slice(0, 6).map((r, i) => ({ ...r, _i: i }));
  reviews = reviews.filter(r => r.brand.toLowerCase().includes(q)
    && (rBrandType === 'All' || brandTypeOf(r.brand) === rBrandType)
    && (rRating === 'All' || (rRating === '5' ? r.rating >= 5 : rRating === '34' ? r.rating >= 3 && r.rating < 5 : r.rating < 3)));
  if (rSort === 'az') reviews.sort((a, b) => a.brand.localeCompare(b.brand));
  else if (rSort === 'high') reviews.sort((a, b) => b.rating - a.rating);
  else if (rSort === 'low') reviews.sort((a, b) => a.rating - b.rating);

  let inquiries = [...(SUEDE_INQUIRIES || []), ...(SUEDE_INQUIRIES || [])].slice(0, 6).map((r, i) => ({ ...r, _i: i, helpful: (r.responses || []).reduce((s: any, x: any) => s + (x.likes || 0), 0) }));
  inquiries = inquiries.filter(r => r.brand.toLowerCase().includes(q)
    && (iBrandType === 'All' || brandTypeOf(r.brand) === iBrandType)
    && (!iHasResp || (r.responses || []).length > 0)
    && (!iOfficial || (r.responses || []).length > 0));
  if (iSort === 'helpful') inquiries.sort((a, b) => b.helpful - a.helpful);

  const feed = isReviews ? reviews : inquiries;
  const empty = feed.length === 0;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 0' }}>
      <SectionHeading
        eyebrow={isReviews ? 'Review Feed' : 'Inquiry Feed'}
        title="The Lookbook"
        subtitle={isReviews ? 'Independent brand reviews from real customers with all the information needed to shop with confidence' : 'Real questions from aspiring customers looking for information to help them shop with confidence.'}
        size="lg"
      />

      <div style={{ marginTop: 40, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <Tabs items={[{ label: 'Reviews', value: 'reviews' }, { label: 'Inquiries', value: 'inquiries' }]} value={tab} onChange={setTab} align="stretch" />
      </div>

      {/* controls */}
      <CollapsibleToolbar align="space-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by brand" />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {isReviews ? (
            <React.Fragment>
              <FilterChip label="Suede Match" active={rMatch} onClick={() => setRMatch(m => !m)} />
              <Dropdown label="Brand Type" value={rBrandType} onChange={setRBrandType} options={['All', 'Capsule', 'Non-Capsule']} />
              <Dropdown label="Rating" value={rRating} onChange={setRRating} options={[{ value: 'All', label: 'All' }, { value: '5', label: '★★★★★ 5' }, { value: '34', label: '★★★★ 3–4' }, { value: '12', label: '★★ 1–2' }]} />
              <Dropdown label="Sort" value={rSort} onChange={setRSort} options={[{ value: 'date', label: 'Date Added' }, { value: 'az', label: 'Brand A → Z' }, { value: 'high', label: 'Rating: High → Low' }, { value: 'low', label: 'Rating: Low → High' }]} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <FilterChip label="Has Responses" active={iHasResp} onClick={() => setIHasResp(v => !v)} />
              <FilterChip label="Official Review" active={iOfficial} onClick={() => setIOfficial(v => !v)} />
              <Dropdown label="Brand Type" value={iBrandType} onChange={setIBrandType} options={['All', 'Capsule', 'Non-Capsule']} />
              <Dropdown label="Sort" value={iSort} onChange={setISort} options={[{ value: 'date', label: 'Date Added' }, { value: 'helpful', label: 'Most Helpful' }]} />
            </React.Fragment>
          )}
        </div>
      </CollapsibleToolbar>

      <div style={{ position: 'relative', marginTop: 28 }}>
        {empty ? (
          <div style={{ textAlign: 'center', padding: '54px 0' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-heading)', margin: 0 }}>No {isReviews ? 'reviews' : 'inquiries'} found</p>
            <div style={{ marginTop: 20 }}>
              <Button variant="primary" size="sm" onClick={() => onRoute('createinquiry')}>Don't see what you're looking for? Leave an inquiry</Button>
            </div>
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {(authed ? feed : feed.slice(0, 6)).map((r: any, i: number) => (
            <div key={i}>
              {isReviews ? <ReviewCard {...r} onBrand={() => { const bd = (SUEDE_BRANDS || []).find(x => x.name === r.brand); if (bd) { appState.brand = bd; onRoute('brand'); } }} onSeeFull={() => { appState.review = r; onRoute('review'); }} onReviewer={() => { appState.member = { name: r.reviewer.name, handle: r.reviewer.handle, avatar: r.reviewer.avatar, social: r.reviewer.handle, bio: "I love to explore the brands and Fashion. It's my hobbyy.", measurements: r.measurements, followers: '30', reviews: '24', inquiries: '12', brands: '8' }; onRoute('member'); }} /> : <InquiryCard {...r} onBrand={() => { const bd = (SUEDE_BRANDS || []).find(x => x.name === r.brand); if (bd) { appState.brand = bd; onRoute('brand'); } }} onOpen={() => { appState.inquiry = r; onRoute('inquiry'); }} onAsker={() => { appState.member = { name: r.asker.name, handle: r.asker.handle, avatar: r.asker.avatar, social: r.asker.handle, bio: "I love to explore the brands and Fashion. It's my hobbyy.", measurements: r.measurements, followers: '30', reviews: '24', inquiries: '12', brands: '8' }; onRoute('member'); }} />}
            </div>
          ))}
        </div>
        )}
        {!empty && !authed && feed.length > 6 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(248,246,243,0) 0%, var(--paper) 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 22 }}>          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sign in to see more</span>
          <Button variant="primary" shape="pill" onClick={() => onRoute('signin')}>Sign In</Button>
        </div>}
      </div>
    </div>
  );
}
