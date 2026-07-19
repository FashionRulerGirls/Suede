'use client';
import React from 'react';
import { Logo, Icon } from '@/components/ds';
import { createClient } from '@/lib/supabase/client';
import {
  amIAdmin, loadOverview, loadGrowth, loadReviewActivity, loadInquiryActivity,
  loadMemberDirectory, toCSV, downloadCSV, type Overview,
} from '@/lib/adminData';
import {
  loadCapsuleRequests, approveCapsuleRequest, rejectCapsuleRequest,
  loadApplications, markApplicationReviewed, loadFeedback, markFeedbackReviewed,
  loadCapsuleBrands, loadNonCapsuleBrands, updateBrand, removeFromCapsule,
  promoteBrandByName, flagBrandName,
  loadFlagForReview, mergeBrandName, correctBrandName, dismissBrandFlag,
  loadContentFlags, resolveContentFlag,
} from '@/lib/adminActions';

type Gate = 'checking' | 'anon' | 'denied' | 'ok';
type Section = 'overview' | 'growth' | 'reviews' | 'inquiries' | 'brands' | 'requests' | 'applications' | 'flags' | 'feedback' | 'members' | 'export';

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function AdminPage() {
  const [gate, setGate] = React.useState<Gate>('checking');
  const [section, setSection] = React.useState<Section>('overview');
  const [adminId, setAdminId] = React.useState<string>('');
  const sb = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!sb) { if (active) setGate('anon'); return; }
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { if (active) setGate('anon'); return; }
      const ok = await amIAdmin(sb);
      if (active) { setAdminId(user.id); setGate(ok ? 'ok' : 'denied'); }
    })();
    return () => { active = false; };
  }, [sb]);

  if (gate !== 'ok') return <GateScreen gate={gate} />;

  const nav: [Section, string, string][] = [
    ['overview', 'Overview', 'grid'],
    ['growth', 'Growth', 'sparkle'],
    ['reviews', 'Review Activity', 'reviews'],
    ['inquiries', 'Inquiry Activity', 'message'],
    ['brands', 'Brand Management', 'shirt'],
    ['requests', 'Capsule Requests', 'plus'],
    ['applications', 'Applications', 'inbox'],
    ['flags', 'Brand Flags', 'eye-off'],
    ['feedback', 'Platform Feedback', 'message'],
    ['members', 'Member Directory', 'user'],
    ['export', 'Data Export', 'upload'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'grid', gridTemplateColumns: '240px 1fr', fontFamily: 'var(--font-body)' }}>
      <aside style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--surface-card)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 20px' }}>
          <Logo variant="monogram" height={26} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Admin</span>
        </div>
        {nav.map(([id, label, ic]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: 'none', cursor: 'pointer', textAlign: 'left',
            background: section === id ? 'var(--linen)' : 'transparent', color: section === id ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', fontSize: 14,
          }}>
            <Icon name={ic} size={16} color={section === id ? 'var(--text-primary)' : 'var(--text-muted)'} />{label}
          </button>
        ))}
      </aside>
      <main style={{ padding: '32px 40px', minWidth: 0 }}>
        {section === 'overview' && <OverviewSection sb={sb!} />}
        {section === 'growth' && <GrowthSection sb={sb!} />}
        {section === 'reviews' && <ReviewsSection sb={sb!} />}
        {section === 'inquiries' && <InquiriesSection sb={sb!} />}
        {section === 'brands' && <BrandsSection sb={sb!} adminId={adminId} />}
        {section === 'requests' && <RequestsSection sb={sb!} />}
        {section === 'applications' && <ApplicationsSection sb={sb!} adminId={adminId} />}
        {section === 'flags' && <ContentFlagsSection sb={sb!} adminId={adminId} />}
        {section === 'feedback' && <FeedbackSection sb={sb!} />}
        {section === 'members' && <MembersSection sb={sb!} />}
        {section === 'export' && <ExportSection sb={sb!} />}
      </main>
    </div>
  );
}

function GateScreen({ gate }: { gate: Gate }) {
  const msg = gate === 'checking' ? 'Checking access…'
    : gate === 'anon' ? 'Sign in to Suede as an admin to view this dashboard.'
    : 'This account is not an administrator.';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5', fontFamily: 'var(--font-body)', padding: 24 }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Logo variant="monogram" height={44} />
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-heading)' }}>SUEDE Admin</div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6, margin: 0 }}>{msg}</p>
        {gate !== 'checking' && <a href="/" style={{ fontSize: 14, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>← Back to Suede</a>}
      </div>
    </div>
  );
}

