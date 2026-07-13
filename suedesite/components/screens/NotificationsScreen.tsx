'use client';
import React from 'react';
/* Suede — Notifications page (signed-in members).
   Activity feed: new reviews on followed brands, follows, inquiry responses,
   match alerts. Reached from the avatar dropdown. */
import { Avatar, Icon, Button } from '@/components/ds';
import { SUEDE_NOTIFICATIONS } from '@/lib/data';
import { SignInGate } from '@/components/screens/SignInGate';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { appState } from '@/lib/appState';
import { loadNotifications, markNotificationsRead, loadReviewById, loadInquiryById, reviewRowToCard, inquiryRowToCard } from '@/lib/contentData';

function NotificationRow({ n, onOpen }: any) {
  return (
    <button onClick={() => onOpen(n)} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start',
      padding: '20px 22px', background: n.unread ? 'var(--surface-inset)' : 'transparent',
      border: 'none', borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--dur-fast) var(--ease-out)',
    }}>
      <span style={{ position: 'relative', flex: 'none' }}>
        {n.actor
          ? <Avatar src={n.actor.avatar} name={n.actor.name} size={44} />
          : <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--linen)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-900)' }}><Icon name={n.icon} size={19} /></span>}
        {n.actor && <span style={{ position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface-card)' }}><Icon name={n.icon} size={11} color="var(--white)" /></span>}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--text-primary)' }}>
          {n.actor && <b style={{ fontWeight: 600 }}>{n.actor.name} </b>}
          <span style={{ color: 'var(--text-secondary)' }}>{n.text} </span>
          {n.target && <b style={{ fontWeight: 600 }}>{n.target}</b>}
        </span>
        {n.detail && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)', marginTop: 5, fontStyle: n.detail.startsWith('“') ? 'italic' : 'normal' }}>{n.detail}</span>}
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--text-muted)', marginTop: 7 }}>{n.time}</span>
      </span>
      {n.unread && <span style={{ flex: 'none', width: 7, height: 7, borderRadius: '50%', background: 'var(--rating-positive)', marginTop: 7 }} />}
    </button>
  );
}

export function NotificationsScreen({ onRoute, authed }: any) {
  const { user } = useAuth();
  const real = !!user; // real accounts read live activity; demo shows samples
  const [items, setItems] = React.useState<any[]>(real ? [] : SUEDE_NOTIFICATIONS);
  const [loading, setLoading] = React.useState(real);
  React.useEffect(() => {
    if (!real || !user) { setItems(SUEDE_NOTIFICATIONS); setLoading(false); return; }
    let alive = true;
    const sb = createClient();
    if (!sb) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      try {
        const rows = await loadNotifications(sb, user.id);
        if (alive) setItems(rows);
        // Opening the page clears the unread badge; keep dots for this view.
        await markNotificationsRead(sb, user.id);
        if (alive) window.dispatchEvent(new CustomEvent('suede-notifs-read'));
      } catch { if (alive) setItems([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [real, user?.id]);
  if (!authed && SignInGate) return <SignInGate onRoute={onRoute} title="Notifications" message="Sign in to see your Suede activity." />;
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const openNotif = async (n: any) => {
    if (n.route) { onRoute(n.route); return; } // sample notifications
    const sb = createClient();
    if (!sb || !n.entityType || !n.entityId) return;
    if (n.entityType === 'member') {
      appState.member = { id: n.entityId, name: n.actor?.name, avatar: n.actor?.avatar };
      onRoute('member'); return;
    }
    try {
      if (n.entityType === 'review') {
        const row = await loadReviewById(sb, n.entityId);
        if (row) { appState.review = reviewRowToCard(row); onRoute('review'); }
      } else if (n.entityType === 'inquiry') {
        const row = await loadInquiryById(sb, n.entityId);
        if (row) { appState.inquiry = inquiryRowToCard(row); onRoute('inquiry'); }
      }
    } catch { /* entity removed — leave the user on the list */ }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 8 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your activity</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, color: 'var(--text-heading)', margin: '10px 0 0' }}>Notifications</h1>
        </div>
        <button onClick={markAll} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>Mark all as read</button>
      </div>

      <div style={{ marginTop: 28, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
        {loading ? (
          <div style={{ padding: '64px 22px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '64px 22px', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', width: 52, height: 52, borderRadius: '50%', background: 'var(--linen)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="bell" size={22} color="var(--text-muted)" /></span>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', margin: '0 0 6px' }}>No notifications yet</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>When members react to your reviews or follow you, it&rsquo;ll show up here.</p>
          </div>
        ) : (
          <>
            {items.map((n) => <NotificationRow key={n.id} n={n} onOpen={openNotif} />)}
            <div style={{ padding: '22px', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>You're all caught up.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
