'use client';
/* Suede — Full Review detail page. */
import React from 'react';
import { Avatar, MeasurementSpec, StarRating, Button, Icon, Lightbox } from '@/components/ds';
import { SUEDE_BRANDS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadReviewById, loadReviewComments, postReviewComment, loadReviewMedia, formatDate, canEditReview, deleteReview } from '@/lib/contentData';

function SubRating({ label, value }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)' }}>{label}</span>
      <StarRating value={value} size={18} />
    </div>
  );
}

function CommentRow({ avatar, name, when, body, likes }: any) {
  return (
    <article style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={avatar} name={name} size="sm" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)' }}>{name}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{when}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', margin: '12px 0 0', paddingLeft: 48 }}>{body}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, paddingLeft: 48, color: 'var(--text-muted)' }}>
        <Icon name="thumbs-up" size={14} color="var(--text-muted)" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>{likes}</span>
      </div>
    </article>
  );
}

export function ReviewDetailScreen({ onRoute, authed = false }: any) {
  const r = appState.review || {};
  const real = !!r._id; // came from the database (vs. the guest/demo sample)
  const { user, profile } = useAuth();
  const [full, setFull] = React.useState<any>(null);
  const [media, setMedia] = React.useState<{ url: string; kind: string; poster?: string | null }[]>([]);
  const [lb, setLb] = React.useState<number | null>(null);
  const [comments, setComments] = React.useState<any[]>(real ? [] : [
    { avatar: '/assets/avatars/avatar-rose.jpg', name: 'Sophie L.', when: '2 days ago', likes: 3, body: "These look amazing! How do they compare to your usual size? I'm between sizes too." },
    { avatar: '/assets/avatars/avatar-blue.jpg', name: 'Maria T.', when: '1 day ago', likes: 1, body: 'The drape on these is beautiful. Do they stretch at all in the waist?' },
    { avatar: '/assets/avatars/avatar-asaya.jpg', name: 'Alex P.', when: '12 hours ago', likes: 5, body: "I have similar measurements and ordered these based on your review. Can't wait for them to arrive!" },
  ]);
  React.useEffect(() => {
    if (!real) return;
    const sb = createClient();
    if (!sb) return;
    let active = true;
    loadReviewById(sb, r._id).then((f) => { if (active) setFull(f); }).catch(() => {});
    loadReviewComments(sb, r._id).then((c) => { if (active) setComments(c); }).catch(() => {});
    loadReviewMedia(sb, r._id).then((u) => { if (active) setMedia(u); }).catch(() => {});
    return () => { active = false; };
  }, [r._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const reviewer = r.reviewer || { name: 'Kikiola Akanbi', handle: '@kikiolaakanbi', avatar: '/assets/avatars/avatar-asaya.jpg' };
  const hideMeas = real ? !!full?.hide_measurements : false;
  const m = r.measurements || { height: "5'5\"", bust: '33"', waist: '29"', hips: '40"' };
  const firstImage = real ? (media.find((x) => x.kind === 'image')?.url || '') : '';
  const image = real ? firstImage : (r.image || '/assets/imagery/fit-bomber.png');
  // Everything the lightbox can page through (all photos/videos for a real
  // review; the single sample image otherwise).
  const gallery: any[] = real ? media : (image ? [{ url: image, kind: 'image' }] : []);
  const primary = gallery[0]; // the main preview (may be a video)
  const openLightbox = (i: number) => { if (gallery.length) setLb(Math.max(0, Math.min(i, gallery.length - 1))); };
  const product = (real ? (full?.product_name || r.product) : r.product) || 'Tailored Wide-Leg Trouser';
  const brand = (real ? (full?.brand_name || r.brand) : r.brand) || 'Nadi';
  const body = (real ? (full?.body || r.excerpt) : r.full) || r.excerpt || "These trousers are everything. The wide leg is flattering without being overwhelming, and they hit at just the right length for my height. True to size for my measurements—I ordered a medium and it fits perfectly at the waist and hips. The fabric has a beautiful drape with a subtle sheen that elevates any outfit. I've worn them to work with a silk blouse and also dressed them down with sneakers on the weekend. The tailoring is impeccable—you can tell these are made to last. The only minor note is that they do wrinkle easily, so steaming before wear is recommended. Overall, absolutely worth the investment for a versatile wardrobe staple.";
  const dateStr = real ? (full ? formatDate(full.created_at) : '') : '01 February 2026';
  const size = real ? (full?.size_value || full?.size_other || '') : (r.size || '');
  const productUrl = real ? full?.product_url : null;
  const thumbs = real ? media : (image ? [image, image, image, image] : []);
  const subRatings = real
    ? ([['Sizing Accuracy', 'rating_sizing'], ['Material Quality', 'rating_material'], ['Value for Price', 'rating_value'], ['True to Photos', 'rating_photos'], ['Customer service', 'rating_service']] as const)
        .map(([label, key]) => ({ label, value: full?.[key] })).filter((s) => s.value != null)
    : [{ label: 'Sizing Accuracy', value: 4 }, { label: 'Material Quality', value: 4 }, { label: 'Value for Price', value: 4 }, { label: 'True to Photos', value: 4 }, { label: 'Customer service', value: 4 }];

  // Author-only actions: edit (within 24h of posting) and delete.
  const isAuthor = real && !!user && !!full && full.author_id === user.id;
  const editable = isAuthor && canEditReview(full?.created_at);
  const [deleting, setDeleting] = React.useState(false);
  const onEdit = () => { appState.editReview = { ...full }; onRoute('createreview'); };
  const onDelete = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this review? This can’t be undone.')) return;
    const sb = createClient();
    if (!sb || !user) return;
    setDeleting(true);
    try { await deleteReview(sb, user.id, r._id); onRoute('yourprofile'); }
    catch { setDeleting(false); }
  };

  const [draft, setDraft] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const postComment = async () => {
    const text = draft.trim();
    if (!text) return;
    if (real) {
      const sb = createClient();
      if (sb && user) {
        setPosting(true);
        try {
          const c = await postReviewComment(sb, user.id, r._id, text);
          setComments((cs) => [c, ...cs]);
          setDraft('');
        } catch { /* ignore */ }
        setPosting(false);
        return;
      }
    }
    setComments((c) => [{ avatar: profile?.avatar_url || '/assets/avatars/avatar-rose.jpg', name: profile?.display_name || 'Kikiola Akanbi', when: 'Just now', likes: 0, body: text }, ...c]);
    setDraft('');
  };

  return (
    <div className="sd-rev-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => onRoute('lookbook')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to Lookbook
        </button>
        {isAuthor && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
            {editable ? (
              <button onClick={onEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>
                <Icon name="pen" size={15} color="var(--text-primary)" /> Edit
              </button>
            ) : (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)' }}>Edits close 24h after posting</span>
            )}
            <button onClick={onDelete} disabled={deleting} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--rating-critical)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div className="sd-rev-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
        {/* Left — gallery */}
        <div>
          <div onClick={() => primary && openLightbox(0)} style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: primary?.kind === 'video' && !primary?.poster ? 'var(--ink-900)' : 'var(--linen)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: primary ? 'zoom-in' : 'default' }}>
            {!primary
              ? <Icon name="image" size={40} color="var(--text-muted)" />
              : primary.kind === 'video'
                ? <React.Fragment>
                    {primary.poster
                      ? <img src={primary.poster} alt={product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <video src={primary.url} muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />}
                    <span style={{ position: 'absolute', width: 66, height: 66, borderRadius: '50%', background: 'rgba(20,18,15,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="play" size={28} color="#fff" /></span>
                  </React.Fragment>
                : <img src={primary.url} alt={product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          {thumbs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
            {thumbs.map((t: any, i: number) => {
              const url = typeof t === 'string' ? t : t.url;
              const isVideo = typeof t !== 'string' && t.kind === 'video';
              const poster = typeof t !== 'string' ? t.poster : null;
              return (
                <div key={i} onClick={() => openLightbox(real ? i : 0)} style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: isVideo ? 'var(--ink-900)' : 'var(--linen)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isVideo
                    ? <>{poster ? <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <video src={url} muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />}<span style={{ position: 'absolute', display: 'inline-flex' }}><Icon name="play" size={22} color="#fff" /></span></>
                    : <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Right — review */}
        <div>
          <h1 className="sd-rev-title" style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 38, letterSpacing: '-0.01em', color: 'var(--text-heading)', margin: '0 0 28px' }}>{product}</h1>
          <div className="sd-rev-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <Avatar src={reviewer.avatar} name={reviewer.name} handle={reviewer.handle} size="lg" showName />
            {!hideMeas && <MeasurementSpec {...m} size="md" tone="muted" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }} />}
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Review</div>
            {dateStr && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{dateStr}</div>}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: '16px 0 0' }}>{body}</p>
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 16 }}>Purchase Details</div>
            <div style={{ display: 'flex', gap: 80 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brand</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginTop: 5 }}>{brand}</div>
              </div>
              {real ? (size && (
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Size</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginTop: 5 }}>{size}</div>
                </div>
              )) : (
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Price</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginTop: 5 }}>$285</div>
                </div>
              )}
            </div>
            <button onClick={() => { if (productUrl) { window.open(productUrl, '_blank', 'noopener,noreferrer'); return; } const bd = (SUEDE_BRANDS || []).find(b => b.name === brand); if (bd) { appState.brand = bd; onRoute('brand'); } }} style={{ background: 'none', border: 'none', padding: 0, marginTop: 18, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>View Product</button>
          </div>

          {subRatings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
            {subRatings.map((s) => <SubRating key={s.label} label={s.label} value={s.value} />)}
          </div>
          )}

          <div style={{ display: 'flex', gap: 24, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            {!real && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 14 }}><Icon name="thumbs-up" size={16} color="var(--text-muted)" />48 Helpful</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 14 }}><Icon name="message" size={16} color="var(--text-muted)" />{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48 }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>No comments yet — start the conversation.</div>
        ) : comments.map((c, i) => <CommentRow key={c.id || i} {...c} />)}
      </div>

      {/* CTA / composer */}
      {authed ? (
        <div style={{ padding: '40px 0' }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 22 }}>
            <textarea rows={3} maxLength={500} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Join the community discussion — ask about fit, sizing, or styling."
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Be respectful and constructive · {draft.length} / 500</span>
              <Button variant="primary" size="sm" disabled={!draft.trim() || posting} onClick={postComment}>{posting ? 'Posting…' : 'Post Comment'}</Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '56px 0 40px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 20 }}>Sign in to join the community discussion</div>
          <Button variant="primary" shape="pill" onClick={() => onRoute('signin')}>Sign In</Button>
        </div>
      )}

      {lb !== null && <Lightbox items={gallery} index={lb} onClose={() => setLb(null)} onIndex={setLb} />}
    </div>
  );
}
