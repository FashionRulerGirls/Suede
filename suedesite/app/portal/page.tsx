'use client';
import React from 'react';
import { Logo, Icon } from '@/components/ds';
import { createClient } from '@/lib/supabase/client';
import { loadMyBrands, loadBrandOverview, saveBrandFields, submitContentFlag, loadBrandDocuments, addBrandDocument, deleteBrandDocument, type PortalBrand } from '@/lib/portalData';
import { loadBrandReviews, loadBrandInquiries, postReviewComment, postInquiryResponse } from '@/lib/contentData';

type Gate = 'checking' | 'anon' | 'nobrand' | 'ok';
type Section = 'dashboard' | 'edit' | 'reviews' | 'inquiries';
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const FLAG_REASONS = ['Inaccurate information', 'Not our brand', 'Inappropriate content', 'Spam', 'Other'];

export default function PortalPage() {
  const sb = React.useMemo(() => createClient(), []);
  const [gate, setGate] = React.useState<Gate>('checking');
  const [uid, setUid] = React.useState('');
  const [brands, setBrands] = React.useState<PortalBrand[]>([]);
  const [active, setActive] = React.useState(0);
  const [section, setSection] = React.useState<Section>('dashboard');

  const check = React.useCallback(async () => {
    if (!sb) { setGate('anon'); return; }
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setGate('anon'); return; }
    setUid(user.id);
    const mine = await loadMyBrands(sb, user.id);
    setBrands(mine);
    setGate(mine.length ? 'ok' : 'nobrand');
  }, [sb]);
  React.useEffect(() => { check(); }, [check]);

  if (gate === 'checking') return <Shell><Center>Checking access…</Center></Shell>;
  if (gate === 'anon') return <SignIn sb={sb} onDone={check} />;
  if (gate === 'nobrand') return (
    <Shell><Center>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.6 }}>This account isn’t linked to a brand yet. Claim your brand and we’ll hand over the page once it’s verified.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <a href="/?claim=1" style={btnPrimary}>Claim your brand</a>
        <button onClick={() => sb?.auth.signOut().then(check)} style={btnGhost}>Sign out</button>
      </div>
    </Center></Shell>
  );

  const brand = brands[active];
  const nav: [Section, string, string][] = [
    ['dashboard', 'Dashboard', 'grid'],
    ['edit', 'Brand Page', 'pen'],
    ['reviews', 'Reviews', 'reviews'],
    ['inquiries', 'Inquiries', 'message'],
  ];
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'grid', gridTemplateColumns: '250px 1fr', fontFamily: 'var(--font-body)' }}>
      <aside style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--surface-card)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 16px' }}>
          <Logo variant="monogram" height={26} /><span style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brand Portal</span>
        </div>
        {brands.length > 1 && (
          <select value={active} onChange={(e) => { setActive(Number(e.target.value)); }} style={{ margin: '0 6px 12px', padding: '8px 10px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            {brands.map((b, i) => <option key={b.id} value={i}>{b.name}</option>)}
          </select>
        )}
        {brands.length === 1 && <div style={{ padding: '0 12px 12px', fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-heading)' }}>{brand.name}</div>}
        {nav.map(([id, label, ic]) => (
          <button key={id} onClick={() => setSection(id)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: 'none', cursor: 'pointer', textAlign: 'left', background: section === id ? 'var(--linen)' : 'transparent', color: section === id ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            <Icon name={ic} size={16} color={section === id ? 'var(--text-primary)' : 'var(--text-muted)'} />{label}
          </button>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <button onClick={() => sb?.auth.signOut().then(check)} style={{ ...btnGhost, width: '100%' }}>Sign out</button>
        </div>
      </aside>
      <main style={{ padding: '32px 40px', minWidth: 0 }}>
        {section === 'dashboard' && <Dashboard sb={sb} brand={brand} />}
        {section === 'edit' && <EditPage sb={sb} brand={brand} uid={uid} onSaved={check} />}
        {section === 'reviews' && <ContentList sb={sb} brand={brand} uid={uid} kind="reviews" />}
        {section === 'inquiries' && <ContentList sb={sb} brand={brand} uid={uid} kind="inquiries" />}
      </main>
    </div>
  );
}

// ── sign in ─────────────────────────────────────────────────────────
function SignIn({ sb, onDone }: any) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const submit = async () => {
    if (!sb) { setErr('Sign-in is unavailable.'); return; }
    setBusy(true); setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setErr(error.message || 'Could not sign in.'); return; }
    onDone();
  };
  return (
    <Shell><div style={{ width: 'min(400px, 100%)', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}><Logo variant="monogram" height={44} /></div>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-heading)', marginBottom: 4 }}>Brand Portal</div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>Sign in with your Suede account.</p>
        <input placeholder="you@brand.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} style={{ ...inp, marginTop: 12 }} />
        {err && <div style={{ color: 'var(--rating-critical)', fontSize: 13, marginTop: 10 }}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{ ...btnPrimary, width: '100%', marginTop: 16, opacity: busy ? 0.6 : 1 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: 'var(--text-muted)' }}>New here? <a href="/?claim=1" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Claim your brand</a></div>
      </div>
    </div></Shell>
  );
}

// ── dashboard ───────────────────────────────────────────────────────
function Dashboard({ sb, brand }: any) {
  const [o, setO] = React.useState<any>(null);
  React.useEffect(() => { let a = true; loadBrandOverview(sb, brand).then((d) => a && setO(d)).catch(() => {}); return () => { a = false; }; }, [sb, brand.id]);
  return (
    <>
      <Head title={brand.name} sub={brand.tagline || 'Your brand at a glance.'} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
        <Stat label="Reviews" value={o ? o.reviews : '…'} />
        <Stat label="Inquiries" value={o ? o.inquiries : '…'} />
        <Stat label="Avg. rating" value={o ? (o.avgRating != null ? `${o.avgRating} ★` : '—') : '…'} />
        <Stat label="Followers" value={o ? o.followers : '…'} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>Head to Reviews or Inquiries to respond to shoppers or flag anything that needs our team’s attention.</p>
    </>
  );
}

// ── edit brand page ─────────────────────────────────────────────────
function EditPage({ sb, brand, uid, onSaved }: any) {
  const blank = () => ({ tagline: brand.tagline, longBio: brand.longBio, website: brand.website, instagram: brand.instagram, category: brand.category, location: brand.location, founder: brand.founder });
  const [f, setF] = React.useState(blank);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => { setF(blank()); setSaved(false); }, [brand.id]);
  const save = async () => { setBusy(true); setSaved(false); try { await saveBrandFields(sb, brand.id, f); setSaved(true); onSaved?.(); } catch { /* ignore */ } setBusy(false); };
  const field = (key: keyof typeof f, label: string, ta?: boolean, hint?: string) => (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</span>
      {ta
        ? <textarea rows={key === 'longBio' ? 6 : 3} value={f[key]} onChange={(e) => { setF({ ...f, [key]: e.target.value }); setSaved(false); }} style={{ ...inp, resize: 'vertical' }} />
        : <input value={f[key]} onChange={(e) => { setF({ ...f, [key]: e.target.value }); setSaved(false); }} style={inp} />}
      {hint && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginTop: 5 }}>{hint}</span>}
    </label>
  );
  return (
    <>
      <Head title="Brand Page" sub="Update how your brand appears across Suede." />
      <div style={{ maxWidth: 560, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 28 }}>
        {field('tagline', 'Tagline', true, 'One line — shown under your name.')}
        {field('longBio', 'Long bio', true, 'The full story, shown on the back of your brand card.')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('website', 'Website')}{field('instagram', 'Instagram')}
          {field('category', 'Category')}{field('location', 'Location')}
        </div>
        {field('founder', 'Founder')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <button onClick={save} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Saving…' : 'Save changes'}</button>
          {saved && <span style={{ fontSize: 13, color: 'var(--rating-positive)' }}>Saved ✓</span>}
        </div>
      </div>

      <div style={{ marginTop: 28 }}><Documents sb={sb} brand={brand} uid={uid} /></div>
    </>
  );
}

function Documents({ sb, brand, uid }: any) {
  const [docs, setDocs] = React.useState<any[] | null>(null);
  const [label, setLabel] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);
  const load = React.useCallback(() => { loadBrandDocuments(sb, brand.id).then(setDocs).catch(() => setDocs([])); }, [sb, brand.id]);
  React.useEffect(() => { setDocs(null); load(); }, [load]);
  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true); setErr('');
    try { await addBrandDocument(sb, uid, brand.id, label, file); setLabel(''); if (fileRef.current) fileRef.current.value = ''; load(); }
    catch (e: any) { setErr(e?.message || 'Upload failed. (Is the brand-assets bucket set up?)'); }
    setBusy(false);
  };
  const del = async (id: string) => { setBusy(true); try { await deleteBrandDocument(sb, id); load(); } catch { /* ignore */ } setBusy(false); };
  return (
    <div style={{ maxWidth: 560, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 28 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', marginBottom: 4 }}>Documents</div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 18px' }}>Size guide, return policy, shipping, lookbook, sustainability — shown on the back of your brand card.</p>
      {docs === null ? <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading…</div>
        : docs.length === 0 ? <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>No documents yet.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
            {docs.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14.5, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>{d.label}</a>
                <button onClick={() => del(d.id)} style={{ ...btnGhostSm, color: 'var(--rating-critical)' }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Size Guide)" style={{ ...inp, flex: '1 1 180px' }} />
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={(e) => upload(e.target.files?.[0])} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Uploading…' : 'Upload file'}</button>
      </div>
      {err && <div style={{ color: 'var(--rating-critical)', fontSize: 13, marginTop: 10 }}>{err}</div>}
    </div>
  );
}

// ── reviews / inquiries with respond + flag ─────────────────────────
function ContentList({ sb, brand, uid, kind }: any) {
  const [rows, setRows] = React.useState<any[] | null>(null);
  const load = React.useCallback(() => {
    const fn = kind === 'reviews' ? loadBrandReviews : loadBrandInquiries;
    fn(sb, brand.name, uid, brand.id).then(setRows).catch(() => setRows([]));
  }, [sb, brand.id, brand.name, uid, kind]);
  React.useEffect(() => { setRows(null); load(); }, [load]);
  const [flagFor, setFlagFor] = React.useState<any>(null);
  if (!rows) return <><Head title={kind === 'reviews' ? 'Reviews' : 'Inquiries'} /><Center>Loading…</Center></>;
  return (
    <>
      <Head title={kind === 'reviews' ? 'Reviews' : 'Inquiries'} sub={`What shoppers are saying about ${brand.name}.`} />
      {!rows.length ? <Center>Nothing here yet.</Center> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r: any) => (
            <ContentCard key={r._id} item={r} kind={kind} sb={sb} uid={uid} onFlag={() => setFlagFor(r)} />
          ))}
        </div>
      )}
      {flagFor && <FlagModal item={flagFor} kind={kind} sb={sb} uid={uid} onClose={() => setFlagFor(null)} />}
    </>
  );
}

