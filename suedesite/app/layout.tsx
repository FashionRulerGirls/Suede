import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile-site.css';

const SITE_URL = 'https://suedecapsule.com';
const SITE_DESC =
  'The trust layer for fashion. Curated minority-owned and slow-fashion brands, vetted for sizing, quality, and design.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Suede — Discovery Site',
  description: SITE_DESC,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Suede',
    title: 'Suede — Discovery Site',
    description: SITE_DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suede — Discovery Site',
    description: SITE_DESC,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
