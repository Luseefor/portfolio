'use client';

import { Palette } from 'lucide-react';
import ThemeDropdown from '@/components/home/ThemeDropdown';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

interface RouteThemeControlProps {
  className?: string;
}

export default function RouteThemeControl({ className }: RouteThemeControlProps) {
  const { currentTheme, setCurrentTheme, isDark, setIsDark } = useStore();
  const themeColor = getThemeColor(currentTheme, isDark);

  return (
    <div className={className}>
      <ThemeDropdown
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        isDark={isDark}
        toggleDark={() => setIsDark(!isDark)}
        themeColor={themeColor}
        renderTrigger={({ currentThemeName, themeColor: activeColor }) => (
          <div
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md transition ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/15'
                : 'border-slate-300/70 bg-white/90 text-slate-700 hover:border-slate-400/80'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: activeColor }}
            />
            <span className="hidden sm:inline">{currentThemeName}</span>
            <Palette size={11} />
          </div>
        )}
      />
    </div>
  );
}
