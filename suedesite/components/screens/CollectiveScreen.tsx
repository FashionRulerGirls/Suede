'use client';
import React from 'react';
/* Suede — The Collective (member discovery) screen. */
import { SectionHeading, MeasurementSpec, Badge, Button } from '@/components/ds';
import { SUEDE_MEMBERS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';

function CollectiveMemberCard({ name, handle, m, reviews, inquiries, brands, photo, confidence = 'high', onView }: any) {
  const [following, setFollowing] = React.useState(false);
  const link = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3, textAlign: 'right' } as any;
  const conf = ({ high: { tone: 'positive', dot: '#3f7d52', label: 'High Confidence' }, medium: { tone: 'premium', dot: '#c9a96e', label: 'Medium Confidence' }, low: { tone: 'critical', dot: '#c0463a', label: 'Low Confidence' } } as any)[confidence];
  return (
    <div style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', padding: '22px 26px', display: 'flex', flexDirection: 'column' }}>
      <div className="sd-coll-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <button onClick={onView} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-serif)', fontSize: 21, color: 'var(--text-primary)' }}>{name}</button>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: 3 }}>{handle}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <MeasurementSpec {...m} size="sm" tone="muted" />
          <span style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '1'; t.style.pointerEvents = 'auto'; } }}
            onMouseLeave={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '0'; t.style.pointerEvents = 'none'; } }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--text-muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: conf.dot, flex: 'none' }} />Suede Match
            </span>
            <span data-tip style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, whiteSpace: 'nowrap', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 20 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)' }}>{conf.label}</span>
            </span>
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14, marginTop: 16 }}>
        <span aria-hidden="true" />
        <img src={photo} alt={name} style={{ width: 168, height: 220, objectFit: 'cover', objectPosition: 'center 28%', justifySelf: 'center' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifySelf: 'end', alignItems: 'flex-end' }}>
          <button style={{ ...link, color: following ? 'var(--text-muted)' : 'var(--text-primary)' }} onClick={() => setFollowing(f => !f)}>{following ? 'Following ✓' : 'Follow+'}</button>
          <button style={link} onClick={onView}>View Profile</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
        {[['Reviews', reviews], ['Inquiries', inquiries], ['Capsule Brands', brands]].map(([k, v]: any) => (
          <div key={k} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-primary)', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CollectiveScreen({ onRoute, authed = false }: any) {
  const { SearchBar, Dropdown, FilterChip, CollapsibleToolbar } = SuedeControls;
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('join');
  const [match, setMatch] = React.useState(false);
  const [hasReviews, setHasReviews] = React.useState(false);
  const photos = [
    '/assets/imagery/oumou.jpg',
    '/assets/imagery/fit-asaya.jpeg',
    '/assets/imagery/fit-street.jpg',
    '/assets/imagery/fit-bomber.png',
  ];
  const members = [
    { name: 'Kikiola Akanbi', handle: '@kikiolaakanbi', social: '@kikiolaakanbi', bio: 'Founder of Suede. Obsessed with fit, fabric, and the brands that get both right.', m: { height: "5'5\"", bust: '33"', waist: '29"', hips: '40"' }, reviews: 1, inquiries: 0, brands: 1 },
    { name: 'Amara Johnson', handle: '@amaraj', social: '@amaraj', bio: 'Brooklyn-based, drawn to clean tailoring and considered eveningwear. Always hunting the perfect drape.', m: { height: "5'7\"", bust: '35"', waist: '27"', hips: '38"' }, reviews: 12, inquiries: 3, brands: 5 },
    { name: 'Sarah Chen', handle: '@sarahc', social: '@sarahc', bio: 'Petite-frame minimalist. I review for accuracy so you can shop with confidence.', m: { height: "5'4\"", bust: '34"', waist: '28"', hips: '36"' }, reviews: 8, inquiries: 1, brands: 2 },
    { name: 'Zoe Williams', handle: '@zoew', social: '@zoew', bio: 'Tall-girl fit problems, solved out loud. Denim, trousers, and anything with a hem.', m: { height: "5'9\"", bust: '36"', waist: '30"', hips: '42"' }, reviews: 24, inquiries: 7, brands: 8 },
    { name: 'Priya Patel', handle: '@priyap', social: '@priyap', bio: 'Color-forward and print-loving. I care most about true-to-photo accuracy.', m: { height: "5'2\"", bust: '32"', waist: '26"', hips: '35"' }, reviews: 15, inquiries: 4, brands: 3 },
    { name: 'Emma Rodriguez', handle: '@emmar', social: '@emmar', bio: 'Curve-conscious shopper documenting what actually fits. Stretch, structure, and honesty.', m: { height: "5'6\"", bust: '38"', waist: '32"', hips: '44"' }, reviews: 6, inquiries: 2, brands: 1 },
  ];
  const openMember = (mem: any) => {
    appState.member = { name: mem.name, handle: mem.handle, avatar: mem.photo, social: mem.social || mem.handle, bio: mem.bio || '', measurements: mem.m, followers: String(20 + mem._i * 7), reviews: String(mem.reviews), inquiries: String(mem.inquiries), brands: String(mem.brands) };
    onRoute('member');
  };
  const q = query.trim().toLowerCase();
  let view = members.map((mem, i) => ({ ...mem, photo: photos[i % photos.length], _i: i, matchPct: 96 - i * 6 }));
  view = view.filter(mem => (mem.name.toLowerCase().includes(q) || mem.handle.toLowerCase().includes(q)) && (!hasReviews || mem.reviews > 0));
  if (sort === 'match') view.sort((a, b) => b.matchPct - a.matchPct);
  const empty = view.length === 0;
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '64px 40px 0' }}>
      <SectionHeading
        eyebrow="Member Directory"
        title="The Collective"
        subtitle="The trusted voices behind Suede reviews and inquiries, building a community around transparency and brand awareness"
        size="lg"
      />

      <CollapsibleToolbar align="space-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Search members by name" />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterChip label="Suede Match" active={match} onClick={() => setMatch(m => !m)} />
          <FilterChip label="Has Reviews" active={hasReviews} onClick={() => setHasReviews(v => !v)} />
          <Dropdown label="Sort" value={sort} onChange={setSort} options={[{ value: 'join', label: 'Member Join Date' }, { value: 'match', label: 'Suede Match %' }]} />
        </div>
      </CollapsibleToolbar>

      <div style={{ position: 'relative', marginTop: 28 }}>
        {empty ? (
          <div style={{ textAlign: 'center', padding: '54px 0', fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-heading)' }}>No members found matching that name.</div>
        ) : (
        <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
          {(authed ? view : view.slice(0, 6)).map((mem, i) => (
            <div key={mem.handle + i}>
              <CollectiveMemberCard {...mem} photo={photos[i % photos.length]} onView={() => openMember({ ...mem, photo: photos[i % photos.length] })} />
            </div>
          ))}
        </div>
        )}
        {!empty && !authed && view.length > 6 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(248,246,243,0) 0%, var(--paper) 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 22 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sign in to see more</span>
          <Button variant="primary" shape="pill" onClick={() => onRoute('signin')}>Sign In</Button>
        </div>}
      </div>
    </div>
  );
}
