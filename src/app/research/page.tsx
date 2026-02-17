'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, FileText, Lock, NotebookText, TriangleAlert } from 'lucide-react';
import RouteThemeControl from '@/components/shared/RouteThemeControl';
import ResearchErrorPanel from '@/components/research/ResearchErrorPanel';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';
import type { FeedResponse, ResearchItem, SourceFailure } from '@/lib/research/types';

type FetchError = {
  code: string;
  message: string;
};

function formatDateLabel(date?: string) {
  if (!date) return 'Unknown';
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(parsed));
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-8 text-center ${
        isDark ? 'border-white/10 bg-white/[0.02] text-slate-300' : 'border-black/10 bg-white/70 text-slate-600'
      }`}
    >
      <p className="text-sm uppercase tracking-[0.24em] font-terminal">No entries yet</p>
      <p className="mt-3 text-sm">Enable or add a source in the research admin panel to start rendering papers and blogs.</p>
    </div>
  );
}

function ResearchColumn({
  title,
  icon,
  items,
  isDark,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  items: ResearchItem[];
  isDark: boolean;
  accent: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span style={{ color: accent }}>{icon}</span>
        <h2 className={`text-lg font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 backdrop-blur-md ${
              isDark ? 'border-white/10 bg-black/40' : 'border-black/10 bg-white/80'
            }`}
            style={{ boxShadow: `0 0 24px ${hexToRgba(accent, 0.14)}` }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] font-terminal ${
                  isDark ? 'border-white/15 text-white/60' : 'border-black/10 text-slate-600'
                }`}
              >
                {item.sourceName}
              </span>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-terminal ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                {formatDateLabel(item.publishedAt)}
              </span>
            </div>
            <h3 className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {item.title}
            </h3>
            {item.summary ? (
              <p className={`mt-2 text-sm ${isDark ? 'text-slate-300/90' : 'text-slate-600'}`}>{item.summary}</p>
            ) : null}
            {item.tags && item.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={`${item.id}-${tag}`}
                    className={`rounded-full px-2 py-1 text-[10px] font-terminal uppercase tracking-[0.15em] ${
                      isDark ? 'bg-white/5 text-white/55' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-terminal uppercase tracking-[0.28em]"
              style={{ color: accent }}
            >
              Open
              <ExternalLink size={12} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ResearchPage() {
  const konamiUnlocked = useStore((state) => state.konamiUnlocked);
  const currentTheme = useStore((state) => state.currentTheme);
  const isDark = useStore((state) => state.isDark);
  const accent = useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [fetchError, setFetchError] = useState<FetchError | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/research/feed', {
        cache: 'no-store',
      });

      const payload = (await response.json()) as FeedResponse | { message?: string };

      if (!response.ok) {
        setFetchError({
          code: 'FEED_REQUEST',
          message: payload && 'message' in payload ? payload.message ?? 'Research feed request failed.' : 'Research feed request failed.',
        });
        setFeed(null);
        return;
      }

      const typedPayload = payload as FeedResponse;
      setFeed(typedPayload);
    } catch {
      setFetchError({
        code: 'FEED_REQUEST',
        message: 'Unable to connect to the research feed endpoint.',
      });
      setFeed(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!konamiUnlocked) return;
    void loadFeed();
  }, [konamiUnlocked, loadFeed]);

  if (!konamiUnlocked) {
    return (
      <main className="min-h-screen bg-black text-red-200 flex items-center justify-center px-6">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal text-red-200 hover:border-red-400 transition"
        >
          <ArrowLeft size={12} />
          Back
        </Link>
        <div className="max-w-xl w-full border border-red-700/50 bg-black/70 backdrop-blur-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/60">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">Research Access Locked</h1>
          <p className="mt-3 text-sm text-red-300/70">
            Unauthorized. Enter the correct sequence to unlock this archive.
          </p>
        </div>
      </main>
    );
  }

  const partialFailures: SourceFailure[] = feed?.meta.partialFailures ?? [];
  const papers = (feed?.items ?? []).filter((item) => item.type === 'paper');
  const blogs = (feed?.items ?? []).filter((item) => item.type === 'blog');
  const allSourcesFailed = (feed?.items.length ?? 0) === 0 && partialFailures.length > 0;

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

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className={`text-[11px] uppercase tracking-[0.4em] font-terminal ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
            Research Hub
          </p>
          <h1 className={`mt-2 text-3xl font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Papers + Blogs
          </h1>
          <p className={`mt-3 max-w-2xl text-sm ${isDark ? 'text-slate-300/90' : 'text-slate-600'}`}>
            Curated research entries pulled from your configured APIs. Add or modify providers in the admin panel.
          </p>
          <Link
            href="/research-admin"
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] font-terminal transition ${
              isDark
                ? 'border-white/15 bg-white/[0.03] text-white/75 hover:border-white/30'
                : 'border-black/15 bg-white text-slate-700 hover:border-black/30'
            }`}
          >
            Manage APIs
          </Link>
        </div>

        {fetchError ? (
          <ResearchErrorPanel
            code={fetchError.code}
            message={fetchError.message}
            isDark={isDark}
            accent={accent}
            onRetry={() => {
              void loadFeed();
            }}
          />
        ) : null}

        {allSourcesFailed ? (
          <ResearchErrorPanel
            code={partialFailures[0]?.code}
            message={partialFailures[0]?.message}
            isDark={isDark}
            accent={accent}
            onRetry={() => {
              void loadFeed();
            }}
          />
        ) : null}

        {!fetchError && !allSourcesFailed && partialFailures.length > 0 ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 ${
              isDark ? 'border-amber-500/30 bg-amber-900/10' : 'border-amber-500/30 bg-amber-50'
            }`}
          >
            <div className={`mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-terminal ${isDark ? 'text-amber-200/90' : 'text-amber-800'}`}>
              <TriangleAlert size={13} />
              Partial Source Failures
            </div>
            <ul className={`space-y-1 text-sm ${isDark ? 'text-amber-100/80' : 'text-amber-900/80'}`}>
              {partialFailures.map((failure) => (
                <li key={`${failure.sourceId}-${failure.code}`}>{failure.sourceName}: {failure.message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`h-44 animate-pulse rounded-2xl border ${
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white/80'
                }`}
              />
            ))}
          </div>
        ) : null}

        {!loading && !fetchError && !allSourcesFailed ? (
          papers.length === 0 && blogs.length === 0 ? (
            <EmptyState isDark={isDark} />
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ResearchColumn title="Research Papers" icon={<FileText size={18} />} items={papers} isDark={isDark} accent={accent} />
              <ResearchColumn title="Blogs" icon={<NotebookText size={18} />} items={blogs} isDark={isDark} accent={accent} />
            </div>
          )
        ) : null}
      </div>
    </main>
  );
}
