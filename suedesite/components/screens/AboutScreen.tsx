'use client';
import React from 'react';
import { Icon } from '@/components/ds';

function Eyebrow({ children }: any) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
      <span style={{ width: 24, height: 1, background: 'var(--text-secondary)' }} />{children}
    </div>
  );
}

export function AboutScreen() {
  return (
    <div>
      {/* Hero */}
      <div className="sd-about-hero" style={{ maxWidth: 1460, margin: '0 auto', padding: '60px 52px 56px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
        <div style={{ borderLeft: '1px solid var(--ink-900)', paddingLeft: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>About Us</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-heading)', margin: '20px 0 0', textTransform: 'uppercase' }}>The Trust Layer for Fashion</h1>
        </div>
        <p className="sd-about-hero-p" style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 60 }}>
          Honest reviews from people who share your <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>measurements</b> — so you know how something fits before you buy it, not after.
        </p>
      </div>

      {/* I — Etymology */}
      <div className="sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 40px 64px' }}>
        <Eyebrow>I · Etymology</Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 22, color: 'var(--text-primary)', margin: '16px 0 40px' }}>A name with <b style={{ fontWeight: 700 }}>two meanings.</b></h2>
        <div className="sd-about-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '0.04em', color: 'var(--text-heading)' }}>SUEDE</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 8px', fontStyle: 'italic' }}>/SWEID/</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}><b style={{ fontWeight: 600 }}>noun.</b> A softened leather, brushed to reveal its inner texture. Considered, tactile, made to be noticed up close.</p>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '0.04em', color: 'var(--text-heading)' }}>SWAYED</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 8px', fontStyle: 'italic' }}>/SWEID/ · Said the same way</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}><b style={{ fontWeight: 600 }}>Verb.</b> To be moved toward something by proof — someone who actually wore it — not a brand's pitch.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>The name means both. Suede is a material you <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>choose on purpose</b> — the pick of someone who cares what a thing is actually made of, not just how it looks in a photo. To be swayed is to be moved by proof — not a pitch.</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>That's the whole idea. Suede runs on <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>real evidence</b> — not ads, not trend cycles, not a model whose body is nothing like yours. Just reviews from people who share your measurements, bought the piece, and actually wore it.</p>
          </div>
        </div>
      </div>

      {/* II — Our Origin (dark) */}
      <div style={{ background: 'var(--ink-900)', color: 'var(--white)' }}>
        <div className="sd-about-2col sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 40px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.6)' }} />II · Our Origin
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)', marginTop: 24 }}>Before it was Suede, it was a few questions in a full shopping cart — will this actually fit me? Is it worth the price? Can I trust the brand?</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Fashion has never been easier to find or <b style={{ fontWeight: 600, color: 'var(--white)' }}>harder to buy well.</b> We're surrounded by photos and starved of real information. Reviews come from strangers with no sense of your body, size charts lie, and the person modeling the dress never looks like the person buying it.</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Suede fixes that. Reviews come from <b style={{ fontWeight: 600, color: 'var(--white)' }}>people who share your measurements</b> — because fit is usually the first question, and everything after it depends on getting that one right.</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', margin: 0 }}>It's built around three spaces: <b style={{ fontWeight: 600, color: 'var(--white)' }}>the Capsule</b>, brands worth knowing; <b style={{ fontWeight: 600, color: 'var(--white)' }}>the Lookbook</b>, reviews matched to your measurements; and <b style={{ fontWeight: 600, color: 'var(--white)' }}>the Collective</b>, the members behind the reviews.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="sd-about-stats" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
        {[['25%', 'of online clothing orders get sent back'], ['$21 – $46', 'the cost of each return — baked back into what you pay'], ['38%', 'of shoppers have returned clothes that simply didn’t fit']].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--text-heading)' }}>{v}</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)', margin: '14px auto 0', maxWidth: 240 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* III — Our Founder */}
      <div className="sd-about-2col sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 40px 0', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 60, alignItems: 'start' }}>
        <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--linen)', borderRadius: 'var(--radius-sm)' }}>
          <img src="/assets/imagery/founder-kikiola.jpg" alt="Kikiola, Founder & CEO" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
        </div>
        <div>
          <Eyebrow>III · Our Founder</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 52, color: 'var(--text-heading)', margin: '20px 0 6px' }}>Kikiola</h2>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-secondary)' }}>Founder &amp; CEO</div>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', margin: '24px 0 18px' }}>I built the platform I wanted to shop on.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>I'm Kikiola — ex-McKinsey, cybersecurity professional by day, fashion girl the rest of the time. I love finding a good piece, but I don't love the hours it takes to find one, or the gamble that comes after — the sizing chart that doesn't line up with the garment, the product photos that don't line up with reality, the reviews that simply don't exist… or if they do, they don't have any sizing context.</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>Somewhere along the way the math stopped working. Brands want full price and give you almost nothing to go on — no transparency on fit, no real information on quality, just a campaign shoot and a size guide written by AI. The cost of being wrong got too high, and scrolling TikTok for an hour to crowdsource a size wasn't a lifestyle I wanted.</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>Suede is my answer. A place to find brands worth knowing, and to read reviews from people who actually share my measurements. I built it to fix one of my biggest pain points as a shopper — and, honestly, to see where everyone's actually shopping and what's worth the spend. Call it enabling my bad habits. I call it maximizing my time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
