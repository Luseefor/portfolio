'use client';

import React from 'react';
import { ArrowUpRight, Layers, ShieldCheck } from 'lucide-react';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

export default function TimeLocationCard() {
  const { currentTheme, isDark } = useStore();
  const themeColor = React.useMemo(
    () => getThemeColor(currentTheme, isDark),
    [currentTheme, isDark],
  );

  return (
    <div className="p-8 h-full flex flex-col justify-between relative z-10 transition-colors duration-500">
      <div className="space-y-6">
        <div>
          <h3 className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
            Impact // Highlights
          </h3>
          <p
            className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
          >
            Systems that ship fast and scale cleanly
          </p>
          <div className="text-[11px] text-slate-500 mt-2 tracking-wide">
            Focused on reliability, performance, and measurable outcomes.
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: Layers, label: 'End-to-end builds', value: 'Discovery → Launch' },
            { icon: ShieldCheck, label: 'Stability first', value: 'Observability + hardening' },
            { icon: ArrowUpRight, label: 'Business impact', value: 'Latency ↓, conversion ↑' },
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              style={{ boxShadow: index === 0 ? `0 0 18px ${themeColor}12` : undefined }}
            >
              <item.icon size={14} style={{ color: themeColor }} className="mt-0.5" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </div>
                <div className="text-sm text-slate-200">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-auto pt-4">
        <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded border border-white/5 bg-white/[0.02]">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: themeColor }}
            ></span>
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: themeColor }}
            ></span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Signal: <span className="text-white">Open to work</span>
          </span>
        </div>
      </div>
    </div>
  );
}
