import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tribhuban Retailer Platform V1',
  description: 'Production Retailer Qualification, Survey, Relationship & Internal Management Platform for Tribhuban Concepts Pvt. Ltd.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