// ── shared bits ─────────────────────────────────────────────────────
function H({ children, sub }: any) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 28, color: 'var(--text-heading)', margin: 0 }}>{children}</h1>
      {sub && <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '6px 0 0' }}>{sub}</p>}
    </div>
  );
}
function Card({ children, style }: any) {
  return <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: 20, ...style }}>{children}</div>;
}
function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1, color: 'var(--text-heading)' }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.4 }}>{label}</div>
    </Card>
  );
}
const grid = (min = 180) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 14 });
const th: any = { textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, background: 'var(--surface-card)' };
const td: any = { fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', padding: '11px 14px', borderBottom: '1px solid var(--border-subtle)' };

function useAsync<T>(fn: () => Promise<T>, deps: any[]): [T | null, boolean] {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let active = true; setLoading(true);
    fn().then((d) => { if (active) { setData(d); setLoading(false); } }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [data, loading];
}

// ── sections ────────────────────────────────────────────────────────
function OverviewSection({ sb }: any) {
  const [o] = useAsync<Overview>(() => loadOverview(sb), []);
  if (!o) return <><H>Overview</H><Muted>Loading…</Muted></>;
  return (
    <>
      <H sub="Platform activity at a glance.">Overview</H>
      <SubH>Members</SubH>
      <div style={grid()}>
        <Stat label="Total members" value={o.members} />
        <Stat label="New this week" value={o.newWeek} />
        <Stat label="New this month" value={o.newMonth} />
        <Stat label="Complete profiles" value={o.complete} />
        <Stat label="Incomplete profiles" value={o.incomplete} />
        <Stat label="Avg. time to complete profile" value={o.avgProfileComplete} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Card>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>Measurement entry</div>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>
            <span>Consultation <b>{o.source.consultation}</b></span>
            <span>Quiz <b>{o.source.quiz}</b></span>
            <span>Self-input <b>{o.source.selfInput}</b></span>
          </div>
        </Card>
      </div>

      <SubH>Content</SubH>
      <div style={grid()}>
        <Stat label="Total reviews" value={o.reviews} />
        <Stat label="Total inquiries" value={o.inquiries} />
        <Stat label="Avg. time to first review" value={o.avgFirstReview} />
        <Stat label="Avg. time to first inquiry" value={o.avgFirstInquiry} />
        <Stat label="Avg. time to complete a review" value={o.avgCompleteReview} />
        <Stat label="Avg. time to complete an inquiry" value={o.avgCompleteInquiry} />
      </div>

      <SubH>Directory &amp; inbound</SubH>
      <div style={grid()}>
        <Stat label="Capsule requests pending" value={o.suggestionsPending} />
        <Stat label="Platform feedback (total)" value={o.feedbackTotal} />
        <Stat label="Capsule applications (new)" value={o.applicationsNew} />
        <Stat label="Open flags" value={o.flagsOpen} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 18 }}>Timing metrics accrue from launch — tiles read “—” until enough submissions carry the new start/complete timestamps.</p>
    </>
  );
}

