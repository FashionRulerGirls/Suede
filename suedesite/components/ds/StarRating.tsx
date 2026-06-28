'use client';
import React from 'react';

/* Filled-ink star rating. Stars are ink (never gold) per Suede's palette.
   Supports fractional fill and a "compact" single-star + number form. */

function Star({ fill, size }: any) {
  // Stable id so SSR and client markup match (avoids hydration mismatch).
  const id = 'sg' + React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--rating-star)" />
          <stop offset={`${fill * 100}%`} stopColor="var(--ink-200)" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.2l2.66 5.7 6.14.72-4.6 4.2 1.24 6.06L12 16.9l-5.48 2.98 1.24-6.06-4.6-4.2 6.14-.72z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

export function StarRating({
  value = 0,
  max = 5,
  size = 16,
  showValue = false,
  compact = false,
  reviews,
  style,
  ...rest
}: any) {
  const labelStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: size * 0.92,
    color: 'var(--text-primary)',
    letterSpacing: 'var(--ls-wide)',
    lineHeight: 1,
  };
  if (compact) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, ...style }} {...rest}>
        <Star fill={1} size={size} />
        <span style={labelStyle}>{value.toFixed(1)}</span>
        {reviews != null && (
          <span style={{ ...labelStyle, color: 'var(--text-muted)', fontSize: size * 0.82 }}>
            ({reviews} {reviews === 1 ? 'Review' : 'Reviews'})
          </span>
        )}
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, ...style }} {...rest}>
      <span style={{ display: 'inline-flex', gap: 3 }}>
        {Array.from({ length: max }).map((_, i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, value - i))} size={size} />
        ))}
      </span>
      {showValue && <span style={labelStyle}>{value.toFixed(1)}</span>}
      {reviews != null && (
        <span style={{ ...labelStyle, color: 'var(--text-muted)', fontSize: size * 0.82 }}>
          ({reviews})
        </span>
      )}
    </span>
  );
}
