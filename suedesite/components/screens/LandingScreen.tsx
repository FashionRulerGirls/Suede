'use client';
import React from 'react';
/* Suede — Landing screen. */
import { Button, BrandCard, ReviewCard, SectionHeading, Eyebrow, EditorialBanner, Icon, Logo, MeasurementSpec, Badge } from '@/components/ds';
import { SUEDE_BRANDS, SUEDE_REVIEWS } from '@/lib/data';
import { appState } from '@/lib/appState';

/* Auto-scrolling model marquee sitting in front of the giant hero wordmark.
   5 visible on desktop, 3 on tablet, 2 on phone; pause toggles the loop. */
function CapsuleCarousel({ brands, onRoute }: any) {
  const [paused, setPaused] = React.useState(false);
  const [vw, setVw] = React.useState(1280);
  React.useEffect(() => {
    const onR = () => setVw(window.innerWidth);
    onR();
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  const VISIBLE = vw <= 640 ? 2 : vw <= 900 ? 3 : 5;
  const imgH = vw <= 640 ? 300 : 360;
  const loop = [...brands, ...brands];
  const trackWidth = (loop.length / VISIBLE) * 100;   // %
  const itemBasis = 100 / loop.length;                // % of track
  return (
    <div style={{ position: 'relative', marginTop: 22 }}>
      <style>{`@keyframes suedeMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', width: trackWidth + '%',
          animation: 'suedeMarquee 48s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}>
          {loop.map((b, i) => (
            <button key={i} onClick={() => { appState.brand = b; onRoute('brand'); }} style={{
              flex: `0 0 ${itemBasis}%`, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, padding: 0,
            }}>
              <span style={{ height: imgH + 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <img src={b.image} alt={b.name} style={{ height: imgH, width: 'auto', objectFit: 'contain' }} />
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{b.name}</span>
            </button>
          ))}
        </div>
        {/* edge fades — dissolve cutouts into the page (hidden on phone) */}
        <div className="sd-cap-fade" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 160, background: 'linear-gradient(to right, var(--paper), rgba(248,246,243,0))', pointerEvents: 'none', zIndex: 2 }} />
        <div className="sd-cap-fade" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 160, background: 'linear-gradient(to left, var(--paper), rgba(248,246,243,0))', pointerEvents: 'none', zIndex: 2 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <button onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play' : 'Pause'} title={paused ? 'Play' : 'Pause'}
          style={{ width: 38, height: 38, borderRadius: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
          <Icon name={paused ? 'play' : 'pause'} size={16} />
        </button>
      </div>
    </div>
  );
}

/* Member profile card for The Collective slide. */
function MemberCard() {
  const link: any = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3, textAlign: 'left' };
  return (
    <div className="sd-collcard" style={{ width: 540, transform: 'scale(0.8)', transformOrigin: 'center', background: 'var(--surface-card)', borderRadius: 0, boxShadow: '0 22px 50px rgba(16,14,11,0.30)', padding: '16px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-primary)' }}>Oumou Diallo</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: 3 }}>@by.oumou</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <MeasurementSpec height="5'6&quot;" bust="35&quot;" waist="28&quot;" hips="43&quot;" size="sm" tone="muted" />
          <span style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '1'; t.style.pointerEvents = 'auto'; } }}
            onMouseLeave={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '0'; t.style.pointerEvents = 'none'; } }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--text-muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rating-positive)', flex: 'none' }} />Suede Match
            </span>
            <span data-tip className="sd-rating-pop" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, whiteSpace: 'nowrap', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 20 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)' }}>High Confidence</span>
            </span>
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, marginTop: 14 }}>
        <span aria-hidden="true" />
        <img src="/assets/imagery/oumou.jpg" alt="Oumou" style={{ width: 184, height: 244, objectFit: 'cover', objectPosition: 'center 30%', borderRadius: 0, justifySelf: 'center' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifySelf: 'end', alignItems: 'flex-end' }}>
          <button style={link}>Follow+</button>
          <button style={link}>View Profile</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        {[['Reviews', '88'], ['Inquiries', '45'], ['Followers', '979']].map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-primary)', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Front card + one half-translucent clone behind it, slightly rotated.
   Anchored toward the inner (text-facing) edge of its silk panel. */
function CardStack({ front, frontW, mirror, center }: any) {
  const pos = center
    ? { left: '50%', transform: 'translate(-50%, -50%)' }
    : { [mirror ? 'right' : 'left']: '9%', transform: 'translateY(-50%)' };
  return (
    <div className="sd-cardstack" style={{ position: 'absolute', top: '50%', ...pos, width: frontW }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: -14, left: 64, width: '100%', transform: 'rotate(6deg)', opacity: 0.4 }}>{front}</div>
      <div style={{ position: 'relative', transform: 'rotate(-3deg)' }}>{front}</div>
    </div>
  );
}

/* Paper text side of a How-It-Works slide. */
function HiwText({ title, cols, onRoute }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, padding: '0 9%', maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <Eyebrow>How it works</Eyebrow>
      <h2 className="sd-h1 sd-hiw-title" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--text-heading)', margin: 0 }}>{title}</h2>
      <div className="sd-hiw-textcols" style={{ display: 'flex', gap: 44, marginTop: 8 }}>
        {cols.map(c => (
          <div key={c.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{c.body}</p>
            <button onClick={() => { if (c.tab) appState.lookbookTab = c.tab; onRoute(c.route); }} style={{ alignSelf: 'flex-start', marginTop: 'auto', background: 'none', border: 'none', borderBottom: '1px solid var(--ink-900)', padding: '0 0 6px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{c.label}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Two-slide How-It-Works section: The Lookbook + The Collective. */
function HowItWorks({ onRoute }: any) {
  const [slide, setSlide] = React.useState(0);
  const silk: any = { position: 'relative', overflow: 'hidden', background: 'url(/assets/imagery/texture-silk.jpg) center / cover', minHeight: 640 };
  const paper: any = { display: 'flex', alignItems: 'center', minHeight: 640 };
  const arrow = (side): any => ({ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 30, width: 50, height: 50, borderRadius: 'var(--radius-pill)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 });
  return (
    <section className="sd-hiw" style={{ position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes hiwFade{from{opacity:0}to{opacity:1}}`}</style>
      <div key={slide} className="sd-hiw-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', animation: 'hiwFade 700ms var(--ease-out)' }}>
        {slide === 0 ? (
          <React.Fragment>
            <div className="sd-hiw-paper" style={paper}>
              <HiwText title="The Lookbook" onRoute={onRoute} cols={[
                { body: 'Browse reviews to understand fit, quality, and brand experience', label: 'Reviews', route: 'lookbook' },
                { body: 'Respond to inquiries to share your experience and sizing recommendations', label: 'Inquiries', route: 'lookbook', tab: 'inquiries' },
              ]} />
            </div>
            <div className="sd-hiw-silk" style={silk}><CardStack frontW={520} front={<div style={{ pointerEvents: 'none' }}><ReviewCard {...SUEDE_REVIEWS[0]} /></div>} /></div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="sd-hiw-silk" style={silk}><CardStack center frontW={540} front={<div style={{ pointerEvents: 'none' }}><MemberCard /></div>} /></div>
            <div className="sd-hiw-paper" style={paper}>
              <HiwText title="The Collective" onRoute={onRoute} cols={[
                { body: 'Connect with your Suede match and discover independent, trustworthy fashion voices.', label: 'Find Members', route: 'collective' },
                { body: 'Join the Suede community and get tailored recommendations based on real measurements and fashion preferences.', label: 'Create Your Profile', route: 'collective' },
              ]} />
            </div>
          </React.Fragment>
        )}
      </div>

      {slide === 1 && <button onClick={() => setSlide(0)} aria-label="Previous" className="sd-hiw-arrow sd-hiw-arrow-left" style={arrow('left')}><Icon name="arrow-left" size={26} color="#fff" /></button>}
      {slide === 0 && <button onClick={() => setSlide(1)} aria-label="Next" className="sd-hiw-arrow sd-hiw-arrow-right" style={{ ...arrow('right'), animation: 'swipeHint 1.6s var(--ease-inout) infinite' }}>
        <style>{`@keyframes swipeHint{0%,100%{transform:translateY(-50%) translateX(0)}50%{transform:translateY(-50%) translateX(8px)}}`}</style>
        <Icon name="arrow-right" size={26} color="#fff" />
      </button>}

      <div className="sd-hiw-dots" style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, zIndex: 4 }}>
        {[0, 1].map(i => (
          <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} style={{ width: slide === i ? 24 : 8, height: 8, borderRadius: 'var(--radius-pill)', border: 'none', background: slide === i ? 'var(--ink-900)' : 'var(--ink-300)', cursor: 'pointer', transition: 'all var(--dur-base) var(--ease-out)', padding: 0 }} />
        ))}
      </div>
    </section>
  );
}

