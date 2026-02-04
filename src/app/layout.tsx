import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-terminal',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rijan Ghimire',
  description: "Welcome to Rijan Ghimire's Portfolio",
  icons: {
    icon: '/favicon.png',
  },
};

import GlobalEffects from '@/components/shared/GlobalEffects';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased select-none`}>
        <GlobalEffects />
        {children}
      </body>
    </html>
  );
}
