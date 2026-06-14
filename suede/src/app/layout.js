import "./globals.css";

export const metadata = {
  title: "Home | SUEDE",
  description: "The trust layer for fashion. Real reviews from real bodies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
