'use client';

import { useEffect, useMemo, useState } from 'react';
import { Github } from 'lucide-react';

type GitHubActivityEvent = {
  id: string;
  title: string;
  kind: string;
  repo: string | null;
  createdAt: string | null;
};

type GitHubActivitySummary = {
  totalEvents: number;
  activeDays: number;
  topRepo: string | null;
  latestEvent: string | null;
};

type GitHubDailyCount = {
  date: string;
  count: number;
};

type GitHubActivityProps = {
  accent: string;
  subtleBorder: string;
  mutedText: string;
  metaText: string;
  githubUrl?: string;
};

function formatDateLabel(createdAt: string | null) {
  if (!createdAt) return 'Recent';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatChartLabel(dateInput: string) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput.slice(-2);
  return new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
}

function makeZeroCadence() {
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (13 - index));
    return { date: day.toISOString().slice(0, 10), count: 0 };
  });
}

function getTopEventKind(events: GitHubActivityEvent[]) {
  if (events.length === 0) return null;
  const frequency = new Map<string, number>();
  for (const event of events) {
    frequency.set(event.kind, (frequency.get(event.kind) ?? 0) + 1);
  }
  return [...frequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export default function GitHubActivity({
  accent,
  subtleBorder,
  mutedText,
  metaText,
  githubUrl = 'https://github.com/Luseefor',
}: GitHubActivityProps) {
  const [events, setEvents] = useState<GitHubActivityEvent[]>([]);
  const [summary, setSummary] = useState<GitHubActivitySummary | null>(null);
  const [dailyCounts, setDailyCounts] = useState<GitHubDailyCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      try {
        const response = await fetch('/api/github-activity');
        if (!response.ok) return;

        const payload = (await response.json()) as {
          events?: GitHubActivityEvent[];
          summary?: GitHubActivitySummary;
          dailyCounts?: GitHubDailyCount[];
        };

        if (!isMounted) return;
        if (payload.events) setEvents(payload.events);
        if (payload.summary) setSummary(payload.summary);
        if (payload.dailyCounts) setDailyCounts(payload.dailyCounts);
      } catch {
        // Keep empty fallback state.
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadActivity();
    return () => {
      isMounted = false;
    };
  }, []);

  const cadence = dailyCounts.length > 0 ? dailyCounts : makeZeroCadence();
  const totalCadenceCount = cadence.reduce((sum, entry) => sum + entry.count, 0);
  const activeDays14 = cadence.filter((entry) => entry.count > 0).length;
  const avgDaily = cadence.length > 0 ? totalCadenceCount / cadence.length : 0;
  const maxCadenceCount = Math.max(...cadence.map((entry) => entry.count), 1);
  const topKind = getTopEventKind(events);

  const topMetrics = useMemo(
    () => [
      { label: 'Past 14 Days', value: `${activeDays14}/14 active days` },
      { label: 'Daily Output', value: `${avgDaily.toFixed(1)} avg contributions/day` },
      { label: 'Primary Mode', value: topKind ? `${topKind} activity` : 'Recent GitHub activity' },
      { label: 'Current Focus', value: summary?.topRepo ?? 'Cross-repo contribution work' },
    ],
    [activeDays14, avgDaily, topKind, summary?.topRepo],
  );

  return (
    <div className="min-w-0">
      <div className="grid gap-4 sm:grid-cols-2">
        {topMetrics.map((metric) => (
          <article key={metric.label} className="border-t py-4" style={{ borderColor: subtleBorder }}>
            <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              {metric.label}
            </p>
            <p className="mt-2 text-[1.8rem] font-medium leading-tight">{metric.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 border-t pt-5" style={{ borderColor: subtleBorder }}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border-t py-4" style={{ borderColor: subtleBorder }}>
            <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              Recent events
            </p>
            <p className="mt-2 text-[1rem] leading-7" style={{ color: mutedText }}>
              {summary?.totalEvents ?? totalCadenceCount}
            </p>
          </div>
          <div className="border-t py-4" style={{ borderColor: subtleBorder }}>
            <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              Active days
            </p>
            <p className="mt-2 text-[1rem] leading-7" style={{ color: mutedText }}>
              {activeDays14} in the last 14
            </p>
          </div>
          <div className="border-t py-4" style={{ borderColor: subtleBorder }}>
            <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              Most active repo
            </p>
            <p className="mt-2 text-[1rem] leading-7 break-all" style={{ color: mutedText }}>
              {summary?.topRepo ?? 'Mixed repositories'}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-5" style={{ borderColor: subtleBorder }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              14-day cadence
            </p>
            <p className="text-xs" style={{ color: metaText }}>
              Hover bars to inspect daily count
            </p>
          </div>

          <div className="grid h-32 grid-cols-14 items-end gap-2">
            {cadence.map((entry) => {
              const barTrackHeight = 82;
              const minBarHeight = entry.count > 0 ? 10 : 5;
              const normalized = Math.sqrt(entry.count / maxCadenceCount);
              const barHeightPx = Math.max(Math.round(normalized * barTrackHeight), minBarHeight);
              const isHovered = hoveredDay === entry.date;
              const valueLabel = `${entry.count} contribution${entry.count === 1 ? '' : 's'}`;

              return (
                <div key={entry.date} className="flex h-full min-w-0 flex-col items-center justify-end">
                  <div className="mb-1 h-4 text-[11px] leading-none" style={{ color: metaText }}>
                    {isHovered ? entry.count : ''}
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-[2px] transition-all duration-150"
                    style={{
                      height: `${barHeightPx}px`,
                      backgroundColor: isHovered ? accent : mutedText,
                      opacity: isHovered ? 0.95 : 0.72,
                    }}
                    title={valueLabel}
                    aria-label={`${formatChartLabel(entry.date)}: ${valueLabel}`}
                    onMouseEnter={() => setHoveredDay(entry.date)}
                    onFocus={() => setHoveredDay(entry.date)}
                    onMouseLeave={() => setHoveredDay((current) => (current === entry.date ? null : current))}
                    onBlur={() => setHoveredDay((current) => (current === entry.date ? null : current))}
                  />
                  <span className="mt-2 text-[11px]" style={{ color: metaText }}>
                    {formatChartLabel(entry.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5" style={{ borderColor: subtleBorder }}>
          <p className="font-terminal text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
            Recent GitHub activity
          </p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: accent }}
          >
            <Github size={15} />
            GitHub
          </a>
        </div>

        <div className="mt-4">
          {events.length > 0 ? (
            events.map((event, index) => (
              <article
                key={event.id}
                className={`grid gap-3 border-t py-5 md:grid-cols-[0.18fr_0.82fr] ${
                  index === events.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: subtleBorder }}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.18em]" style={{ color: metaText }}>
                    {formatDateLabel(event.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold">{event.title}</p>
                  <p className="mt-2 text-sm leading-7" style={{ color: mutedText }}>
                    {event.repo ? `${event.kind} activity on ${event.repo}.` : `${event.kind} activity.`}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <article className="border-y py-5" style={{ borderColor: subtleBorder }}>
              <p className="text-sm" style={{ color: mutedText }}>
                {isLoading
                  ? 'Loading GitHub activity...'
                  : 'No recent public GitHub events available right now.'}
              </p>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
