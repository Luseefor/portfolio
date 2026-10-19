import type { ReactNode } from 'react';
import Link from 'next/link';

export default function DetailShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-16">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
      >
        ← Rijan Ghimire / Portfolio
      </Link>
      <article className="mt-10 space-y-8">{children}</article>
    </main>
  );
}
