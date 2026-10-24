import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'VIBE — AI for Humanity | Train Passenger Social Discovery & Safety',
  description:
    'A journey-focused web platform helping train passengers voluntarily discover fellow travellers who share their interests, skills, and learning goals while keeping safety, privacy, and official support front and centre.',
  keywords: [
    'Train passenger community',
    'Indian Railways social discovery',
    'AI for humanity',
    'Skill sharing on trains',
    'Travel language exchange',
    'Safe train travel',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-screen text-slate-900 bg-slate-50 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
