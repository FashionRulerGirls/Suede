'use client';
import React from 'react';
import { Icon } from '@/components/ds';

function PEyebrow({ children }: any) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
      <span style={{ width: 24, height: 1, background: 'var(--text-secondary)' }} />{children}
    </div>
  );
}

function PrivacySection({ num, title, children }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 60, padding: '40px 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div>
        <PEyebrow>{num}</PEyebrow>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 27, lineHeight: 1.15, color: 'var(--text-heading)', margin: '16px 0 0' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );
}

function P({ children }: any) {
  return <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{children}</p>;
}
function B({ children }: any) { return <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{children}</b>; }

function PBullets({ items }: any) {
  return (
    <ul style={{ margin: '2px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it: any, i: number) => (
        <li key={i} style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <span style={{ flex: 'none', width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-900)', marginTop: 9 }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function PrivacyScreen() {
  return (
    <div>
      {/* Hero */}
      <div style={{ maxWidth: 1460, margin: '0 auto', padding: '60px 52px 48px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
        <div style={{ borderLeft: '1px solid var(--ink-900)', paddingLeft: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Privacy</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-heading)', margin: '20px 0 0', textTransform: 'uppercase' }}>Your Measurements, Kept Private</h1>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 60 }}>
          How Suede collects, uses, and protects your data — written <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>in plain language</b>. Last updated June 2026.
        </p>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 12px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 760, margin: '0 0 24px' }}>
          Suede is built on trust. The same principle that powers our measurement-matched reviews governs how we handle your data: <B>collect only what makes the product better, share only what you choose, and never sell what is yours.</B> This policy explains exactly how that works.
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 40px' }}>
        <PrivacySection num="I · What We Collect" title="The information you give us, and a little we observe.">
          <P><B>Account details</B> — your name, username, email, and password. The essentials to be part of the community.</P>
          <P><B>Body measurements</B> — height, bust, waist, hips, and any optional measurements you add. These power your Suede Match and fit recommendations.</P>
          <P><B>Activity</B> — the reviews and inquiries you write, the brands you follow, and the members you connect with.</P>
          <P><B>Usage</B> — basic, aggregated information about how you navigate Suede, used to improve the experience. We do not use third-party advertising trackers.</P>
        </PrivacySection>

        <PrivacySection num="II · How Your Measurements Are Used" title="To calculate matches — never to expose your body.">
          <P>Your measurements are the heart of Suede, and we treat them with the care that deserves. They are used to calculate <B>Match Scores</B> between you and reviewers, so you can find people who share your silhouette.</P>
          <P>Crucially, your raw measurements are <B>kept private by default</B>. Other members never see your exact numbers — only an aggregate match indicator (high, medium, or low confidence). Even when your measurements are hidden, they still contribute to your match calculations.</P>
        </PrivacySection>

        <PrivacySection num="III · What We Never Do" title="The short list that matters most.">
          <PBullets items={[
            'We never sell your personal information to anyone.',
            'We never share your raw measurements with brands or other members.',
            'We never run third-party advertising trackers on Suede.',
            'We never accept paid placement in reviews or The Capsule directory.',
          ]} />
        </PrivacySection>

        <PrivacySection num="IV · Sharing & Brands" title="What brands in The Capsule can and cannot see.">
          <P>Brands receive <B>aggregate, anonymized insight</B> — overall ratings, recommendation rates, and average sizing accuracy across their reviews. This helps them improve fit and quality.</P>
          <P>Brands never receive your name, contact details, or individual measurements. Reviews are attributed to your public profile only as you have chosen to present it.</P>
        </PrivacySection>

        <PrivacySection num="V · Your Controls" title="You decide what's visible, and you can leave anytime.">
          <P>From <B>Edit Profile → Account</B>, you can keep your measurements private, manage notifications, control whether you appear in The Collective, and update or delete your information.</P>
          <P>You may request a copy of your data or delete your account at any time. Deletion removes your personal information and measurements from active use.</P>
        </PrivacySection>

        <PrivacySection num="VI · Contact" title="Questions about your privacy?">
          <P>We're a small team and we read everything. Reach us directly and a person — not a bot — will respond.</P>
          <P><B>info@suedecapsule.com</B></P>
        </PrivacySection>
      </div>
    </div>
  );
}