function ContentCard({ item, kind, sb, uid, onFlag }: any) {
  const [reply, setReply] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const send = async () => {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      if (kind === 'reviews') await postReviewComment(sb, uid, item._id, reply.trim());
      else await postInquiryResponse(sb, uid, item._id, reply.trim());
      setReply(''); setOpen(false); setDone(true);
    } catch { /* ignore */ }
    setBusy(false);
  };
  const who = kind === 'reviews' ? item.reviewer?.name : item.asker?.name;
  const text = kind === 'reviews' ? item.excerpt : item.question;
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <b style={{ color: 'var(--text-primary)' }}>{item.product || 'Item'}</b>
            {kind === 'reviews' && item.rating != null && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.rating} ★</span>}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {who || 'Member'}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '10px 0 0' }}>{text}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 'none' }}>
          <button onClick={() => setOpen((o) => !o)} style={btnGhostSm}>{done ? 'Replied' : 'Respond'}</button>
          <button onClick={onFlag} style={btnGhostSm}>Flag</button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply as ${item.brand || 'your brand'}…`} style={{ ...inp, resize: 'vertical' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button onClick={() => setOpen(false)} style={btnGhostSm}>Cancel</button>
            <button onClick={send} disabled={busy || !reply.trim()} style={{ ...btnPrimary, opacity: busy || !reply.trim() ? 0.6 : 1 }}>{busy ? 'Posting…' : 'Post reply'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlagModal({ item, kind, sb, uid, onClose }: any) {
  const [reason, setReason] = React.useState(FLAG_REASONS[0]);
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const submit = async () => {
    setBusy(true);
    try { await submitContentFlag(sb, { entityType: kind === 'reviews' ? 'review' : 'inquiry', entityId: item._id, reason, note, raisedBy: uid }); onClose(true); }
    catch { setBusy(false); }
  };
  return (
    <div onClick={() => onClose()} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20,18,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)', width: 'min(440px,100%)', padding: 26 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', marginBottom: 6 }}>Flag for review</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 18px' }}>Our team will take a look. Content isn’t removed automatically.</p>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Reason</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)} style={inp}>{FLAG_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add detail (optional)" style={{ ...inp, marginTop: 12, resize: 'vertical' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button onClick={() => onClose()} style={btnGhostSm}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Submitting…' : 'Submit flag'}</button>
        </div>
      </div>
    </div>
  );
}

// ── shared ──────────────────────────────────────────────────────────
function Shell({ children }: any) { return <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-body)' }}>{children}</div>; }
function Center({ children }: any) { return <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: 'var(--text-secondary)', fontSize: 15 }}>{children}</div>; }
function Head({ title, sub }: any) { return <div style={{ marginBottom: 24 }}><h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 28, color: 'var(--text-heading)', margin: 0 }}>{title}</h1>{sub && <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '6px 0 0' }}>{sub}</p>}</div>; }
function Stat({ label, value }: any) { return <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: 20 }}><div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--text-heading)' }}>{value}</div><div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8 }}>{label}</div></div>; }

const inp: any = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, background: 'var(--surface-card)', color: 'var(--text-primary)' };
const btnPrimary: any = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ink-900)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-xs)', padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, textDecoration: 'none' };
const btnGhost: any = { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14 };
const btnGhostSm: any = { ...btnGhost, padding: '7px 13px', fontSize: 13, whiteSpace: 'nowrap' };
