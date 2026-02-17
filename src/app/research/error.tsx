'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RouteThemeControl from '@/components/shared/RouteThemeControl';
import ResearchErrorPanel from '@/components/research/ResearchErrorPanel';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

type ErrorPayload = {
  code?: string;
  message?: string;
};

function extractError(error: Error): ErrorPayload {
  if (!error.message) {
    return { code: 'UNKNOWN', message: 'Unknown route error.' };
  }

  try {
    const parsed = JSON.parse(error.message) as ErrorPayload;
    if (parsed && (parsed.code || parsed.message)) {
      return {
        code: parsed.code ?? 'UNKNOWN',
        message: parsed.message ?? 'Unknown route error.',
      };
    }
  } catch {
    // fallback to plain message
  }

  return {
    code: 'UNKNOWN',
    message: error.message,
  };
}

export default function ResearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const currentTheme = useStore((state) => state.currentTheme);
  const isDark = useStore((state) => state.isDark);
  const accent = getThemeColor(currentTheme, isDark);
  const payload = extractError(error);

  return (
    <main
      className={`relative min-h-screen px-6 py-16 ${isDark ? 'text-white' : 'text-slate-900'}`}
      style={{
        backgroundColor: isDark ? '#050507' : '#f8fafc',
        backgroundImage: `radial-gradient(circle at 30% 10%, ${hexToRgba(accent, isDark ? 0.2 : 0.16)} 0%, transparent 45%)`,
      }}
    >
      <Link
        href="/"
        className={`absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal transition ${
          isDark
            ? 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/30'
            : 'border-black/10 bg-white/80 text-slate-700 hover:border-black/30'
        }`}
      >
        <ArrowLeft size={12} style={{ color: accent }} />
        Back
      </Link>

      <RouteThemeControl className="absolute right-6 top-6" />

      <div className="mx-auto mt-20 max-w-3xl">
        <ResearchErrorPanel
          code={payload.code}
          message={payload.message}
          isDark={isDark}
          accent={accent}
          onRetry={reset}
        />
      </div>
    </main>
  );
}