function GrowthSection({ sb }: any) {
  const [gran, setGran] = React.useState<'week' | 'month'>('month');
  const [data] = useAsync(() => loadGrowth(sb, gran), [gran]);
  const rows = data || [];
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <>
      <H sub="Member signups over time.">Growth</H>
      <div style={{ display: 'inline-flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: 20 }}>
        {(['week', 'month'] as const).map((g) => (
          <button key={g} onClick={() => setGran(g)} style={{ padding: '8px 18px', border: 'none', cursor: 'pointer', background: gran === g ? 'var(--ink-900)' : 'var(--surface-card)', color: gran === g ? 'var(--white)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 13, textTransform: 'capitalize' }}>{g}ly</button>
        ))}
      </div>
      <Card>
        {!rows.length ? <Muted>No signups yet.</Muted> : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 240, overflowX: 'auto', paddingBottom: 4 }}>
            {rows.map((r) => (
              <div key={r.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 'none', width: 42 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.count}</span>
                <div style={{ width: 22, height: Math.round((r.count / max) * 190), background: 'var(--ink-900)', borderRadius: 2 }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: 6 }}>{r.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function ReviewsSection({ sb }: any) {
  const [rows] = useAsync(() => loadReviewActivity(sb), []);
  return (
    <>
      <H sub="All reviews, newest first. Read-only.">Review Activity</H>
      <Table head={['Reviewer', 'Brand', 'Date', 'Rating']} rows={(rows || []).map((r: any) => [
        <span><b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.reviewer}</b> <span style={{ color: 'var(--text-muted)' }}>{r.handle}</span></span>,
        r.brand, fmtDate(r.created_at), r.rating != null ? `${r.rating} ★` : '—',
      ])} loading={!rows} empty="No reviews yet." />
    </>
  );
}

function InquiriesSection({ sb }: any) {
  const [rows] = useAsync(() => loadInquiryActivity(sb), []);
  return (
    <>
      <H sub="All inquiries, newest first. Read-only.">Inquiry Activity</H>
      <Table head={['Member', 'Brand', 'Date', 'Responses']} rows={(rows || []).map((r: any) => [
        <span><b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.member}</b> <span style={{ color: 'var(--text-muted)' }}>{r.handle}</span></span>,
        r.brand, fmtDate(r.created_at), r.responses,
      ])} loading={!rows} empty="No inquiries yet." />
    </>
  );
}

function MembersSection({ sb }: any) {
  const [rows] = useAsync(() => loadMemberDirectory(sb), []);
  return (
    <>
      <H sub="All registered members. Read-only.">Member Directory</H>
      <Table head={['Member', 'Email', 'Joined', 'Profile', 'Reviews', 'Inquiries']} rows={(rows || []).map((r: any) => [
        <span><b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</b> <span style={{ color: 'var(--text-muted)' }}>{r.handle}</span></span>,
        r.email || '—', fmtDate(r.created_at), r.complete ? 'Complete' : 'Incomplete', r.reviews, r.inquiries,
      ])} loading={!rows} empty="No members yet." />
    </>
  );
}

function ExportSection({ sb }: any) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const run = async (key: string, fn: () => Promise<{ name: string; csv: string }>) => {
    setBusy(key);
    try { const { name, csv } = await fn(); downloadCSV(name, csv); } catch { /* ignore */ }
    setBusy(null);
  };
  const exports: [string, string, () => Promise<{ name: string; csv: string }>][] = [
    ['members', 'Members', async () => {
      const m = await loadMemberDirectory(sb, 100000);
      return { name: 'suede-members.csv', csv: toCSV(['handle', 'name', 'email', 'joined', 'profile_complete', 'reviews', 'inquiries'], m.map((r: any) => [r.handle, r.name, r.email, r.created_at, r.complete ? 'Y' : 'N', r.reviews, r.inquiries])) };
    }],
    ['reviews', 'Reviews', async () => {
      const r = await loadReviewActivity(sb, 100000);
      return { name: 'suede-reviews.csv', csv: toCSV(['reviewer', 'handle', 'brand', 'date', 'rating'], r.map((x: any) => [x.reviewer, x.handle, x.brand, x.created_at, x.rating ?? ''])) };
    }],
    ['inquiries', 'Inquiries', async () => {
      const q = await loadInquiryActivity(sb, 100000);
      return { name: 'suede-inquiries.csv', csv: toCSV(['member', 'handle', 'brand', 'date', 'responses'], q.map((x: any) => [x.member, x.handle, x.brand, x.created_at, x.responses])) };
    }],
    ['suggestions', 'Brand suggestions', async () => {
      const { data } = await sb.from('brand_suggestions').select('name, url, why, status, created_at, author:profiles!submitted_by(username)').order('created_at', { ascending: false });
      return { name: 'suede-brand-suggestions.csv', csv: toCSV(['brand', 'url', 'why', 'submitted_by', 'date', 'status'], (data || []).map((x: any) => [x.name, x.url, x.why, x.author?.username ? '@' + x.author.username : '', x.created_at, x.status])) };
    }],
    ['feedback', 'Platform feedback', async () => {
      const { data } = await sb.from('feedback').select('message, email, created_at').order('created_at', { ascending: false });
      return { name: 'suede-feedback.csv', csv: toCSV(['message', 'email', 'date'], (data || []).map((x: any) => [x.message, x.email, x.created_at])) };
    }],
    ['applications', 'Capsule applications', async () => {
      const { data } = await sb.from('brand_applications').select('brand_name, website, email, ownership, founding_year, pitch, status, created_at').order('created_at', { ascending: false });
      return { name: 'suede-applications.csv', csv: toCSV(['brand', 'website', 'email', 'role', 'founding_year', 'why', 'status', 'date'], (data || []).map((x: any) => [x.brand_name, x.website, x.email, x.ownership, x.founding_year, x.pitch, x.status, x.created_at])) };
    }],
  ];
  return (
    <>
      <H sub="Full-table CSV downloads. No date filtering in v1.">Data Export</H>
      <div style={grid(220)}>
        {exports.map(([key, label, fn]) => (
          <Card key={key}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', marginBottom: 12 }}>{label}</div>
            <button onClick={() => run(key, fn)} disabled={busy === key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ink-900)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-xs)', padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, opacity: busy === key ? 0.6 : 1 }}>
              <Icon name="upload" size={14} color="var(--white)" />{busy === key ? 'Exporting…' : 'Export CSV'}
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}

// ── Phase 2: action queues ──────────────────────────────────────────
function ActionBtn({ children, onClick, busy, ghost, danger }: any) {
  return (
    <button onClick={onClick} disabled={busy} style={{
      border: ghost || danger ? '1px solid var(--border-default)' : 'none', cursor: 'pointer',
      background: ghost || danger ? 'transparent' : 'var(--ink-900)',
      color: danger ? 'var(--rating-critical)' : ghost ? 'var(--text-secondary)' : 'var(--white)',
      borderRadius: 'var(--radius-xs)', padding: '7px 14px', fontFamily: 'var(--font-body)', fontSize: 13, opacity: busy ? 0.6 : 1, whiteSpace: 'nowrap',
    }}>{busy ? '…' : children}</button>
  );
}
function Pill({ ok, children }: any) {
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, background: ok ? 'var(--linen)' : 'var(--ink-900)', color: ok ? 'var(--text-muted)' : 'var(--white)' }}>{children}</span>;
}
function useReload(): [number, () => void] {
  const [k, bump] = React.useReducer((x: number) => x + 1, 0);
  return [k, bump];
}

function RequestsSection({ sb }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadCapsuleRequests(sb), [k]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const act = async (id: string, fn: () => Promise<void>) => { setBusy(id); try { await fn(); bump(); } catch { /* ignore */ } setBusy(null); };
  return (
    <>
      <H sub="Members' requests to add a brand to The Capsule.">Capsule Requests</H>
      <Table head={['Suggested brand', 'Submitted by', 'Date', 'Actions']} rows={(rows || []).map((r: any) => [
        <span><b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</b>{r.url && <> · <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>site</a></>}</span>,
        r.by, fmtDate(r.created_at),
        <span style={{ display: 'flex', gap: 8 }}>
          <ActionBtn busy={busy === r.id} onClick={() => act(r.id, () => approveCapsuleRequest(sb, r.id, r.name, r.url))}>Approve</ActionBtn>
          <ActionBtn ghost busy={busy === r.id} onClick={() => act(r.id, () => rejectCapsuleRequest(sb, r.id))}>Reject</ActionBtn>
        </span>,
      ])} loading={!rows} empty="No pending requests." />
    </>
  );
}

function ApplicationsSection({ sb, adminId }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadApplications(sb), [k]);
  const [open, setOpen] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const mark = async (id: string) => { setBusy(id); try { await markApplicationReviewed(sb, id, adminId); bump(); } catch { /* ignore */ } setBusy(null); };
  if (!rows) return <><H>Applications</H><Muted>Loading…</Muted></>;
  return (
    <>
      <H sub="Structured applications to join The Capsule.">Applications</H>
      {!rows.length ? <Muted>No applications yet.</Muted> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((a: any) => (
            <Card key={a.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-heading)' }}>{a.brand}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{a.email} · {fmtDate(a.created_at)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Pill ok={a.status === 'Reviewed'}>{a.status}</Pill>
                  <button onClick={() => setOpen(open === a.id ? null : a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'underline' }}>{open === a.id ? 'Hide' : 'Detail'}</button>
                  {a.status !== 'Reviewed' && <ActionBtn busy={busy === a.id} onClick={() => mark(a.id)}>Mark reviewed</ActionBtn>}
                </div>
              </div>
              {open === a.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, fontSize: 13.5 }}>
                  <Detail label="Role" value={a.role} />
                  <Detail label="Founding year" value={a.foundingYear} />
                  <Detail label="Website" value={a.website} link />
                  <div style={{ gridColumn: '1 / -1' }}><Detail label="Why The Capsule" value={a.why} /></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
function Detail({ label, value, link }: any) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {link && value ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>{value}</a>
        : <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value || '—'}</div>}
    </div>
  );
}

function FeedbackSection({ sb }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadFeedback(sb), [k]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const mark = async (id: string) => { setBusy(id); try { await markFeedbackReviewed(sb, id); bump(); } catch { /* ignore */ } setBusy(null); };
  if (!rows) return <><H>Platform Feedback</H><Muted>Loading…</Muted></>;
  return (
    <>
      <H sub="Improvement ideas submitted from across the site.">Platform Feedback</H>
      {!rows.length ? <Muted>No feedback yet.</Muted> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((f: any) => (
            <Card key={f.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>{f.message}</p>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8 }}>{f.by} · {fmtDate(f.created_at)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
                  <Pill ok={f.status === 'Reviewed'}>{f.status}</Pill>
                  {f.status !== 'Reviewed' && <ActionBtn busy={busy === f.id} onClick={() => mark(f.id)}>Mark reviewed</ActionBtn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function BrandsSection({ sb, adminId }: any) {
  const [tab, setTab] = React.useState<'capsule' | 'noncap' | 'flag'>('capsule');
  return (
    <>
      <H sub="The brand directory.">Brand Management</H>
      <div style={{ display: 'inline-flex', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: 20 }}>
        {([['capsule', 'Capsule'], ['noncap', 'Non-Capsule'], ['flag', 'Flag for Review']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '8px 18px', border: 'none', cursor: 'pointer', background: tab === id ? 'var(--ink-900)' : 'var(--surface-card)', color: tab === id ? 'var(--white)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 13 }}>{label}</button>
        ))}
      </div>
      {tab === 'capsule' ? <CapsuleBrands sb={sb} /> : tab === 'noncap' ? <NonCapsuleBrands sb={sb} adminId={adminId} /> : <FlagForReview sb={sb} adminId={adminId} />}
    </>
  );
}

function FlagForReview({ sb, adminId }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadFlagForReview(sb), [k]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const act = async (name: string, fn: () => Promise<void>) => { setBusy(name); try { await fn(); bump(); } catch { /* ignore */ } setBusy(null); };
  const correct = async (name: string) => { const v = window.prompt(`Correct name for "${name}":`, name); if (v && v.trim() && v.trim() !== name) await act(name, () => correctBrandName(sb, name, v.trim())); };
  const reasonColor: any = { duplicate: 'var(--denim)', misspelling: 'var(--denim)', junk: 'var(--rating-critical)' };
  if (!rows) return <Muted>Scanning brand names…</Muted>;
  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8, marginBottom: 16 }}>Advisory — likely duplicate, misspelled, or junk brand entries. Nothing changes without your action.</p>
      {!rows.length ? <Muted>No brand-name issues detected. 🎉</Muted> : (
        <Table head={['Brand', 'Reviews', 'Reason', 'Suggestion', 'Actions']} rows={rows.map((r: any) => [
          <b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</b>, r.reviews,
          <span style={{ color: reasonColor[r.reason] || 'var(--text-muted)', textTransform: 'capitalize' }}>{r.reason}</span>,
          r.suggestion || '—',
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {r.suggestion && <ActionBtn busy={busy === r.name} onClick={() => act(r.name, () => mergeBrandName(sb, r.name, r.suggestion))}>Merge → {r.suggestion}</ActionBtn>}
            <ActionBtn ghost busy={busy === r.name} onClick={() => correct(r.name)}>Correct</ActionBtn>
            <ActionBtn ghost busy={busy === r.name} onClick={() => act(r.name, () => dismissBrandFlag(sb, r.name, adminId))}>Dismiss</ActionBtn>
          </span>,
        ])} loading={false} empty="" />
      )}
    </>
  );
}

function ContentFlagsSection({ sb, adminId }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadContentFlags(sb), [k]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const act = async (id: string, fn: () => Promise<void>) => { setBusy(id); try { await fn(); bump(); } catch { /* ignore */ } setBusy(null); };
  return (
    <>
      <H sub="Reviews & inquiries flagged by brands for attention.">Brand Flags</H>
      <Table head={['Type', 'Reason', 'Detail', 'Date', 'Actions']} rows={(rows || []).map((f: any) => [
        <span style={{ textTransform: 'capitalize' }}>{f.type}</span>, f.reason || '—', f.detail || '—', fmtDate(f.created_at),
        <span style={{ display: 'flex', gap: 8 }}>
          <ActionBtn danger busy={busy === f.id} onClick={() => act(f.id, () => resolveContentFlag(sb, f.id, adminId, 'remove', f.type, f.entityId))}>Remove content</ActionBtn>
          <ActionBtn ghost busy={busy === f.id} onClick={() => act(f.id, () => resolveContentFlag(sb, f.id, adminId, 'dismiss'))}>Dismiss</ActionBtn>
        </span>,
      ])} loading={!rows} empty="No open brand flags. (Brand-side flag submission is not built yet.)" />
    </>
  );
}

function CapsuleBrands({ sb }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadCapsuleBrands(sb), [k]);
  const [edit, setEdit] = React.useState<any>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const save = async () => { setBusy(edit.id); try { await updateBrand(sb, edit.id, { name: edit.name, slug: edit.slug, website: edit.website, instagram: edit.instagram }); setEdit(null); bump(); } catch { /* ignore */ } setBusy(null); };
  const remove = async (id: string) => { setBusy(id); try { await removeFromCapsule(sb, id); bump(); } catch { /* ignore */ } setBusy(null); };
  return (
    <>
      <Table head={['Brand', 'Slug', 'Actions']} rows={(rows || []).map((b: any) => [
        <b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.name}</b>, b.slug,
        <span style={{ display: 'flex', gap: 8 }}>
          <ActionBtn ghost onClick={() => setEdit({ ...b })}>Edit</ActionBtn>
          <ActionBtn danger busy={busy === b.id} onClick={() => remove(b.id)}>Remove</ActionBtn>
        </span>,
      ])} loading={!rows} empty="No Capsule brands." />
      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20,18,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)', width: 'min(460px,100%)', padding: 26, borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', marginBottom: 18 }}>Edit brand</div>
            {[['name', 'Brand name'], ['slug', 'Slug'], ['website', 'Website URL'], ['instagram', 'Instagram handle']].map(([key, label]) => (
              <label key={key} style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{label}</span>
                <input value={edit[key] || ''} onChange={(e) => setEdit({ ...edit, [key]: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14 }} />
              </label>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <ActionBtn ghost onClick={() => setEdit(null)}>Cancel</ActionBtn>
              <ActionBtn busy={busy === edit.id} onClick={save}>Save</ActionBtn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NonCapsuleBrands({ sb, adminId }: any) {
  const [k, bump] = useReload();
  const [rows] = useAsync(() => loadNonCapsuleBrands(sb), [k]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const act = async (name: string, fn: () => Promise<void>) => { setBusy(name); try { await fn(); bump(); } catch { /* ignore */ } setBusy(null); };
  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8, marginBottom: 16 }}>Brand names that appear via reviews but aren't in The Capsule.</p>
      <Table head={['Brand', 'Reviews', 'Actions']} rows={(rows || []).map((b: any) => [
        <b style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.name}</b>, b.reviews,
        <span style={{ display: 'flex', gap: 8 }}>
          <ActionBtn busy={busy === b.name} onClick={() => act(b.name, () => promoteBrandByName(sb, b.name))}>Promote to Capsule</ActionBtn>
          <ActionBtn ghost busy={busy === b.name} onClick={() => act(b.name, () => flagBrandName(sb, b.name, adminId))}>Flag for Review</ActionBtn>
        </span>,
      ])} loading={!rows} empty="No non-Capsule brands." />
    </>
  );
}

function Table({ head, rows, loading, empty }: any) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', overflow: 'auto', maxHeight: '70vh' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{head.map((h: string) => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>
          {loading ? <tr><td style={td} colSpan={head.length}>Loading…</td></tr>
            : !rows.length ? <tr><td style={td} colSpan={head.length}>{empty}</td></tr>
            : rows.map((r: any[], i: number) => <tr key={i}>{r.map((c, j) => <td key={j} style={td}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
function SubH({ children }: any) { return <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '28px 0 12px' }}>{children}</div>; }
function Muted({ children }: any) { return <div style={{ fontSize: 14, color: 'var(--text-muted)', padding: '20px 0' }}>{children}</div>; }
