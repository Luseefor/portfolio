import type { Metadata } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { portfolioData } from '@/content/portfolio';

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans-ui',
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display-ui',
  weight: ['500', '600', '700'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono-ui',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rijan.sh'),
  alternates: { canonical: '/' },
  title: portfolioData.seo.title,
  description: portfolioData.seo.description,
  authors: [{ name: portfolioData.hero.name }],
  keywords: [...portfolioData.seo.keywords],
  robots: { index: true, follow: true },
  openGraph: {
    title: portfolioData.seo.title,
    description: portfolioData.seo.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolioData.seo.title,
    description: portfolioData.seo.description,
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
