'use client';

import { useMemo } from 'react';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';

export type DungeonUiThemePalette = {
  accent: string;
  accentText: string;
  accentMuted: string;
  accentBorder: string;
  accentBorderStrong: string;
  accentBgSoft: string;
  accentBgStrong: string;
  accentGlow: string;
  accentGlowStrong: string;
};

export function useDungeonUiTheme() {
  const currentTheme = useStore((state) => state.currentTheme);
  const isDark = useStore((state) => state.isDark);

  return useMemo<DungeonUiThemePalette>(() => {
    const accent = getThemeColor(currentTheme, isDark);
    return {
      accent,
      accentText: hexToRgba(accent, 0.95),
      accentMuted: hexToRgba(accent, 0.72),
      accentBorder: hexToRgba(accent, 0.34),
      accentBorderStrong: hexToRgba(accent, 0.5),
      accentBgSoft: hexToRgba(accent, 0.12),
      accentBgStrong: hexToRgba(accent, 0.2),
      accentGlow: hexToRgba(accent, 0.22),
      accentGlowStrong: hexToRgba(accent, 0.35),
    };
  }, [currentTheme, isDark]);
}
