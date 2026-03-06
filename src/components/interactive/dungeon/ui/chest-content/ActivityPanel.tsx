'use client';

import { Activity, GitBranch, CalendarClock } from 'lucide-react';
import { portfolioData } from '@/content/portfolio';
import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function ActivityPanel({ theme }: ChestPanelTemplateProps) {
  const metrics = portfolioData.activity.metrics;
  const events = portfolioData.activity.events;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: metrics[0]?.label ?? 'Delivery Mode',
            value: metrics[0]?.value ?? 'Product',
          },
          {
            label: metrics[1]?.label ?? 'Strength',
            value: metrics[1]?.value ?? 'Systems',
          },
          {
            label: metrics[2]?.label ?? 'Edge',
            value: metrics[2]?.value ?? 'Frontend',
          },
          {
            label: metrics[3]?.label ?? 'Fit',
            value: metrics[3]?.value ?? 'Product',
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
            <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-stone-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/45 to-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-terminal" style={{ color: theme.accentMuted }}>
          <Activity size={12} />
          Recent Activity
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-stone-300">No recent activity highlights available.</p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 3).map((event, index) => (
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