export function LandingScreen({ onRoute, tweaks, authed = false }: any) {
  const HOME_HIDDEN = ['Akino', 'The Ekhator Label', 'Constructed for Women'];
  const brands = SUEDE_BRANDS.filter((b) => !HOME_HIDDEN.includes(b.name));
  return (
    <div>
      {/* HERO — giant SUEDE wordmark behind the auto-scrolling model carousel */}
      <section className="sd-hero-new" style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column', padding: '38px 0 46px', background: 'var(--surface-page)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="sd-hero-stage" style={{ position: 'relative' }}>
            <div className="sd-hero-wordmark" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 20, height: 475, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0, pointerEvents: 'none' }}>
              <Logo variant="wordmark" height={400} color="var(--ink-900)" style={{ maxWidth: 'none', width: 'auto', flex: 'none' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <CapsuleCarousel brands={brands} onRoute={onRoute} />
            </div>
          </div>
        </div>

        {/* three destinations: Capsule left, Lookbook centered, Collective right */}
        <div className="sd-hero-dests" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'start', paddingTop: 40, paddingLeft: 60, paddingRight: 60 }}>
          {[{ ic: 'search', label: 'The Capsule', r: 'capsule', js: 'start' },
            { ic: 'reviews', label: 'The Lookbook', r: 'lookbook', js: 'center' },
            { ic: 'user', label: 'The Collective', r: 'collective', js: 'end' }].map(l => (
            <button key={l.label} onClick={() => onRoute(l.r)} className="sd-dest"
              style={{ justifySelf: l.js as any, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 0 }}>
              <Icon name={l.ic} size={22} color="var(--text-secondary)" />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--text-primary)' }}>{l.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 35 }}>
        <EditorialBanner tone="ink" scroll>{(tweaks && tweaks.bannerText) || 'Curated collection of minority-owned and emerging brands that deserve your attention'}</EditorialBanner>
      </div>

      {/* How it works — two-slide slider: The Lookbook + The Collective */}
      <HowItWorks onRoute={onRoute} />

      {/* Measurements CTA */}
      <section className="sd-measure-cta" style={{ width: '100%', padding: '90px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 640, margin: '0 auto', width: '100%', padding: '0 9%' }}>
          <Logo variant="monogram" height={600} color="var(--ink-900)" className="sd-measure-mono" style={{ position: 'absolute', left: 0, top: '38%', transform: 'translateY(-50%)', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }} />
          <h2 className="sd-h1" style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 24, lineHeight: 1.25, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--text-heading)', margin: 0, textAlign: 'left', maxWidth: 460 }}>
            Don't know your measurements?
          </h2>
          <p style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>Accurate measurements mean better fit recommendations across Suede. Select one of the following options:</p>
        </div>
        <div className="sd-wrap sd-measure-opts" style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', padding: '0 52px' }}>
          <style>{`.measure-opt{transition:border-color var(--dur-base) var(--ease-out),background var(--dur-base) var(--ease-out)} .measure-opt:hover{border-color:var(--ink-900)} .measure-opt:hover .measure-arrow{transform:translateX(5px)} .measure-arrow{transition:transform var(--dur-base) var(--ease-out)}`}</style>

          <div style={{ border: '1px solid var(--ink-600)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>Recommended</div>
            {[{ t: 'Self-Guided Measurement Consultation', d: 'Step-by-step chat guide to measuring yourself at home. Measuring tape required. (~5 min)', r: 'consult' }].map((o) => (
              <button key={o.t} className="measure-opt" onClick={() => onRoute(o.r)} style={{ width: '100%', textAlign: 'left', background: 'var(--surface-card)', border: '1px solid var(--border-default)', padding: '20px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--text-primary)' }}>{o.t}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{o.d}</span>
                </span>
                <Icon name="arrow-right" size={18} color="var(--text-secondary)" className="measure-arrow" />
              </button>
            ))}
          </div>

          <button className="measure-opt" onClick={() => onRoute('quiz')} style={{ margin: '0 15px', textAlign: 'left', background: 'var(--surface-card)', border: '1px solid var(--border-default)', padding: '20px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--text-primary)' }}>AI Body Measurement Quiz</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Answer a few quick questions, get directional measurements. (~90 sec)</span>
            </span>
            <Icon name="arrow-right" size={18} color="var(--text-secondary)" className="measure-arrow" />
          </button>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Already know your measurements? </span>
            <button onClick={() => onRoute(authed ? 'editprofile' : 'signin')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Add them to your Suede profile</button>
          </div>
        </div>
      </section>
    </div>
  );
}
