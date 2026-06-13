import "./globals.css";

export const metadata = {
  title: "Suede — The trust layer for fashion",
  description: "Shop with intent. Real reviews from real bodies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
