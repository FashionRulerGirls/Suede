'use client';
/* Suede — Full Inquiry detail page. */
import React from 'react';
import { Avatar, MeasurementSpec, Button, Icon } from '@/components/ds';
import { SUEDE_BRANDS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { InquiryCard } from '@/components/screens/LookbookScreen';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadInquiryById, loadInquiryResponses, postInquiryResponse, loadReactions, setReaction } from '@/lib/contentData';
import { shopOut } from '@/lib/tracking';

function ResponseRow({ avatar, name, specs, when, body, likes, liked, onLike }: any) {
  const color = liked ? 'var(--rating-positive)' : 'var(--text-muted)';
  return (
    <article style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={avatar} name={name} size="sm" />
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>{name}</span>
            <span style={{ fontFamily: 'var(--font-meta)', fontWeight: 500, fontSize: 12, letterSpacing: '0.04em', color: 'var(--text-muted)' }}>{specs}</span>
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{when}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', margin: '12px 0 0', paddingLeft: 48 }}>{body}</p>
      <button onClick={onLike} disabled={!onLike} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, marginLeft: 48, background: 'none', border: 'none', padding: 0, cursor: onLike ? 'pointer' : 'default', color }}>
        <Icon name="thumbs-up" size={14} color={color} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>{likes}</span>
      </button>
    </article>
  );
}

export function InquiryDetailScreen({ onRoute, authed = false }: any) {
  const q = appState.inquiry || {};
  const real = !!q._id; // came from the database (vs. the guest/demo sample)
  const { user, profile } = useAuth();
  const [full, setFull] = React.useState<any>(null);
  const [responses, setResponses] = React.useState<any[]>(real ? [] : [
    { avatar: '/assets/avatars/avatar-rose.jpg', name: 'Sophie L.', specs: '5\'6"/33"/39"/40"', when: '2 days ago', likes: 3, body: 'Good coverage — fully lined through the bodice and skirt, only the leg slit is high.' },
    { avatar: '/assets/avatars/avatar-blue.jpg', name: 'Maria T.', specs: '5\'6"/33"/39"/40"', when: '1 day ago', likes: 1, body: 'Pretty good coverage. The neckline sits high and the sleeves are full length.' },
  ]);
  React.useEffect(() => {
    if (!real) return;
    const sb = createClient();
    if (!sb) return;
    let active = true;
    loadInquiryById(sb, q._id).then((f) => { if (active) setFull(f); }).catch(() => {});
    loadInquiryResponses(sb, q._id).then(async (rs) => {
      if (!active) return;
      const ids = rs.map((x: any) => x.id).filter(Boolean);
      const { counts, mine } = await loadReactions(sb, user?.id, 'inquiry_response', ids).catch(() => ({ counts: {}, mine: new Set<string>() }));
      if (active) setResponses(rs.map((x: any) => ({ ...x, likes: counts[x.id] || 0, liked: mine.has(x.id) })));
    }).catch(() => {});
    return () => { active = false; };
  }, [q._id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleResponseLike = async (rid: string) => {
    if (!user) { onRoute('signin'); return; }
    const sb = createClient(); if (!sb) return;
    const cur = responses.find((x) => x.id === rid);
    const on = !cur?.liked;
    setResponses((rs) => rs.map((x) => x.id === rid ? { ...x, liked: on, likes: x.likes + (on ? 1 : -1) } : x));
    try { await setReaction(sb, user.id, 'inquiry_response', rid, on); }
    catch { setResponses((rs) => rs.map((x) => x.id === rid ? { ...x, liked: !on, likes: x.likes + (on ? -1 : 1) } : x)); }
  };

  const asker = q.asker || { name: 'Kikiola Akanbi', handle: '@kikiolaakanbi', avatar: '/assets/avatars/avatar-asaya.jpg' };
  const m = q.measurements || { height: "5'5\"", bust: '33"', waist: '29"', hips: '40"' };
  const image = real ? '' : (q.image || '/assets/imagery/fit-street.jpg');
  const brand = (real ? (full?.brand_name || q.brand) : q.brand) || 'Nadi';
  const product = (real ? (full?.product_name || q.product) : q.product) || 'The Nyomi Maxi';
  const size = real ? (full?.size_value || full?.size_other || q.size || '') : (q.size || '6');
  const question = (real ? (full?.body || q.question) : q.question) || 'How much coverage does the dress offer?';
  const productUrl = real ? full?.product_url : null;
  const [draft, setDraft] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const submitResponse = async () => {
    if (!authed) { onRoute('signin'); return; }
    const text = draft.trim();
    if (!text) return;
    if (real) {
      const sb = createClient();
      if (sb && user) {
        setPosting(true);
        try {
          const resp = await postInquiryResponse(sb, user.id, q._id, text);
          setResponses((rs) => [...rs, resp]);
          setDraft('');
        } catch { /* ignore */ }
        setPosting(false);
        return;
      }
    }
    setResponses(rs => [...rs, { avatar: profile?.avatar_url || '/assets/avatars/avatar-rose.jpg', name: profile?.display_name || 'Kikiola Akanbi', specs: '', when: 'Just now', likes: 0, body: text }]);
    setDraft('');
  };

  return (
    <div className="sd-iqd-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
      <button onClick={() => { appState.lookbookTab = 'inquiries'; onRoute('lookbook'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to Lookbook
      </button>

      <div className="sd-iqd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
        {/* Left — product image + CTA */}
        <div>
          <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--linen)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {image ? <img src={image} alt={product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="image" size={40} color="var(--text-muted)" />}
          </div>
          <Button variant="primary" fullWidth style={{ marginTop: 14 }} onClick={() => { if (productUrl && shopOut(createClient(), { rawUrl: productUrl, brandName: brand, productName: product, memberId: user?.id, sourcePage: 'inquiry', content: 'inquiry-product' })) return; const bd = (SUEDE_BRANDS || []).find(b => b.name === brand); if (bd) { appState.brand = bd; onRoute('brand'); } }}>View Product</Button>
        </div>

        {/* Right — inquiry + responses */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>{brand}</div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 36, letterSpacing: '-0.01em', color: 'var(--text-heading)', margin: '6px 0 18px' }}>{product}</h1>
            </div>
            <Icon name="message" size={20} color="var(--text-muted)" />
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '7px 12px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)' }}>
            <Icon name="search" size={13} color="var(--text-muted)" /> Size {size}
          </span>

          <div className="sd-iqd-asker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 24 }}>
            <Avatar src={asker.avatar} name={asker.name} handle={asker.handle} size="lg" showName />
            <MeasurementSpec {...m} size="md" tone="muted" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-primary)', margin: '22px 0 28px' }}>{question}</p>

          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Community Responses ({responses.length})</div>

          {/* Response composer */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 22 }}>
            <textarea rows={3} maxLength={500} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Let's have community discussion across the page"
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Be respectful and constructive · {draft.length} / 500</span>
              <Button variant="primary" size="sm" disabled={(authed && !draft.trim()) || posting} onClick={submitResponse}>{posting ? 'Posting…' : 'Submit Response'}</Button>
            </div>
          </div>

          {/* Responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {responses.length === 0
              ? <div style={{ textAlign: 'center', padding: '28px 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>No responses yet — be the first to help.</div>
              : responses.map((r, i) => <ResponseRow key={r.id || i} {...r} onLike={real && r.id ? () => toggleResponseLike(r.id) : undefined} />)}
          </div>
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}
