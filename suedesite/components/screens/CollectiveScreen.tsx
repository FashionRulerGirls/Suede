'use client';
import React from 'react';
/* Suede — The Collective (member discovery) screen. */
import { SectionHeading, Button, Avatar } from '@/components/ds';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadCollectiveMembers, setMemberFollow } from '@/lib/contentData';

// Real member card: avatar + bio + real Suede Match + persisted follow.
function RealMemberCard({ mem, viewerId, onView }: any) {
  const [following, setFollowing] = React.useState(!!mem.following);
  const conf = mem.match?.confidence as string | undefined;
  const dot = conf === 'high' ? 'var(--rating-positive)' : conf === 'medium' ? 'var(--denim)' : conf === 'low' ? 'var(--text-muted)' : 'var(--border-strong)';
  const toggle = async () => {
    if (!viewerId) return;
    const on = !following; setFollowing(on);
    const sb = createClient();
    if (sb) { try { await setMemberFollow(sb, viewerId, mem.id, on); } catch { setFollowing(!on); } }
  };
  return (
    <div style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onView} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}><Avatar src={mem.avatar} name={mem.name} size={56} ring /></button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <button onClick={onView} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-serif)', fontSize: 21, color: 'var(--text-primary)' }}>{mem.name}</button>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{mem.handle}</div>
        </div>
        {mem.match && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />{mem.match.score}% match
          </span>
        )}
      </div>
      {mem.bio && <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>{mem.bio}</p>}
      <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        <Button variant={following ? 'secondary' : 'primary'} size="sm" onClick={toggle}>{following ? 'Following' : 'Follow'}</Button>
        <Button variant="ghost" size="sm" onClick={onView}>View Profile</Button>
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
