'use client';

import { useEffect, useState } from 'react';
import { Activity, GitBranch, CalendarClock } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '@/components/identity/portfolio-template';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

type ActivityPayload = {
  summary: {
    totalCommits: number;
    activeDays: number;
    activeRepos: number;
    publicRepos: number;
  };
  events: Array<{
    id: string;
    title: string;
    description: string;
    dateLabel: string;
  }>;
  message?: string;
};

const EMPTY_PAYLOAD: ActivityPayload = {
  summary: {
    totalCommits: 0,
    activeDays: 0,
    activeRepos: 0,
    publicRepos: 0,
  },
  events: [],
};

export default function ActivityPanel({ theme }: ChestPanelTemplateProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ActivityPayload>(EMPTY_PAYLOAD);
  const activityLabels = PORTFOLIO_CONTENT.activity.focusAreas;

  useEffect(() => {
    let isCancelled = false;

    const loadActivity = async () => {
      try {
        const response = await fetch('/api/engineering-activity', { cache: 'no-store' });
        const payload = (await response.json()) as ActivityPayload;
        if (!isCancelled) {
          setData({
            summary: payload.summary ?? EMPTY_PAYLOAD.summary,
            events: payload.events ?? [],
            message: payload.message,
          });
        }
      } catch {
        if (!isCancelled) {
          setData({ ...EMPTY_PAYLOAD, message: 'Unable to load activity telemetry.' });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: activityLabels[0] ?? 'Commits',
            value: data.summary.totalCommits,
          },
          {
            label: activityLabels[1] ?? 'Active Days',
            value: data.summary.activeDays,
          },
          {
            label: activityLabels[2] ?? 'Active Repos',
            value: data.summary.activeRepos,
          },
          {
            label: activityLabels[3] ?? 'Public Repos',
            value: data.summary.publicRepos,
          },
        ].map((item, index) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-black/35 p-3"
            style={{ boxShadow: index % 2 === 0 ? `0 0 16px ${theme.accentGlow}` : undefined }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-terminal"
              style={{ color: theme.accentMuted }}
            >
              {item.label}
            </p>
            <p className="mt-1 text-xl font-black text-stone-100">{loading ? '...' : item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/45 to-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
          <Activity size={12} />
          Recent Activity
        </div>

        {loading ? (
          <p className="text-sm text-stone-300">Loading engineering telemetry...</p>
        ) : data.events.length === 0 ? (
          <p className="text-sm text-stone-300">{data.message ?? 'No recent events available.'}</p>
        ) : (
          <div className="space-y-3">
            {data.events.slice(0, 3).map((event, index) => (
              <div key={event.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-100">{event.title}</p>
                  <span className="text-[10px] uppercase tracking-[0.18em] font-terminal" style={{ color: theme.accent }}>
                    {event.dateLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-300">{event.description}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-terminal text-stone-500">
                  {index % 2 === 0 ? <GitBranch size={10} /> : <CalendarClock size={10} />}
                  Live signal
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
