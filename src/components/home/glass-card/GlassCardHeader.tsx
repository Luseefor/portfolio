'use client';

import type { LucideIcon } from 'lucide-react';

type GlassCardHeaderProps = {
  badge: string;
  Icon: LucideIcon;
  isActiveState: boolean;
  isDark: boolean;
  themeColor: string;
};

export function GlassCardHeader({ badge, Icon, isActiveState, isDark, themeColor }: GlassCardHeaderProps) {
  return (
    <div className="mb-4 flex justify-between items-start md:mb-6">
      <span
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[8px] font-black tracking-[0.2em] uppercase transition-colors md:px-4 md:text-[10px] font-terminal"
        style={{
          borderColor: isActiveState ? `${themeColor}40` : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          backgroundColor: isActiveState ? `${themeColor}10` : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          color: isActiveState ? themeColor : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
        }}
      >
        {badge}
      </span>
      <div
        className="transition-all duration-500"
        style={{ color: isActiveState ? themeColor : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        <Icon size={32} strokeWidth={1.5} className="md:w-12 md:h-12" />
      </div>
    </div>
  );
}
