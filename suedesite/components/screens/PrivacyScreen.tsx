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
    <div className="sd-priv-sec" style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 60, padding: '40px 0', borderTop: '1px solid var(--border-subtle)' }}>
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

function PGroup({ label, items }: any) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 10 }}>{label}</div>
      <PBullets items={items} />
    </div>
  );
}

export function PrivacyScreen() {
  return (
    <div>
      {/* Hero */}
      <div className="sd-about-hero" style={{ maxWidth: 1460, margin: '0 auto', padding: '60px 52px 48px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
        <div style={{ borderLeft: '1px solid var(--ink-900)', paddingLeft: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Privacy</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-heading)', margin: '20px 0 0', textTransform: 'uppercase' }}>Your Privacy at Suede</h1>
        </div>
        <p className="sd-about-hero-p" style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 60 }}>
          What personal information we collect, how we use and protect it, and the choices you have — written <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>in plain language</b>. Last updated July 2026.
        </p>
      </div>

      {/* Intro */}
      <div className="sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 12px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 780, margin: '0 0 24px' }}>
          Suede (“Suede,” “we,” “us”) operates suedecapsule.com and its related services. This Privacy Policy explains what personal information we collect, how we use and share it, and the rights and choices you have. It applies to everyone who visits our site or joins the community. Suede is built on trust — the same principle that powers our measurement-matched reviews governs how we handle your data: <B>collect only what makes the product better, share only what you choose, and never sell what is yours.</B>
        </p>
      </div>

      {/* Sections */}
      <div className="sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 40px' }}>
        <PrivacySection num="I · Information We Collect" title="What you give us, what we observe, and what we receive.">
          <P>We collect information in three ways: the details you provide, information we gather automatically as you use Suede, and a little we receive from trusted services.</P>
          <PGroup label="Information you provide" items={[
            <span key="a"><B>Account &amp; identity</B> — your name, username, email address, and password.</span>,
            <span key="b"><B>Profile</B> — profile photo, bio, and any social links (Instagram, TikTok, website) you choose to add.</span>,
            <span key="c"><B>Body measurements &amp; sizes</B> — height, bust, waist, hips, and optional measurements (inseam, shoulder, arm, torso), plus the usual sizes you wear.</span>,
            <span key="d"><B>Content you post</B> — reviews, inquiries, comments, star ratings, photos or videos you upload, and product links you share.</span>,
            <span key="e"><B>Fit tools</B> — answers you give in the AI Measurement Quiz or a Measurement Consultation.</span>,
            <span key="f"><B>Brand applications</B> — if you apply to The Capsule: brand name, website, contact email, location, ownership details, and founding year.</span>,
            <span key="g"><B>Communications</B> — your email if you subscribe to our newsletter, and the contents of messages you send our team.</span>,
          ]} />
          <PGroup label="Information we collect automatically" items={[
            <span key="a"><B>Device &amp; usage data</B> — IP address, browser and device type, general location (city or region), pages viewed, and actions taken on Suede.</span>,
            <span key="b"><B>Cookies &amp; similar technologies</B> — small files that keep you signed in and help us understand how Suede is used (see “Cookies &amp; Tracking”).</span>,
          ]} />
          <PGroup label="Information from third parties" items={[
            <span key="a"><B>Sign-in providers</B> — if you sign in with Google or Apple, we receive the basic profile details (such as name and email) they share.</span>,
            <span key="b"><B>Analytics providers</B> — aggregated, privacy-respecting usage metrics. We do not use third-party advertising trackers.</span>,
          ]} />
        </PrivacySection>

        <PrivacySection num="II · How We Use Your Information" title="To run Suede, personalize your fit, and keep the community safe.">
          <PBullets items={[
            'Provide the core service — your account, profile, reviews, inquiries, and feeds.',
            'Calculate Suede Match scores and fit recommendations from your measurements.',
            'Show your content and profile to the community exactly as you’ve chosen to present them.',
            'Send you service messages, the notifications you’ve enabled, and — if you subscribe — our newsletter.',
            'Improve and secure Suede through troubleshooting, analytics, and preventing fraud or abuse.',
            'Meet legal obligations and enforce our Terms.',
          ]} />
          <P>Where the law requires it, we rely on your <B>consent</B> — for example, to process your body measurements — and you can withdraw that consent at any time.</P>
        </PrivacySection>

        <PrivacySection num="III · Your Body Measurements" title="Sensitive by nature — and treated that way.">
          <P>Your measurements are the heart of Suede, and we handle them as <B>sensitive information</B>. We collect them only with your consent, to calculate <B>Match Scores</B> between you and reviewers so you can find people who share your silhouette.</P>
          <P>Your raw measurements are <B>kept private by default</B>. Other members never see your exact numbers — only an aggregate match indicator (high, medium, or low confidence). Even when hidden, they still contribute to your match calculations. You can review, edit, or delete them anytime in <B>Edit Profile → Measurements</B>.</P>
        </PrivacySection>

        <PrivacySection num="IV · How We Share Your Information" title="Only in the limited ways below — and never for sale.">
          <PBullets items={[
            <span key="a"><B>With the community</B> — the profile details, reviews, inquiries, and content you choose to make public.</span>,
            <span key="b"><B>With brands (aggregate only)</B> — overall ratings, recommendation rates, and average sizing accuracy across their reviews. Never your name, contact details, or individual measurements.</span>,
            <span key="c"><B>With service providers</B> — vetted vendors who host our site, send email, or provide analytics on our behalf, under confidentiality obligations.</span>,
            <span key="d"><B>For legal reasons</B> — when required by law, to respond to lawful requests, or to protect the rights, safety, and security of Suede and its members.</span>,
            <span key="e"><B>In a business transfer</B> — if Suede is involved in a merger, acquisition, or sale of assets, information may transfer as part of that deal, subject to this policy.</span>,
          ]} />
        </PrivacySection>

        <PrivacySection num="V · What We Never Do" title="The short list that matters most.">
          <PBullets items={[
            'We never sell your personal information to anyone.',
            'We never share your raw measurements with brands or other members.',
            'We never run third-party advertising trackers on Suede.',
            'We never accept paid placement in reviews or The Capsule directory.',
          ]} />
        </PrivacySection>

        <PrivacySection num="VI · Cookies & Tracking" title="Essential cookies and privacy-respecting analytics.">
          <P>We use <B>essential cookies</B> to keep you signed in and remember your preferences, and <B>privacy-respecting analytics</B> to understand how Suede is used. We do not use third-party advertising cookies or sell data to ad networks.</P>
          <P>You can control cookies through your browser settings. Disabling essential cookies may affect how Suede works.</P>
        </PrivacySection>

        <PrivacySection num="VII · Data Retention" title="Kept only as long as it’s useful — or legally required.">
          <P>We keep your information for as long as your account is active or as needed to provide the service. When you delete your account, we remove your personal information and measurements from active use, retaining only what we’re required to keep for legal, security, or fraud-prevention reasons — and then only for as long as necessary.</P>
        </PrivacySection>

        <PrivacySection num="VIII · Data Security" title="Safeguards, and honesty if something goes wrong.">
          <P>We protect your information with encryption in transit, access controls, and regular security reviews. No system is perfectly secure, but we work hard to safeguard your data — and if a breach materially affects you, we’ll notify you and the relevant authorities as required by law.</P>
        </PrivacySection>

        <PrivacySection num="IX · Your Privacy Rights & Choices" title="You’re in control of your information.">
          <P>From <B>Edit Profile → Account</B> you can keep your measurements private, manage notifications, control whether you appear in The Collective, and update or delete your details. Depending on where you live, you may also have the right to:</P>
          <PBullets items={[
            'Access the personal information we hold about you.',
            'Correct information that’s inaccurate or incomplete.',
            'Delete your account and personal information.',
            'Export a copy of your data in a portable format.',
            'Object to or restrict certain processing, and withdraw consent.',
            'Opt out of marketing emails (use the unsubscribe link, or email us).',
          ]} />
          <P>These include rights under the <B>GDPR / UK GDPR</B> and the <B>California Consumer Privacy Act (CCPA/CPRA)</B>. We do not sell or “share” personal information as those laws define it. To exercise any right, email <B>info@suedecapsule.com</B> — and we’ll never discriminate against you for doing so.</P>
        </PrivacySection>

        <PrivacySection num="X · International Data Transfers" title="Protected wherever it travels.">
          <P>Suede may process and store information in countries other than your own, including the United States. Where we transfer personal information across borders, we use appropriate safeguards — such as standard contractual clauses — to keep it protected.</P>
        </PrivacySection>

        <PrivacySection num="XI · Children’s Privacy" title="Suede is for grown-up wardrobes.">
          <P>Suede is not intended for anyone under 16, and we do not knowingly collect information from children. If you believe a minor has provided us information, contact us and we’ll delete it.</P>
        </PrivacySection>

        <PrivacySection num="XII · Changes to This Policy" title="We’ll tell you when things change.">
          <P>We may update this policy as Suede evolves. When we make material changes, we’ll revise the date above and, where appropriate, notify you in the app or by email. Continuing to use Suede after an update means you accept the revised policy.</P>
        </PrivacySection>

        <PrivacySection num="XIII · Contact Us" title="Questions about your privacy?">
          <P>We’re a small team and we read everything. Reach us directly and a person — not a bot — will respond.</P>
          <P><B>Suede · info@suedecapsule.com</B></P>
        </PrivacySection>
      </div>
    </div>
  );
}
