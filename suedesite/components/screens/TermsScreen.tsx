'use client';
import React from 'react';

function TEyebrow({ children }: any) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
      <span style={{ width: 24, height: 1, background: 'var(--text-secondary)' }} />{children}
    </div>
  );
}

function TermsSection({ num, title, children }: any) {
  return (
    <div className="sd-priv-sec" style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 60, padding: '40px 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div>
        <TEyebrow>{num}</TEyebrow>
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

function TBullets({ items }: any) {
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

export function TermsScreen({ onRoute }: any) {
  return (
    <div>
      {/* Hero */}
      <div className="sd-about-hero" style={{ maxWidth: 1460, margin: '0 auto', padding: '60px 52px 48px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
        <div style={{ borderLeft: '1px solid var(--ink-900)', paddingLeft: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Terms</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text-heading)', margin: '20px 0 0', textTransform: 'uppercase' }}>Terms of Service</h1>
        </div>
        <p className="sd-about-hero-p" style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 60 }}>
          The agreement between you and Suede — written <b style={{ fontWeight: 600, color: 'var(--text-primary)' }}>in plain language</b>. Last updated July 2026.
        </p>
      </div>

      {/* Intro */}
      <div className="sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 12px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 780, margin: '0 0 24px' }}>
          Welcome to Suede. These Terms of Service (“Terms”) are the agreement between you and Suede (“Suede,” “we,” “us”) for your use of suedecapsule.com and our related services. By creating an account or using Suede, you agree to these Terms and to our{' '}
          <button onClick={() => onRoute && onRoute('privacy')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</button>. If you don’t agree, please don’t use Suede.
        </p>
      </div>

      {/* Sections */}
      <div className="sd-about-pad" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 40px' }}>
        <TermsSection num="I · Who Can Use Suede" title="Your account basics.">
          <P>Suede is a general-audience service. By using it, you confirm that the information you provide is accurate and that you’ll use Suede in line with these Terms.</P>
          <P>You’re responsible for your account and for keeping your login secure. Let us know promptly if you believe someone has accessed your account without permission. You may close your account at any time from <B>Edit Profile → Account</B>.</P>
        </TermsSection>

        <TermsSection num="II · Your Content" title="You own what you post — you give us permission to show it.">
          <P>Reviews, inquiries, comments, photos, videos, measurements, and anything else you share are <B>your content</B>. You keep ownership of it.</P>
          <P>By posting, you grant Suede a non-exclusive, worldwide, royalty-free license to host, display, and distribute that content within the service so the community can benefit from it — for example, showing your review on a brand’s page or in The Lookbook. You can edit or delete your content, and doing so ends that license going forward, except for copies retained as required by law or reasonable backups.</P>
          <P>You’re responsible for what you post. Only share content you have the right to share, and make sure your reviews reflect your <B>genuine, first-hand experience</B>.</P>
        </TermsSection>

        <TermsSection num="III · Community Conduct" title="Honest, respectful, and your own.">
          <P>Suede works because reviews are trustworthy. When you participate, you agree to:</P>
          <TBullets items={[
            'Write honest reviews and inquiries based on your real experience.',
            'Be respectful — no harassment, hate, threats, or personal attacks.',
            'Post only content you own or have permission to use.',
            'Keep it authentic — no fake reviews, spam, impersonation, or paid/undisclosed promotion.',
            'Respect others’ privacy — don’t share someone else’s personal information.',
          ]} />
          <P>We may remove content or suspend accounts that break these rules or harm the community.</P>
        </TermsSection>

        <TermsSection num="IV · Measurements & Suede Match" title="Guidance, not a guarantee.">
          <P>Suede Match scores and fit recommendations are generated from the measurements and information members provide. They’re designed to help you shop with more confidence, but they’re <B>guidance, not a guarantee</B> of fit, quality, or satisfaction. Always use your own judgment before purchasing.</P>
        </TermsSection>

        <TermsSection num="V · Brands & The Capsule" title="Brands are independent — and we don’t sell placement.">
          <P>Brands featured in The Capsule are <B>independent third parties</B>. Suede is not the seller and is not responsible for their products, sizing, shipping, returns, or customer service — your purchase is a transaction between you and the brand.</P>
          <P>We never accept paid placement in reviews or the directory, and brands receive only aggregate, anonymized insights — never your name, contact details, or individual measurements.</P>
        </TermsSection>

        <TermsSection num="VI · Intellectual Property" title="What belongs to Suede.">
          <P>The Suede name, logo, design, and the software behind the service are owned by Suede and protected by law. We grant you a limited, personal, non-transferable right to use Suede for its intended purpose. Please don’t copy, resell, scrape, reverse-engineer, or misuse the service or our branding.</P>
        </TermsSection>

        <TermsSection num="VII · Prohibited Uses" title="A few things you agree not to do.">
          <TBullets items={[
            'Break the law or infringe anyone’s rights while using Suede.',
            'Post false, misleading, or fraudulent content, including fake reviews.',
            'Attempt to access accounts, data, or systems you’re not authorized to.',
            'Scrape, harvest, or bulk-collect content or member data.',
            'Introduce malware, disrupt the service, or bypass security or usage limits.',
          ]} />
        </TermsSection>

        <TermsSection num="VIII · Disclaimers" title="Suede is provided “as is.”">
          <P>We work hard to make Suede reliable and useful, but the service is provided <B>“as is” and “as available,”</B> without warranties of any kind. We don’t guarantee that content is accurate, that fit recommendations will be right for you, or that the service will always be uninterrupted or error-free.</P>
        </TermsSection>

        <TermsSection num="IX · Limitation of Liability" title="The limits of our responsibility.">
          <P>To the fullest extent permitted by law, Suede is not liable for indirect, incidental, or consequential damages arising from your use of the service, including purchasing decisions made based on reviews or Suede Match. Nothing in these Terms limits any rights you have that can’t be limited by law.</P>
        </TermsSection>

        <TermsSection num="X · Termination" title="Ending your use of Suede.">
          <P>You can stop using Suede and delete your account at any time. We may suspend or terminate access if you violate these Terms or to protect the community, the service, or other members. Sections that by their nature should survive termination — such as content licenses already granted, intellectual property, disclaimers, and liability limits — will continue to apply.</P>
        </TermsSection>

        <TermsSection num="XI · Changes to the Service & Terms" title="Suede will evolve — and so may these Terms.">
          <P>We may update, add, or remove features as Suede grows, and we may revise these Terms from time to time. When we make material changes, we’ll update the date above and, where appropriate, notify you in the app or by email. Continuing to use Suede after an update means you accept the revised Terms.</P>
        </TermsSection>

        <TermsSection num="XII · Governing Law" title="Which laws apply.">
          <P>These Terms are governed by the laws of the United States and the state in which Suede is established, without regard to conflict-of-laws rules. If any part of these Terms is found unenforceable, the rest remains in effect.</P>
        </TermsSection>

        <TermsSection num="XIII · Contact Us" title="Questions about these Terms?">
          <P>We’re a small team and we read everything. Reach us directly and a person — not a bot — will respond.</P>
          <P><B>Suede · info@suedecapsule.com</B></P>
        </TermsSection>
      </div>
    </div>
  );
}
