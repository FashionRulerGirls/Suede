'use client';
import React from 'react';
/* Suede marketing-site top navigation.
   Section links live in the hamburger menu only; the bar keeps the
   wordmark, search, business menu and auth. */
import { Logo, IconButton, AuthToggle, Select, Icon } from '@/components/ds';
import { SUEDE_BRANDS, SUEDE_MEMBERS, SUEDE_REVIEWS, SUEDE_INQUIRIES, SUEDE_NOTIF_COUNT } from '@/lib/data';
import { appState } from '@/lib/appState';

export function Nav({ route, onRoute, authed = false }: any) {
  const [open, setOpen] = React.useState(false);
  const [biz, setBiz] = React.useState(false);
  const [prof, setProf] = React.useState(false);
  const profItems = [
    { id: 'consult', label: 'Measurement Consultation', note: 'Walk through a self guided at-home measurement session' },
    { id: 'quiz', label: 'AI Body Measurement Quiz', note: 'Get quick directional sizing based on short questionnaire' },
    { id: 'profile', label: 'I Know My Measurements', note: 'Input your measurements directly to your Suede Profile' },
  ];
  const goProf = () => { setProf(false); onRoute('signin'); };
  const [measure, setMeasure] = React.useState(false);
  const [plus, setPlus] = React.useState(false);
  const [acct, setAcct] = React.useState(false);
  const [search, setSearch] = React.useState(false);
  const [q, setQ] = React.useState('');
  const searchInputRef = React.useRef<any>(null);
  React.useEffect(() => { if (search && searchInputRef.current) searchInputRef.current.focus(); }, [search]);

  const ql = q.trim().toLowerCase();
  const brands = (SUEDE_BRANDS || []);
  const members = (SUEDE_MEMBERS || []);
  const reviews = (SUEDE_REVIEWS || []);
  const inquiries = (SUEDE_INQUIRIES || []);
  const mBrands = ql ? brands.filter(b => (b.name + ' ' + (b.tagline || '') + ' ' + (b.category || '')).toLowerCase().includes(ql)) : brands.slice(0, 4);
  const mMembers = ql ? members.filter(m => (m.name + ' ' + m.handle).toLowerCase().includes(ql)) : members.slice(0, 4);
  const mReviews = ql ? reviews.filter(r => (r.brand + ' ' + r.product + ' ' + r.reviewer.name + ' ' + r.excerpt).toLowerCase().includes(ql)) : reviews.slice(0, 3);
  const mInquiries = ql ? inquiries.filter(i => (i.brand + ' ' + i.product + ' ' + i.asker.name + ' ' + i.question).toLowerCase().includes(ql)) : inquiries.slice(0, 3);
  const totalResults = mBrands.length + mMembers.length + mReviews.length + mInquiries.length;
  const openSearch = () => { setSearch(true); setBiz(false); setPlus(false); setOpen(false); };
  const goSearch = (r) => { setSearch(false); setQ(''); onRoute(r); };
  const bizItems = [
    { id: 'apply', icon: 'pen', label: 'Apply', note: 'Join the Capsule' },
    { id: 'portal', icon: 'grid', label: 'Brand Portal', note: 'Manage your brand' },
  ];
  const goBiz = (id) => {
    setBiz(false);
    if (id === 'portal') { onRoute('brandsignin'); }
    else if (id === 'apply') { onRoute('apply'); }
  };
  const links = [
    { id: 'capsule', icon: 'shirt', label: 'The Capsule', note: 'Brand Directory' },
    { id: 'lookbook', icon: 'reviews', label: 'The Lookbook', note: 'Reviews & Inquiries' },
    { id: 'collective', icon: 'user', label: 'The Collective', note: 'Member Discovery' },
    { id: null, icon: 'inbox', label: 'The Consign', note: 'Coming Soon' },
  ];
  const extra = [
    { id: 'suggest', label: 'Suggest a Brand' },
    { id: 'about', label: 'About Us' },
  ];
  const go = (id) => { setOpen(false); if (id) onRoute(id); };

  return (
    <React.Fragment>
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(248,246,243,0.86)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: 1460, margin: '0 auto', padding: '18px 52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        <button onClick={() => onRoute('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <Logo variant="wordmark" height={50} style={{ position: 'relative', top: 6 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconButton icon="search" variant="plain" label="Search" onClick={openSearch} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setBiz(b => !b)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 100, color: 'var(--text-primary)',
            }}>
              Suede for Business
              <Icon name="chevron-down" size={15} color="var(--text-secondary)" style={{ transition: 'transform var(--dur-base) var(--ease-out)', transform: biz ? 'rotate(180deg)' : 'none' }} />
            </button>
            {biz && <div onClick={() => setBiz(false)} style={{ position: 'fixed', inset: 0, top: 73, zIndex: 25 }} />}
            <div onMouseLeave={() => setBiz(false)} style={{
              position: 'absolute', right: 0, top: 'calc(100% + 14px)', zIndex: 26, width: 268,
              background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: 8,
              transformOrigin: 'top right',
              transition: 'opacity 180ms var(--ease-out), transform 180ms var(--ease-out)',
              opacity: biz ? 1 : 0,
              transform: biz ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
              pointerEvents: biz ? 'auto' : 'none',
            }}>
              {bizItems.map(it => (
                <button key={it.id} onClick={() => goBiz(it.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 13,
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 16, color: 'var(--text-primary)' }}>{it.label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 2.5 }}>{it.note}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          {!authed && (
            <AuthToggle value="Sign In" onChange={(v) => onRoute(v === 'Create Account' ? 'createaccount' : 'signin')} />
          )}
          {authed && (<React.Fragment>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setPlus(p => !p)} aria-label="Create" style={{
              width: 38, height: 38, borderRadius: 'var(--radius-pill)', border: 'none',
              background: 'var(--ink-900)', color: 'var(--white)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={18} color="var(--white)" />
            </button>
            {plus && <div onClick={() => setPlus(false)} style={{ position: 'fixed', inset: 0, top: 73, zIndex: 25 }} />}
            <div onMouseLeave={() => setPlus(false)} style={{
              position: 'absolute', right: 0, top: 'calc(100% + 14px)', zIndex: 26, width: 240,
              background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: 8,
              transformOrigin: 'top right',
              transition: 'opacity 180ms var(--ease-out), transform 180ms var(--ease-out)',
              opacity: plus ? 1 : 0,
              transform: plus ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
              pointerEvents: plus ? 'auto' : 'none',
            }}>
              {[{ ic: 'star', label: 'Leave a Review', r: 'createreview' }, { ic: 'message', label: 'Leave an Inquiry', r: 'createinquiry' }].map(it => (
                <button key={it.label} onClick={() => { setPlus(false); onRoute(it.r); }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Icon name={it.ic} size={17} color="var(--text-primary)" />
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 16, color: 'var(--text-primary)' }}>{it.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setAcct(a => !a)} aria-label="Account" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative',
            }}>
              <img src="/assets/avatars/avatar-rose.jpg" alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              {(SUEDE_NOTIF_COUNT > 0) && (
                <span style={{ position: 'absolute', top: -3, left: 28, minWidth: 17, height: 17, padding: '0 4px', boxSizing: 'border-box', borderRadius: 9, background: 'var(--ink-900)', color: 'var(--white)', fontFamily: 'var(--font-meta, var(--font-body))', fontSize: 10.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--paper)', lineHeight: 1 }}>{SUEDE_NOTIF_COUNT}</span>
              )}
              <Icon name="chevron-down" size={14} color="var(--text-secondary)" style={{ transition: 'transform var(--dur-base) var(--ease-out)', transform: acct ? 'rotate(180deg)' : 'none' }} />
            </button>
            {acct && <div onClick={() => setAcct(false)} style={{ position: 'fixed', inset: 0, top: 73, zIndex: 25 }} />}
            <div onMouseLeave={() => setAcct(false)} style={{
              position: 'absolute', right: 0, top: 'calc(100% + 14px)', zIndex: 26, width: 220,
              background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: 8,
              transformOrigin: 'top right',
              transition: 'opacity 180ms var(--ease-out), transform 180ms var(--ease-out)',
              opacity: acct ? 1 : 0,
              transform: acct ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
              pointerEvents: acct ? 'auto' : 'none',
            }}>
              {[{ ic: 'user', label: 'Your Profile', v: null }, { ic: 'bell', label: 'Notifications', v: '__notif' }, { ic: 'shirt', label: 'Capsule Feed', v: 'capsulefeed' }, { ic: 'user', label: 'Collective Feed', v: 'collectivefeed' }, { ic: 'logout', label: 'Sign Out', v: '__signout' }].map(it => (
                <button key={it.label} onClick={() => { setAcct(false); if (it.v === '__signout') { onRoute('__signout'); } else if (it.v === '__notif') { onRoute('notifications'); } else { appState.profileView = it.v; onRoute('yourprofile'); window.dispatchEvent(new CustomEvent('suede-profile-view', { detail: it.v })); } }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Icon name={it.ic} size={16} color="var(--text-primary)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 100, fontSize: 14, color: 'var(--text-primary)' }}>{it.label}</span>
                </button>
              ))}
            </div>
          </div>
          </React.Fragment>)}
          <IconButton icon={open ? 'close' : 'menu'} variant={open ? 'soft' : 'plain'} label="Menu" onClick={() => setOpen(o => !o)} />
        </div>
      </div>

      {/* Hamburger dropdown — holds the section navigation */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, top: 73, zIndex: 25, background: 'rgba(20,18,15,0.12)' }} />
      )}
      <div onMouseLeave={() => setOpen(false)} style={{
        position: 'absolute', right: 40, top: 'calc(100% + 10px)', zIndex: 26,
        width: 320, background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        transformOrigin: 'top right',
        transition: 'opacity 180ms var(--ease-out), transform 180ms var(--ease-out)',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{ padding: '8px' }}>
          {links.map(l => (
            <button key={l.label} onClick={() => go(l.id)} disabled={!l.id}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
                background: route === l.id ? 'var(--linen)' : 'transparent',
                cursor: l.id ? 'pointer' : 'default', textAlign: 'left',
              }}>
              <Icon name={l.icon} size={18} color={l.id ? 'var(--text-primary)' : 'var(--text-muted)'} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 17, color: l.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{l.label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{l.note}</span>
              </span>
            </button>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '8px' }}>
          <button onClick={() => { setOpen(false); setMeasure(true); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 16, color: 'var(--text-primary)' }}>Complete Profile Measurements</span>
            <Icon name="chevron-right" size={16} color="var(--text-muted)" />
          </button>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '8px' }}>
          {extra.map(e => (
            <button key={e.label} onClick={() => go(e.id)}
              style={{ width: '100%', display: 'flex', padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </header>

      {/* Global search overlay */}
      <div onClick={() => setSearch(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(20,18,15,0.62)', display: search ? 'block' : 'none' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760, margin: '64px auto 0', background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', maxHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Icon name="search" size={20} color="var(--text-secondary)" />
            <input ref={searchInputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands, members, reviews, inquiries"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-primary)' }} />
            <button onClick={() => setSearch(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <Icon name="close" size={20} />
            </button>
          </div>
          <div style={{ overflowY: 'auto', padding: '8px 0 16px' }}>
            {totalResults === 0 && (
              <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>No results for “{q}”.</div>
            )}
            {mBrands.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 24px 8px' }}>Brands · The Capsule</div>
                {mBrands.map(b => (
                  <button key={b.name} onClick={() => goSearch('capsule')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <img src={b.image} alt="" style={{ width: 40, height: 50, objectFit: 'contain', flex: 'none' }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{b.name}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>{b.tagline}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {mMembers.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 24px 8px' }}>Members · The Collective</div>
                {mMembers.map(m => (
                  <button key={m.handle} onClick={() => goSearch('collective')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--linen)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-secondary)' }}>{m.name.charAt(0)}</span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{m.name}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{m.handle} · {m.reviews} reviews</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {mReviews.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 24px 8px' }}>Reviews · The Lookbook</div>
                {mReviews.map((r, i) => (
                  <button key={i} onClick={() => { appState.lookbookTab = 'reviews'; goSearch('lookbook'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <img src={r.image} alt="" style={{ width: 40, height: 50, objectFit: 'cover', flex: 'none' }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}><b>{r.brand}</b> · {r.product}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>{r.reviewer.name}: “{r.excerpt}”</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {mInquiries.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 24px 8px' }}>Inquiries · The Lookbook</div>
                {mInquiries.map((it, i) => (
                  <button key={i} onClick={() => { appState.lookbookTab = 'inquiries'; goSearch('lookbook'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--linen)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <img src={it.image} alt="" style={{ width: 40, height: 50, objectFit: 'cover', flex: 'none' }} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}><b>{it.brand}</b> · {it.product}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>{it.asker.name}: “{it.question}”</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Profile Measurements modal */}
      <div onClick={() => setMeasure(false)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,18,15,0.62)', display: measure ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', padding: '28px 36px 34px', position: 'relative' }}>
          <button onClick={() => setMeasure(false)} aria-label="Close" style={{ position: 'absolute', top: 22, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
            <Icon name="close" size={22} />
          </button>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 28, color: 'var(--text-heading)', margin: '4px 0 6px' }}>Complete your measurements</h2>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 18px', whiteSpace: 'nowrap' }}>Accurate measurements mean better fit recommendations across Suede</p>
          <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 18 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profItems.map(it => (
              <button key={it.id} onClick={() => { setMeasure(false); onRoute(it.id === 'quiz' ? 'quiz' : it.id === 'consult' ? 'consult' : (authed ? 'editprofile' : 'signin')); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, background: 'var(--surface-card)', border: '1px solid var(--border-default)', padding: '16px 18px', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ink-900)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 16, color: 'var(--text-primary)' }}>{it.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{it.note}</span>
                </span>
                <Icon name="chevron-right" size={16} color="var(--text-secondary)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
