import type { Metadata } from 'next';
import './globals.css';

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
      <body className="antialiased select-none">
        <GlobalEffects />
        {children}
      </body>
    </html>
  );
}
