import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suede — Discovery Site',
  description:
    'The trust layer for fashion. Curated minority-owned and slow-fashion brands, vetted for sizing, quality, and design.',
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
