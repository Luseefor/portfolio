'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

type ResearchErrorCode =
  | 'SOURCE_TIMEOUT'
  | 'SOURCE_AUTH'
  | 'SOURCE_RATE_LIMIT'
  | 'SOURCE_NETWORK'
  | 'SOURCE_SCHEMA'
  | 'SOURCE_HTTP'
  | 'SOURCE_EMPTY'
  | 'FEED_REQUEST'
  | 'UNKNOWN';

type ErrorMeta = {
  title: string;
  description: string;
};

const ERROR_META: Record<ResearchErrorCode, ErrorMeta> = {
  SOURCE_TIMEOUT: {
    title: 'Source timeout',
    description: 'One or more source APIs timed out before responding.',
  },
  SOURCE_AUTH: {
    title: 'Source auth failure',
    description: 'At least one source is missing or using an invalid API credential.',
  },
  SOURCE_RATE_LIMIT: {
    title: 'Rate limit reached',
    description: 'A source API returned a rate-limit response. Try again shortly.',
  },
  SOURCE_NETWORK: {
    title: 'Network failure',
    description: 'A source API request could not be completed due to network errors.',
  },
  SOURCE_SCHEMA: {
    title: 'Mapping/schema error',
    description: 'Source data could not be mapped using its current configuration.',
  },
  SOURCE_HTTP: {
    title: 'Source HTTP error',
    description: 'A source API returned an unexpected HTTP status.',
  },
  SOURCE_EMPTY: {
    title: 'No entries mapped',
    description: 'Source responded but did not produce any valid mapped items.',
  },
  FEED_REQUEST: {
    title: 'Feed request failed',
    description: 'The research feed endpoint failed. Try again in a moment.',
  },
  UNKNOWN: {
    title: 'Unexpected error',
    description: 'An unexpected research error occurred.',
  },
};

interface ResearchErrorPanelProps {
  code?: string;
  message?: string;
  isDark: boolean;
  accent: string;
  onRetry?: () => void;
}

export default function ResearchErrorPanel({
  code,
  message,
  isDark,
  accent,
  onRetry,
}: ResearchErrorPanelProps) {
  const normalizedCode = (code as ResearchErrorCode) || 'UNKNOWN';
  const meta = ERROR_META[normalizedCode] ?? ERROR_META.UNKNOWN;

  return (
    <section
      className={`rounded-2xl border p-6 backdrop-blur-xl ${
        isDark ? 'border-red-500/30 bg-black/40' : 'border-red-500/30 bg-white/80'
      }`}
      style={{ boxShadow: `0 0 32px ${accent}22` }}
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-500/50">
        <AlertTriangle size={18} className={isDark ? 'text-red-200' : 'text-red-700'} />
      </div>
      <h2 className={`text-xl font-black uppercase tracking-[0.14em] ${isDark ? 'text-red-100' : 'text-red-700'}`}>
        {meta.title}
      </h2>
      <p className={`mt-2 text-sm ${isDark ? 'text-red-200/80' : 'text-red-700/80'}`}>{meta.description}</p>
      {message ? (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-xs font-terminal uppercase tracking-[0.2em] ${
            isDark
              ? 'border-red-500/30 bg-red-950/20 text-red-200/70'
              : 'border-red-400/40 bg-red-50 text-red-700/80'
          }`}
        >
          {message}
        </p>
      ) : null}
      {onRetry ? (
        <button
          onClick={onRetry}
          className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-terminal uppercase tracking-[0.3em] transition ${
            isDark
              ? 'border-red-500/40 text-red-200 hover:border-red-400'
              : 'border-red-400/60 text-red-700 hover:border-red-500'
          }`}
        >
          <RotateCcw size={12} />
          Retry
        </button>
      ) : null}
    </section>
  );
}
