'use client';
import React from 'react';
import { StarRating } from './StarRating';
import { Button } from './Button';
import { Icon } from './Icon';

/* Capsule directory brand card — a model cutout floating on paper, the
   brand wordmark, an optional tagline, rating, and reviews/followers meta.
   `layout="feature"` adds the Explore CTA and stat columns (directory);
   `layout="tile"` is the compact carousel cell (landing). */

export function BrandCard({
  name,
  tagline,
  image,
  rating,
  reviews,
  followers,
  layout = 'tile',
  onExplore,
  onFollow,
  onEdit,
  onView,
  style,
  ...rest
}: any) {
  const feature = layout === 'feature';
  return (
    <article
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: feature ? 18 : 14,
        textAlign: 'center',
        ...style,
      }}
      {...rest}
    >
      <div onClick={onView} style={{ width: '100%', aspectRatio: feature ? '3/4' : '3/4', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', cursor: onView ? 'pointer' : 'default' }}>
        {image && <img src={image} alt={name} style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 18px 30px rgba(20,18,15,0.12))' }} />}
      </div>

      <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-regular)', fontSize: feature ? 24 : 20, letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-heading)', margin: 0 }}>
        <span onClick={onView} style={{ cursor: onView ? 'pointer' : 'default' }}>{name}</span>
        {feature && (
          <span role="button" aria-label={`Follow ${name}`} onClick={(e) => { e.stopPropagation(); onFollow && onFollow(); }} style={{ display: 'inline-flex', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Icon name="user-plus" size={18} />
          </span>
        )}
        {feature && (
          <span role="button" aria-label={`Explore ${name}`} onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }} style={{ display: 'inline-flex', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Icon name="pen" size={17} />
          </span>
        )}
      </h3>

      {tagline && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0, maxWidth: 220 }}>
          {tagline}
        </p>
      )}

      {rating != null && <StarRating value={rating} size={15} />}

      {(reviews != null || followers != null) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
          {reviews != null && <span>{reviews} Reviews</span>}
          {followers != null && <span>{followers} Followers</span>}
        </div>
      )}

      {feature && onExplore && (
        <Button size="sm" onClick={onExplore} style={{ marginTop: 2 }}>Explore</Button>
      )}
    </article>
  );
}
