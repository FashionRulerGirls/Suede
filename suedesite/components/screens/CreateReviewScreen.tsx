'use client';
/* Suede — Submit a Review (full form). A "size satisfaction" popup fires
   when Sizing Accuracy is rated under 5 stars. */
import React from 'react';
import { Button, Field, Input, Select, Icon } from '@/components/ds';
import { SUEDE_BRANDS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SignInGate } from '@/components/screens/SignInGate';
import { ProductFetch } from '@/components/screens/ProductFetch';

function StarRow({ label, value, onChange }: any) {
  const [hover, setHover] = React.useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '6px 0' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ display: 'inline-flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const on = (hover || value) >= n;
          return (
            <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }} aria-label={`${label} ${n}`}>
              <svg width={22} height={22} viewBox="0 0 24 24" style={{ display: 'block' }}>
                <path d="M12 3.2l2.66 5.7 6.14.72-4.6 4.2 1.24 6.06L12 16.9l-5.48 2.98 1.24-6.06-4.6-4.2 6.14-.72z" fill={on ? 'var(--ink-900)' : 'var(--ink-200)'} />
              </svg>
            </button>
          );
        })}
      </span>
    </div>
  );
}

function SizeSatisfactionModal({ open, onClose, onContinue }: any) {
  const [scale, setScale] = React.useState('Letter');
  const [size, setSize] = React.useState('M');
  const [other, setOther] = React.useState('');
  const [tailoring, setTailoring] = React.useState<any>(null);
  if (!open) return null;
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'];
  const chip = (active: any) => ({
    padding: '14px 0', textAlign: 'center' as any, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink-900)' : 'var(--border-default)'}`,
    background: active ? 'var(--ink-900)' : 'transparent', color: active ? 'var(--white)' : 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--dur-fast) var(--ease-out)',
  });
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(20,18,15,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '100%', maxHeight: '86vh', overflowY: 'auto', background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', padding: '40px 44px', position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 24, right: 26, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
          <Icon name="close" size={22} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 25, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-heading)', margin: '0 0 12px' }}>Weren't satisfied with your size?</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 28px' }}>You've rated the product's sizing accuracy under 5 stars. Please provide additional detail.</p>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>1. What size would you order instead?</div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          {['Letter', 'Numeric / Waist', 'Plus'].map(s => (
            <button key={s} type="button" onClick={() => setScale(s)} style={{ ...chip(scale === s), padding: '12px 22px' }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 12 }}>
          {sizes.map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
        </div>
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '26px 0 20px' }} />
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>Other / brand-specific:</div>
        <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="e.g, 1, 2, 3..."
          style={{ width: '100%', boxSizing: 'border-box', height: 56, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '0 16px', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', outline: 'none' }} />
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--text-primary)', margin: '30px 0 16px' }}>2. Did the item require tailoring?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <button type="button" onClick={() => setTailoring('yes')} style={{ ...chip(tailoring === 'yes'), padding: '18px 0' }}>Yes</button>
          <button type="button" onClick={() => setTailoring('no')} style={{ ...chip(tailoring === 'no'), padding: '18px 0' }}>No</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
          <Button variant="primary" onClick={onContinue || onClose}>Continue review</Button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, action, children }: any) {
  return (
    <section style={{ background: 'var(--white)', padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CreateReviewScreen({ onRoute, authed = false }: any) {
  const brands = SUEDE_BRANDS || [];
  // When arriving from a brand page, that brand is pre-selected.
  const presetBrand = appState.reviewBrand;
  React.useEffect(() => { appState.reviewBrand = null; }, []);
  const [mode, setMode] = React.useState('search');
  const [ratings, setRatings] = React.useState({ sizing: 0, material: 0, value: 0, photos: 0, service: 0 });
  const [scale, setScale] = React.useState('Letter');
  const [size, setSize] = React.useState('');
  const [rec, setRec] = React.useState<any>(null);
  const [modal, setModal] = React.useState(false);
  const [hideMeasure, setHideMeasure] = React.useState(false);
  const [brandType, setBrandType] = React.useState('Capsule Brand');
  const [brandSel, setBrandSel] = React.useState(presetBrand?.name || '');
  const [brandOpen, setBrandOpen] = React.useState(false);
  const [brandQuery, setBrandQuery] = React.useState('');
  const [productSel, setProductSel] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const onPhotos = (e: any) => {
    const files = Array.from(e.target.files || []) as any[];
    if (!files.length) return;
    setPhotos(p => [...p, ...files.slice(0, Math.max(0, 5 - p.length)).map((f) => URL.createObjectURL(f))]);
  };

  const setRating = (k: any, v: any) => {
    setRatings(r => ({ ...r, [k]: v }));
  };
  const submitReview = () => {
    if (ratings.sizing > 0 && ratings.sizing < 5) setModal(true);
    else onRoute('lookbook');
  };

  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'];
  const chip = (active: any) => ({
    padding: '13px 0', textAlign: 'center' as any, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink-900)' : 'var(--border-default)'}`,
    background: active ? 'var(--ink-900)' : 'transparent', color: active ? 'var(--white)' : 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--dur-fast) var(--ease-out)',
  });
  const modeBtn = (id: any, label: any) => (
    <button type="button" onClick={() => setMode(id)} style={{
      padding: '9px 16px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13,
      background: mode === id ? 'var(--ink-900)' : 'var(--linen)', color: mode === id ? 'var(--white)' : 'var(--text-primary)',
    }}>{label}</button>
  );

  return (
    <div>
      {!authed ? <SignInGate onRoute={onRoute} title="Leave a Review" message="Sign in to share your fit, sizing, and quality experience with the community." /> : <React.Fragment>
      {/* Hero header */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '60px 24px 36px' }}>
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Submit a Review</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 10 }}>Share how clothing fits on your body and help others shop with confidence.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SectionCard title="Brand Information">
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            {['Capsule Brand', 'Non-Capsule Brand'].map(t => (
              <button key={t} type="button" onClick={() => { setBrandType(t); setBrandSel(''); setBrandOpen(false); }} style={{ ...chip(brandType === t), padding: '13px 26px' }}>{t}</button>
            ))}
          </div>
          {brandType === 'Capsule Brand' ? (
            <Field label="Select Brand">
              <div style={{ position: 'relative' }}>
                <button type="button" onClick={() => setBrandOpen(o => !o)} style={{
                  width: '100%', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)',
                  padding: '0 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: brandSel ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {brandSel || 'Choose a Capsule brand'}
                  <Icon name="chevron-down" size={16} color="var(--text-secondary)" style={{ transition: 'transform var(--dur-base) var(--ease-out)', transform: brandOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {brandOpen && <div onClick={() => setBrandOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 41, maxHeight: 280, overflowY: 'auto',
                  background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)', padding: 6,
                  opacity: brandOpen ? 1 : 0, transform: brandOpen ? 'translateY(0)' : 'translateY(-6px)',
                  pointerEvents: brandOpen ? 'auto' : 'none', transition: 'opacity 150ms var(--ease-out), transform 150ms var(--ease-out)',
                }}>
                  <div style={{ position: 'sticky', top: 0, background: 'var(--surface-card)', paddingBottom: 6 }}>
                    <Input variant="outline" icon="search" placeholder="Search brands" value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} onClick={(e) => e.stopPropagation()} />
                  </div>
                  {brands.filter(b => b.name.toLowerCase().includes(brandQuery.toLowerCase())).map(b => (
                    <button key={b.name} type="button" onClick={() => { setBrandSel(b.name); setBrandOpen(false); }} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 'var(--radius-xs)', border: 'none',
                      background: brandSel === b.name ? 'var(--linen)' : 'transparent', cursor: 'pointer', textAlign: 'left',
                    }}
                      onMouseEnter={(e) => { if (brandSel !== b.name) e.currentTarget.style.background = 'var(--linen)'; }}
                      onMouseLeave={(e) => { if (brandSel !== b.name) e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', overflow: 'hidden', background: 'var(--linen)' }}>
                        <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                      </span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          ) : (
            <Field label="Brand name" hint="Not in The Capsule yet? Enter the brand name."><Input variant="outline" placeholder="Enter Brand name. Please try to spell it as accurately as possible." /></Field>
          )}
        </SectionCard>

        <SectionCard title="Product Information">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {modeBtn('search', 'Search Existing')}{modeBtn('url', 'Paste URL')}{modeBtn('manual', 'Enter Manually')}
          </div>
          {mode === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input variant="outline" icon="search" placeholder={brandSel ? `Search ${brandSel} products` : 'Search products'} />
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
                {['The Nyomi Maxi', 'Tailored Wide-Leg Trouser', 'Bias Slip Dress', 'Structured Blazer'].map((p, i) => (
                  <button key={p} type="button" onClick={() => setProductSel(p)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', border: 'none', borderTop: i ? '1px solid var(--border-subtle)' : 'none',
                    background: productSel === p ? 'var(--linen)' : 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 40, height: 50, flex: 'none', background: 'var(--linen)' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{p}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode === 'url' && (
            <Field label="Product URL">
              <ProductFetch placeholder="https://example.com/product" />
            </Field>
          )}
          {mode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Product Name"><Input variant="outline" placeholder="e.g. The Nyomi Maxi" /></Field>
              <Field label="Product URL (Optional)"><Input variant="outline" placeholder="https:// example.com/product" /></Field>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Rate This Product">
          <StarRow label="Sizing Accuracy" value={ratings.sizing} onChange={(v: any) => setRating('sizing', v)} />
          <StarRow label="Material Quality" value={ratings.material} onChange={(v: any) => setRating('material', v)} />
          <StarRow label="Value for Price" value={ratings.value} onChange={(v: any) => setRating('value', v)} />
          <StarRow label="True to Photos" value={ratings.photos} onChange={(v: any) => setRating('photos', v)} />
          <StarRow label="Customer Service" value={ratings.service} onChange={(v: any) => setRating('service', v)} />
        </SectionCard>

        <SectionCard title="What size(s) did you order?">
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            {['Letter', 'Numeric / Waist', 'Plus'].map(s => (
              <button key={s} type="button" onClick={() => { setScale(s); setSize(''); }} style={{ ...chip(scale === s), padding: '12px 22px' }}>{s}</button>
            ))}
          </div>
          {scale === 'Letter' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 12 }}>
              {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
            </div>
          )}
          {scale === 'Numeric / Waist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>US dress / clothing size</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10 }}>
                  {['00', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>Waist size (inches) — for bottoms &amp; denim</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 10 }}>
                  {['24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
                </div>
              </div>
            </div>
          )}
          {scale === 'Plus' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {['0X', '1X', '2X', '3X', '4X', '5X', '6X'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '22px 0 16px' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>Other / brand-specific:</div>
          <Input variant="outline" placeholder="e.g, 1, 2, 3..." />
          {size && <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginTop: 14 }}>Selected: {size}</div>}
        </SectionCard>

        <SectionCard title="Add Photos & Videos">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, marginTop: -8 }}>Up to 5 photos • Up to 2 videos • Video max length 60 seconds</div>
          {photos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              {photos.map((src, i) => (
                <span key={i} style={{ position: 'relative', width: 84, height: 104, background: 'var(--linen)', overflow: 'hidden' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} aria-label="Remove photo"
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(20,18,15,0.7)', color: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={13} color="var(--white)" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {photos.length < 5 && (
            <label style={{ border: '1px dashed var(--border-default)', padding: '44px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="file" accept="image/*,video/*" multiple onChange={onPhotos} style={{ display: 'none' }} />
              <Icon name="plus" size={22} color="var(--text-muted)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>Drag and drop or <span style={{ color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>browse files</span></span>
            </label>
          )}
        </SectionCard>

        <SectionCard title="Add Link to Existing Content (Optional)">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, marginTop: -8 }}>Share a TikTok, Instagram, or other social media link if you already have review content you'd like to add.</div>
          <Input variant="outline" placeholder="Paste link here" />
        </SectionCard>

        <SectionCard title="Your Review">
          <textarea rows={5} maxLength={500} placeholder="Tell the community how this item fits on your body."
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>0 / 500 characters</div>
        </SectionCard>

        <SectionCard title="Would you recommend this item?">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button type="button" onClick={() => setRec('yes')} style={{ ...chip(rec === 'yes'), padding: '18px 0' }}>Yes</button>
            <button type="button" onClick={() => setRec('no')} style={{ ...chip(rec === 'no'), padding: '18px 0' }}>No</button>
          </div>
        </SectionCard>

        <SectionCard title="Your Measurements" action={
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Hide your measurement from other users</span>
            <input type="checkbox" checked={hideMeasure} onChange={(e) => setHideMeasure(e.target.checked)} style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }} />
            <span style={{ width: 40, height: 22, borderRadius: 999, background: hideMeasure ? 'var(--ink-900)' : 'var(--ink-200)', position: 'relative', transition: 'background var(--dur-fast)' }}>
              <span style={{ position: 'absolute', top: 2, left: hideMeasure ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'var(--white)', transition: 'left var(--dur-fast)' }} />
            </span>
          </label>
        }>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, marginTop: -8 }}>These measurements will be shown with your review. Even if hidden, they still contribute to our Suede Match calculation.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[['Height', "5'6\""], ['Bust', '34"'], ['Waist', '26"'], ['Hips', '36"']].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--linen)', padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <Button variant="primary" fullWidth size="lg" onClick={submitReview}>Submit Review</Button>
      </div>

      <SizeSatisfactionModal open={modal} onClose={() => setModal(false)} onContinue={() => { setModal(false); onRoute('lookbook'); }} />
      </React.Fragment>}
    </div>
  );
}
