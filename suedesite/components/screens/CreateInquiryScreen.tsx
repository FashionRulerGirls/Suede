'use client';
/* Suede — Submit an Inquiry (create) page. */
import React from 'react';
import { Button, Field, Input, Icon } from '@/components/ds';
import { appState } from '@/lib/appState';
import { SUEDE_BRANDS } from '@/lib/data';
import { SignInGate } from '@/components/screens/SignInGate';
import { ProductFetch } from '@/components/screens/ProductFetch';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { createInquiry } from '@/lib/contentData';
import { loadProfileData, inchesToHeight, inchesDisplay } from '@/lib/profileData';

function CISectionCard({ title, action, children }: any) {
  return (
    <section className="sd-form-card" style={{ background: 'var(--white)', padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '0 0 22px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CreateInquiryScreen({ onRoute, authed = false }: any) {
  const { user } = useAuth();
  const [scale, setScale] = React.useState('Letter');
  const [size, setSize] = React.useState('');
  const [otherSize, setOtherSize] = React.useState('');
  // When the form was opened — powers the admin "avg time to submit" metric.
  const startedRef = React.useRef(new Date().toISOString());
  const [hideMeasure, setHideMeasure] = React.useState(false);
  const [detail, setDetail] = React.useState('');
  const [product, setProduct] = React.useState('');
  const [productImage, setProductImage] = React.useState('');
  const [productUrl, setProductUrl] = React.useState('');
  const [productPrice, setProductPrice] = React.useState('');
  const brands = SUEDE_BRANDS || [];
  const presetBrand = appState.inquiryBrand;
  const [brandType, setBrandType] = React.useState('Capsule Brand');
  const [brandSel, setBrandSel] = React.useState(presetBrand?.name || '');
  const [brandOpen, setBrandOpen] = React.useState(false);
  const [brandQuery, setBrandQuery] = React.useState('');
  const [nonCapsuleBrand, setNonCapsuleBrand] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [myMeasure, setMyMeasure] = React.useState<[string, string][] | null>(null);
  React.useEffect(() => {
    const sb = createClient();
    if (!sb || !user) return;
    let active = true;
    loadProfileData(sb, user.id).then(({ measurements: ms }) => {
      if (!active) return;
      setMyMeasure([
        ['Height', inchesToHeight(ms?.height_in) || '—'],
        ['Bust', inchesDisplay(ms?.bust_in) || '—'],
        ['Waist', inchesDisplay(ms?.waist_in) || '—'],
        ['Hips', inchesDisplay(ms?.hips_in) || '—'],
      ]);
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.id]);
  React.useEffect(() => { appState.inquiryBrand = null; }, []);
  const validate = () => {
    const e: string[] = [];
    const brand = brandType === 'Capsule Brand' ? brandSel : nonCapsuleBrand.trim();
    if (!brand) e.push('Select or enter a brand');
    if (!product.trim()) e.push('Add the product link and tap Fetch');
    if (!(size || otherSize.trim())) e.push('Select a size');
    if (!detail.trim()) e.push('Describe your inquiry');
    return e;
  };
  const submitInquiry = async () => {
    const e = validate();
    setErrors(e);
    if (e.length) return;
    const sb = createClient();
    if (sb && user) {
      setSaving(true);
      try {
        await createInquiry(sb, user.id, {
          brandName: brandType === 'Capsule Brand' ? brandSel : nonCapsuleBrand.trim(),
          productName: product.trim(),
          productImage: productImage.trim() || undefined,
          productUrl: productUrl.trim() || undefined,
          productPrice: productPrice.trim() || undefined,
          sizeScale: scale,
          sizeValue: size,
          sizeOther: otherSize.trim(),
          body: detail,
          hideMeasurements: hideMeasure,
          startedAt: startedRef.current,
        });
      } catch (err: any) {
        setSaving(false);
        setErrors([err?.message || 'Something went wrong posting your inquiry. Please try again.']);
        return;
      }
      setSaving(false);
    }
    setSubmitted(true);
  };
  const resetForm = () => { setSubmitted(false); setErrors([]); setProduct(''); setProductImage(''); setProductUrl(''); setProductPrice(''); setSize(''); setOtherSize(''); setDetail(''); setBrandSel(''); setNonCapsuleBrand(''); setBrandType('Capsule Brand'); };
  const chip = (active: any) => ({
    padding: '13px 0', textAlign: 'center' as any, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink-900)' : 'var(--border-default)'}`,
    background: active ? 'var(--ink-900)' : 'transparent', color: active ? 'var(--white)' : 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--dur-fast) var(--ease-out)',
  });
  if (!authed) return <SignInGate onRoute={onRoute} title="Leave an Inquiry" message="Sign in to ask the community about fit, sizing, and quality before you buy." />;
  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={30} color="var(--white)" />
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Inquiry posted</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          We'll notify you when someone who's worn it responds with fit and sizing detail.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={resetForm}>Post another</Button>
          <Button variant="primary" onClick={() => { appState.lookbookTab = 'inquiries'; onRoute('lookbook'); }}>View The Lookbook</Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '60px 24px 36px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Submit an Inquiry</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 10, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>Looking for fit intel before you buy? Post a request and get notified when someone reviews the item in your size.</p>
      </div>

      <div className="sd-form-wrap" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <CISectionCard title="Brand Information">
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
                  {brands.filter((b: any) => b.name.toLowerCase().includes(brandQuery.toLowerCase())).map((b: any) => (
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
            <Field label="Brand name" hint="Not in The Capsule yet? Enter the brand name."><Input variant="outline" maxLength={80} value={nonCapsuleBrand} onChange={(e: any) => setNonCapsuleBrand(e.target.value)} placeholder="Enter Brand name. Please try to spell it as accurately as possible." /></Field>
          )}
        </CISectionCard>

        <CISectionCard title="Product Information">
          <Field label="Paste the product link">
            <ProductFetch placeholder="https://example.com/product" onFetched={(p: any) => { setProduct(p.title || 'Product'); setProductImage(p.image || ''); setProductUrl(p.url || ''); setProductPrice(p.price || ''); }} />
          </Field>
          <Field label="Price (optional)" hint="Shown in the item's purchase details.">
            <Input variant="outline" maxLength={20} value={productPrice} onChange={(e: any) => setProductPrice(e.target.value)} placeholder="e.g. £245" />
          </Field>
        </CISectionCard>

        <CISectionCard title="What size(s) are you looking for?">
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            {['Letter', 'Numeric / Waist', 'Plus'].map(s => (
              <button key={s} type="button" onClick={() => { setScale(s); setSize(''); }} style={{ ...chip(scale === s), padding: '12px 22px' }}>{s}</button>
            ))}
          </div>
          {scale === 'Letter' && (
            <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 12 }}>
              {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
            </div>
          )}
          {scale === 'Numeric / Waist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>US dress / clothing size</div>
                <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10 }}>
                  {['00', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>Waist size (inches) — for bottoms &amp; denim</div>
                <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 10 }}>
                  {['24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
                </div>
              </div>
            </div>
          )}
          {scale === 'Plus' && (
            <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {['0X', '1X', '2X', '3X', '4X', '5X', '6X'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '22px 0 16px' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>Other / brand-specific:</div>
          <Input variant="outline" maxLength={24} value={otherSize} onChange={(e: any) => setOtherSize(e.target.value)} placeholder="e.g, 1, 2, 3..." />
        </CISectionCard>

        <CISectionCard title="Tell us more about your inquiry">
          <textarea rows={5} maxLength={500} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="e.g., Planning to wear this to a wedding — need to know if it's flattering on curvy body types!"
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{detail.length} / 500 characters</div>
        </CISectionCard>

        <CISectionCard title="Your Measurements" action={
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Hide your measurement from other users</span>
            <input type="checkbox" checked={hideMeasure} onChange={(e) => setHideMeasure(e.target.checked)} style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }} />
            <span style={{ width: 40, height: 22, borderRadius: 999, background: hideMeasure ? 'var(--ink-900)' : 'var(--ink-200)', position: 'relative', transition: 'background var(--dur-fast)' }}>
              <span style={{ position: 'absolute', top: 2, left: hideMeasure ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'var(--white)', transition: 'left var(--dur-fast)' }} />
            </span>
          </label>
        }>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, marginTop: -8 }}>Shown with your inquiry so members can match your fit. Even if hidden, they still contribute to our Suede Match calculation. Manage them in your profile.</div>
          <div className="sd-measuregrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {(myMeasure || [['Height', "5'6\""], ['Bust', '34"'], ['Waist', '26"'], ['Hips', '36"']]).map(([k, v]) => (
              <div key={k} style={{ background: 'var(--linen)', padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-primary)', marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
          {myMeasure && myMeasure.every(([, v]) => v === '—') && (
            <button type="button" onClick={() => onRoute('editprofile')} style={{ marginTop: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Add your measurements to improve fit matching</button>
          )}
        </CISectionCard>

        {errors.length > 0 && (
          <div role="alert" style={{ background: 'var(--white)', border: '1px solid var(--rating-critical)', borderRadius: 'var(--radius-xs)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--rating-critical)', marginBottom: 8 }}>
              <Icon name="info" size={16} color="var(--rating-critical)" /> Please complete the following before submitting:
            </div>
            <ul style={{ margin: 0, paddingLeft: 26, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
              {errors.map((e) => <li key={e} style={{ marginTop: 4 }}>{e}</li>)}
            </ul>
          </div>
        )}
        <Button variant="primary" fullWidth size="lg" disabled={saving} onClick={submitInquiry}>{saving ? 'Posting…' : 'Submit Inquiry'}</Button>
      </div>
    </div>
  );
}
