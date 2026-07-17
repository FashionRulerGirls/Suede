'use client';
/* Suede — Full Inquiry detail page. */
import React from 'react';
import { Avatar, MeasurementSpec, Button, Icon, StarRating } from '@/components/ds';
import { SUEDE_BRANDS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { InquiryCard } from '@/components/screens/LookbookScreen';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadInquiryById, loadInquiryResponses, postInquiryResponse, loadReactions, setReaction, loadMemberReviews } from '@/lib/contentData';
import { shopOut } from '@/lib/tracking';

// Compact preview of a review cited in a response — click opens the full review.
function CitedReview({ review, onOpen }: any) {
  if (!review) return null;
  return (
    <button onClick={onOpen} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'var(--linen)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '12px 14px', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Icon name="star" size={13} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', flex: 'none' }}>Cited review</span>
        </span>
        {review.rating != null && <StarRating value={review.rating} compact size={13} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.brand}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.product}</span>
      </div>
      {review.excerpt && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)', margin: '6px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{review.excerpt}</p>}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Read full review</span>
    </button>
  );
}

function ResponseRow({ avatar, name, specs, when, body, review, likes, liked, onLike, onOpenReview }: any) {
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
      <div style={{ paddingLeft: 48 }}>
        {body && <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', margin: '12px 0 0' }}>{body}</p>}
        {review && <CitedReview review={review} onOpen={onOpenReview} />}
      </div>
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

  // The signed-in member's own published reviews — offered as citations.
  const [myReviews, setMyReviews] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (!authed || !user) { setMyReviews([]); return; }
    const sb = createClient(); if (!sb) return;
    let active = true;
    loadMemberReviews(sb, user.id, user.id).then((rs) => { if (active) setMyReviews(rs || []); }).catch(() => {});
    return () => { active = false; };
  }, [authed, user?.id]);

  const openReview = (rv: any) => {
    if (!rv?._id) return;
    appState.review = { _id: rv._id, brand: rv.brand, product: rv.product, rating: rv.rating, excerpt: rv.excerpt, size: rv.size, recommend: rv.recommend };
    onRoute('review');
  };

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
  const image = real ? (full?.product_image_url || q.image || '') : (q.image || '/assets/imagery/fit-street.jpg');
  const brand = (real ? (full?.brand_name || q.brand) : q.brand) || 'Nadi';
  const product = (real ? (full?.product_name || q.product) : q.product) || 'The Nyomi Maxi';
  const size = real ? (full?.size_value || full?.size_other || q.size || '') : (q.size || '6');
  const question = (real ? (full?.body || q.question) : q.question) || 'How much coverage does the dress offer?';
  const productUrl = real ? full?.product_url : null;
  const price = real ? (full?.product_price || '') : '$245';
  const [draft, setDraft] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const [attached, setAttached] = React.useState<any>(null); // a review cited alongside the response
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const canSubmit = !!(draft.trim() || attached);
  const submitResponse = async () => {
    if (!authed) { onRoute('signin'); return; }
    const text = draft.trim();
    if (!text && !attached) return;
    if (real) {
      const sb = createClient();
      if (sb && user) {
        setPosting(true);
        try {
          const resp = await postInquiryResponse(sb, user.id, q._id, text, attached?._id);
          setResponses((rs) => [...rs, resp]);
          setDraft(''); setAttached(null);
        } catch { /* ignore */ }
        setPosting(false);
        return;
      }
    }
    setResponses(rs => [...rs, { avatar: profile?.avatar_url || '/assets/avatars/avatar-rose.jpg', name: profile?.display_name || 'Kikiola Akanbi', specs: '', when: 'Just now', likes: 0, body: text, review: attached || null }]);
    setDraft(''); setAttached(null);
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
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 14 }}>Purchase Details</div>
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap', rowGap: 18 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brand</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginTop: 5 }}>{brand}</div>
              </div>
              {size && (
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Size sought</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginTop: 5 }}>{size}</div>
                </div>
              )}
              {price && (
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Price</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginTop: 5 }}>{price}</div>
                </div>
              )}
            </div>
          </div>

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

            {/* Cite one of your own reviews */}
            {attached ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, background: 'var(--linen)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px 12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Icon name="star" size={13} color="var(--text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Citing your review of <strong style={{ color: 'var(--text-primary)' }}>{attached.brand} {attached.product}</strong></span>
                </span>
                <button onClick={() => setAttached(null)} aria-label="Remove cited review" style={{ display: 'inline-flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)', flex: 'none' }}><Icon name="close" size={15} color="var(--text-muted)" /></button>
              </div>
            ) : authed && myReviews.length > 0 && (
              <div style={{ position: 'relative', marginTop: 12 }}>
                <button onClick={() => setPickerOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '7px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)' }}>
                  <Icon name="star" size={13} color="var(--text-muted)" />Cite one of your reviews
                </button>
                {pickerOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30, width: 340, maxHeight: 260, overflowY: 'auto', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xs)' }}>
                    {myReviews.map((rv: any) => (
                      <button key={rv._id} onClick={() => { setAttached(rv); setPickerOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)', padding: '11px 14px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rv.brand}</span>
                          {rv.rating != null && <StarRating value={rv.rating} compact size={12} />}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rv.product}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Be respectful and constructive · {draft.length} / 500</span>
              <Button variant="primary" size="sm" disabled={(authed && !canSubmit) || posting} onClick={submitResponse}>{posting ? 'Posting…' : 'Submit Response'}</Button>
            </div>
          </div>

          {/* Responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {responses.length === 0
              ? <div style={{ textAlign: 'center', padding: '28px 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>No responses yet — be the first to help.</div>
              : responses.map((r, i) => <ResponseRow key={r.id || i} {...r} onLike={real && r.id ? () => toggleResponseLike(r.id) : undefined} onOpenReview={() => openReview(r.review)} />)}
          </div>
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}
