'use client';

import { Palette } from 'lucide-react';
import ThemeDropdown from '@/components/home/ThemeDropdown';
import { useStore } from '@/utils/store';
import { getThemeColor } from '@/utils/themes';

interface RouteThemeControlProps {
  className?: string;
}

export default function RouteThemeControl({ className }: RouteThemeControlProps) {
  const {
    currentTheme,
    setCurrentTheme,
    isDark,
    setIsDark,
    konamiUnlocked,
    konamiEnabled,
    setKonamiEnabled,
  } = useStore();
  const themeColor = getThemeColor(currentTheme, isDark);

  return (
    <div className={className}>
      <ThemeDropdown
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        isDark={isDark}
        toggleDark={() => setIsDark(!isDark)}
        themeColor={themeColor}
        konamiUnlocked={konamiUnlocked}
        konamiEnabled={konamiEnabled}
        onKonamiToggle={setKonamiEnabled}
        renderTrigger={({ currentThemeName, themeColor: activeColor }) => (
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] backdrop-blur-md transition ${
              isDark
                ? 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                : 'border-black/10 bg-white/80 text-slate-700 hover:border-black/20'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeColor, boxShadow: `0 0 8px ${activeColor}` }}
            />
            <span className="hidden sm:inline">{currentThemeName}</span>
            <Palette size={11} />
          </div>
        )}
      />
    </div>
  );
}
