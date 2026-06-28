'use client';
import React from 'react';

/* Full-bleed editorial banner — a black (or paper) bar with widely
   letter-spaced uppercase text. Suede uses these as manifesto rules
   between sections ("CURATED COLLECTION OF MINORITY-OWNED... BRANDS"). */

export function EditorialBanner({ children, tone = 'ink', size = 'md', scroll = false, style, ...rest }: any) {
  const palette = {
    ink:   { background: 'var(--ink-900)', color: 'var(--white)' },
    paper: { background: 'var(--linen)', color: 'var(--text-primary)' },
  }[tone];
  const fs = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const py = size === 'sm' ? 14 : size === 'lg' ? 26 : 20;

  const textStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: fs,
    letterSpacing: 'var(--ls-widest)',
    textTransform: 'uppercase',
    lineHeight: 1.4,
  };

  if (scroll) {
    const item = (
      <span style={{ ...textStyle, paddingRight: 64, flex: 'none' }}>{children}</span>
    );
    return (
      <div
        style={{ width: '100%', padding: `${py}px 0`, overflow: 'hidden', ...palette, ...style }}
        {...rest}
      >
        <style>{`@keyframes editorialMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        <div style={{ display: 'flex', width: 'max-content', whiteSpace: 'nowrap', animation: 'editorialMarquee 80s linear infinite' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        padding: `${py}px 24px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        ...palette,
        ...style,
      }}
      {...rest}
    >
      <span style={textStyle}>
        {children}
      </span>
    </div>
  );
}
