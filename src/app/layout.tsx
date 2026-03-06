import type { Metadata } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';

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
  title: 'Rijan Ghimire | Software Engineer',
  description:
    'Software engineer portfolio featuring product work, applied AI projects, and an interactive technical demo.',
  openGraph: {
    title: 'Rijan Ghimire | Software Engineer',
    description:
      'Software engineer portfolio featuring product work, applied AI projects, and an interactive technical demo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rijan Ghimire | Software Engineer',
    description:
      'Software engineer portfolio featuring product work, applied AI projects, and an interactive technical demo.',
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
      <body className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
