'use client';
/* Suede — product link + "Fetch" control. Pulls name / image / brand / price
   from a pasted product URL via /api/fetch-product and shows a preview. */
import React from 'react';
import { Button, Input, Icon } from '@/components/ds';
import { fetchProduct, type FetchedProduct } from '@/lib/fetchProduct';

export function ProductFetch({
  placeholder = 'https://example.com/product',
  onFetched,
}: {
  placeholder?: string;
  onFetched?: (p: FetchedProduct) => void;
}) {
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [product, setProduct] = React.useState<FetchedProduct | null>(null);

  const run = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const p = await fetchProduct(url.trim());
      setProduct(p);
      onFetched?.(p);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); run(); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ flex: 1 }}>
          <Input
            variant="outline"
            placeholder={placeholder}
            value={url}
            onChange={(e: any) => setUrl(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </span>
        <Button variant="primary" onClick={run} disabled={loading || !url.trim()}>
          {loading ? 'Fetching…' : 'Fetch'}
        </Button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--rating-critical)' }}>
          <Icon name="info" size={15} color="var(--rating-critical)" />
          <span>{error}</span>
        </div>
      )}

      {product && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, padding: 14, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', background: 'var(--linen)' }}>
          <span style={{ width: 56, height: 70, flex: 'none', background: 'var(--surface-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.image
              ? <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Icon name="image" size={18} color="var(--text-muted)" />}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            {product.brand && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{product.brand}</div>
            )}
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title || 'Product found'}</div>
            {product.price && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{product.price}</div>
            )}
          </div>
          <Icon name="check" size={18} color="var(--ink-900)" />
        </div>
      )}
    </div>
  );
}
