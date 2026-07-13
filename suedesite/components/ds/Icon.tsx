'use client';
import React from 'react';

/* Suede icon set — thin geometric line icons (Lucide-equivalent geometry,
   24×24, 1.5 stroke) plus a few brand glyphs. Self-contained: no CDN. */

const PATHS = {
  search:    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  sliders:   '<path d="M4 6h11M19 6h1M4 12h1M9 12h11M4 18h7M15 18h5"/><circle cx="17" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>',
  menu:      '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close:     '<path d="M18 6 6 18M6 6l12 12"/>',
  bell:      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  eye:       '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6A13.1 13.1 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  star:      '<path d="M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 17l-5.3 3 1.2-6L3.4 9.8l6-.7Z"/>',
  ruler:     '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  'thumbs-up':'<path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/><path d="M7 10l4-7a2.5 2.5 0 0 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.3 7a2 2 0 0 1-2 1.7H7"/>',
  heart:     '<path d="M12 20s-7-4.4-9.3-8.3A5 5 0 0 1 12 6a5 5 0 0 1 9.3 5.7C19 15.6 12 20 12 20Z"/>',
  message:   '<path d="M21 11.5a8 8 0 0 1-11.7 7L3 21l2.5-6.3A8 8 0 1 1 21 11.5Z"/>',
  user:      '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  'user-plus':'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M22 11h-6"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  'chevron-right':'<path d="m9 6 6 6-6 6"/>',
  'chevron-left':'<path d="m15 6-6 6 6 6"/>',
  'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-left':'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check:     '<path d="m5 12 5 5L20 6"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  grid:      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  inbox:     '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5Z"/>',
  reviews:   '<path d="M21 11.5a8 8 0 0 1-11.7 7L3 21l2.5-6.3A8 8 0 1 1 21 11.5Z"/><path d="M12 7.4 12.8 9.7 15.2 9.8 13.3 11.2 14 13.6 12 12.2 10 13.6 10.7 11.2 8.8 9.8 11.2 9.7Z"/>',
  logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  pen:       '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  google:    '<path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="currentColor" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5a6 6 0 0 1-9-3.2H3.1v2.6A10 10 0 0 0 12 22Z" fill="currentColor" stroke="none"/><path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9Z" fill="currentColor" stroke="none"/><path d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6a6 6 0 0 1 5.6-4Z" fill="currentColor" stroke="none"/>',
  apple:     '<path d="M16 2c.1 1.1-.3 2.2-1 3-0.7.9-1.9 1.6-3 1.5-.2-1.1.3-2.2 1-3C13.7 2.6 15 1.9 16 2Z" fill="currentColor" stroke="none"/><path d="M20.5 16.5c-.5 1.3-.8 1.8-1.5 2.9-1 1.5-2.4 3.4-4.1 3.4-1.5 0-1.9-1-4-1s-2.5 1-4 1c-1.7 0-3-1.7-4-3.2-2.7-4.2-3-9.2-1.3-11.8C8.7 8 10.3 7 11.8 7c1.6 0 2.5 1 4 1 1.3 0 2.1-1 4-1 1.3 0 2.7.7 3.7 2-3.2 1.8-2.7 6.4-3 7.5Z" fill="currentColor" stroke="none"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  tiktok:    '<path d="M15 4c.5 2.4 2 4 4.5 4.2v2.8c-1.6 0-3.1-.5-4.5-1.4v6.1A5.7 5.7 0 1 1 9 10.1v2.9a2.8 2.8 0 1 0 2 2.7V4Z" fill="currentColor" stroke="none"/>',
  hanger:    '<path d="M12 4a2 2 0 1 0-1.6 3.2c.4.5.6 1 .6 1.8M3 18l9-5 9 5a1 1 0 0 1-.5 1.9H3.5A1 1 0 0 1 3 18Z"/>',
  shirt:     '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>',
  pause:     '<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none"/>',
  play:      '<path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none"/>',
  lock:      '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  mail:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  globe:     '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/>',
  sparkle:   '<path d="M12 3l1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5 10.1 8.6 12 3Z"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  image:     '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  camera:    '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/>',
  upload:    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  refresh:   '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
};

export function Icon({ name, size = 20, stroke = 1.5, color = 'currentColor', style, className, ...rest }: any) {
  const d = PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flex: 'none', display: 'block', ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: d || '' }}
      {...rest}
    />
  );
}
