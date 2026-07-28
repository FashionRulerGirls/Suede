'use client';
import React from 'react';
/* Suede — The Collective (member discovery) screen. */
import { SectionHeading, Button, Avatar, MeasurementSpec } from '@/components/ds';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadCollectiveMembers, setMemberFollow } from '@/lib/contentData';

// Real member card — mirrors the home-page member card (LandingScreen):
// header with measurement spec + Suede Match pill, centered portrait with
// Follow+/View Profile links, and a Reviews/Inquiries/Followers stats footer.
function RealMemberCard({ mem, viewerId, onView }: any) {
  const [following, setFollowing] = React.useState(!!mem.following);
  const conf = mem.match?.confidence as string | undefined;
  const dot = conf === 'high' ? 'var(--rating-positive)' : conf === 'medium' ? 'var(--denim)' : conf === 'low' ? 'var(--text-muted)' : 'var(--border-strong)';
  const confLabel = conf === 'high' ? 'High Confidence' : conf === 'medium' ? 'Medium Confidence' : conf === 'low' ? 'Exploratory' : '';
  const toggle = async () => {
    if (!viewerId) return;
    const on = !following; setFollowing(on);
    const sb = createClient();
    if (sb) { try { await setMemberFollow(sb, viewerId, mem.id, on); } catch { setFollowing(!on); } }
  };
  const link: any = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3, textAlign: 'left' };
  const m = mem.measurements || {};
  const hasMeas = !!(m.height || m.bust || m.waist || m.hips);
  const s = mem.stats || { reviews: 0, inquiries: 0, followers: 0 };
  const stat = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k` : String(n));
  return (
    <div className="sd-collcard" style={{ background: 'var(--surface-card)', borderRadius: 0, boxShadow: '0 16px 42px rgba(16,14,11,0.16)', padding: '16px 30px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <button onClick={onView} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-primary)' }}>{mem.name}</button>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: 3 }}>{mem.handle}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {hasMeas && <MeasurementSpec height={m.height} bust={m.bust} waist={m.waist} hips={m.hips} size="sm" tone="muted" />}
          {mem.match && (
            <span style={{ position: 'relative', display: 'inline-flex' }}
              onMouseEnter={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '1'; t.style.pointerEvents = 'auto'; } }}
              onMouseLeave={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '0'; t.style.pointerEvents = 'none'; } }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--text-muted)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flex: 'none' }} />Suede Match
              </span>
              <span data-tip className="sd-rating-pop" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, whiteSpace: 'nowrap', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 20 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)' }}>{mem.match.score != null ? `${mem.match.score}% match` : ''}{mem.match.score != null && confLabel ? ' · ' : ''}{confLabel}</span>
              </span>
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, marginTop: 14 }}>
        <span aria-hidden="true" />
        <button onClick={onView} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', justifySelf: 'center', lineHeight: 0 }}>
          {mem.avatar
            ? <img src={mem.avatar} alt={mem.name} style={{ width: 184, height: 244, objectFit: 'cover', objectPosition: 'center 30%', borderRadius: 0, display: 'block' }} />
            : <Avatar name={mem.name} size={184} />}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifySelf: 'end', alignItems: 'flex-end' }}>
          <button style={link} onClick={toggle}>{following ? 'Following' : 'Follow+'}</button>
          <button style={link} onClick={onView}>View Profile</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        {[['Reviews', s.reviews], ['Inquiries', s.inquiries], ['Followers', s.followers]].map(([k, v]: any) => (
          <div key={k} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-primary)', marginTop: 4 }}>{stat(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CollectiveScreen({ onRoute, authed = false }: any) {
  const { SearchBar, Dropdown, FilterChip, CollapsibleToolbar } = SuedeControls;
  const { user } = useAuth();
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('join');
  const [match, setMatch] = React.useState(false);
  const [realMembers, setRealMembers] = React.useState<any[] | null>(null);
  React.useEffect(() => {
    let alive = true;
    const sb = createClient();
    if (!sb) { setRealMembers([]); return; }
    (async () => {
      try {
        const rows = await loadCollectiveMembers(sb, user?.id);
        if (alive) setRealMembers(rows);
      } catch { if (alive) setRealMembers([]); }
    })();
    return () => { alive = false; };
  }, [user?.id]);
  const openRealMember = (mem: any) => {
    appState.member = { id: mem.id, name: mem.name, handle: mem.handle, avatar: mem.avatar, social: mem.handle, bio: mem.bio };
    onRoute('member');
  };
  const q = query.trim().toLowerCase();

  // Everyone — guests included — sees the live member directory. Guests get a
  // capped preview with a sign-in wall; there's no sample member data anymore.
  let rv = (realMembers || []).filter((mem: any) =>
    (mem.name.toLowerCase().includes(q) || mem.handle.toLowerCase().includes(q)) &&
    (!match || !!mem.match)
  );
  if (sort === 'match') rv = [...rv].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
  const shown = authed ? rv : rv.slice(0, 6);
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
          <Dropdown label="Sort" value={sort} onChange={setSort} options={[{ value: 'join', label: 'Member Join Date' }, { value: 'match', label: 'Suede Match %' }]} />
        </div>
      </CollapsibleToolbar>
      <div style={{ position: 'relative', marginTop: 28 }}>
        {realMembers === null ? (
          <div style={{ textAlign: 'center', padding: '54px 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Loading members…</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '54px 0', fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-heading)' }}>
            {query ? 'No members found matching that name.' : 'The Collective is just getting started — check back as members join.'}
          </div>
        ) : (
          <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
            {shown.map((mem: any) => (
              <RealMemberCard key={mem.id} mem={mem} viewerId={user?.id} onView={() => openRealMember(mem)} />
            ))}
          </div>
        )}
        {!authed && rv.length > 6 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(248,246,243,0) 0%, var(--paper) 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 22 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sign in to see more</span>
          <Button variant="primary" shape="pill" onClick={() => onRoute('signin')}>Sign In</Button>
        </div>}
      </div>
    </div>
  );
}
