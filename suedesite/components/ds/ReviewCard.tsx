'use client';
import React from 'react';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { MeasurementSpec } from './MeasurementSpec';
import { Icon } from './Icon';

/* The Lookbook review card — reviewer lockup + measurement match, a fit
   photo with a "+N" stack badge, product/size, excerpt, brand wordmark,
   like/comment counts and the star score. */

export function ReviewCard({
  reviewer = {},
  measurements = {},
  product,
  size,
  excerpt,
  image,
  extraCount,
  brand,
  rating,
  likes,
  comments,
  onSeeFull,
  onReviewer,
  onBrand,
  hideMeasurements = false,
  match, // undefined = not computed (sample); null = self/none (hide); {score,confidence}
  style,
  ...rest
}: any) {
  const conf = match?.confidence as string | undefined;
  const matchDot = conf === 'high' ? 'var(--rating-positive)' : conf === 'medium' ? 'var(--denim)' : conf === 'low' ? 'var(--text-muted)' : 'var(--rating-positive)';
  const matchTip = match ? `${conf!.charAt(0).toUpperCase() + conf!.slice(1)} confidence · ${match.score}% match` : 'High Confidence';
  return (
    <article
      className="sd-reviewcard"
      style={{
        background: 'var(--surface-card)',
        borderRadius: 0,
        boxShadow: 'var(--shadow-card)',
        padding: 22,
        display: 'flex', flexDirection: 'column', gap: 18,
        ...style,
      }}
      {...rest}
    >
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span onClick={onReviewer} style={{ cursor: onReviewer ? 'pointer' : 'default' }}>
          <Avatar src={reviewer.avatar} name={reviewer.name} handle={reviewer.handle} size="sm" showName />
        </span>
        {!hideMeasurements && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <MeasurementSpec {...measurements} size="sm" tone="muted" />
          {match !== null && (
          <span style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '1'; t.style.pointerEvents = 'auto'; } }}
            onMouseLeave={(e) => { const t = e.currentTarget.querySelector('[data-tip]') as any; if (t) { t.style.opacity = '0'; t.style.pointerEvents = 'none'; } }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--text-muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: matchDot, flex: 'none' }} />Suede Match
            </span>
            <span data-tip style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, whiteSpace: 'nowrap', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 20 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)' }}>{matchTip}</span>
            </span>
          </span>
          )}
        </div>
        )}
      </div>

      {/* body: text + image */}
      <div className="sd-rc-body" style={{ display: 'grid', gridTemplateColumns: '1fr 132px', gap: 18, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div className="sd-rc-prodrow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{product}</span>
            {size && <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>Size: {size}</span>}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>
            {excerpt}
          </p>
          <button onClick={onSeeFull} style={{ alignSelf: 'flex-end', marginTop: 'auto', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            See Full Review
          </button>
        </div>
        <div style={{ position: 'relative', minWidth: 0, borderRadius: 0, overflow: 'hidden', aspectRatio: '3/4', background: 'var(--linen)' }}>
          {image && <img src={image} alt={product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {extraCount != null && (
            <span style={{ position: 'absolute', right: 8, bottom: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 'var(--radius-xs)', padding: '3px 7px', fontSize: 11, fontFamily: 'var(--font-body)' }}>
              <Icon name="plus" size={11} color="#fff" />{extraCount}
            </span>
          )}
        </div>
      </div>

      {/* footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', justifySelf: 'start' }}>
          {likes != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 13 }}><Icon name="heart" size={15} color="var(--text-muted)" />{likes}</span>}
          {comments != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 13 }}><Icon name="message" size={15} color="var(--text-muted)" />{comments}</span>}
        </div>
        {brand && <span onClick={onBrand} style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)', textTransform: 'uppercase', justifySelf: 'center', cursor: onBrand ? 'pointer' : 'default' }}>{brand}</span>}
        {rating != null && <span style={{ justifySelf: 'end' }}><StarRating value={rating} compact size={15} /></span>}
      </div>
    </article>
  );
}
