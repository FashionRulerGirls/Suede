import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile-site.css';

export const metadata: Metadata = {
  title: 'Suede — Discovery Site',
  description:
    'The trust layer for fashion. Curated minority-owned and slow-fashion brands, vetted for sizing, quality, and design.',
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
