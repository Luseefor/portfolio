'use client';

import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { QUALITY_OPTIONS } from './constants';

type QualitySettingProps = {
  graphicsQuality: 'low' | 'medium' | 'high';
  onChange: (quality: 'low' | 'medium' | 'high') => void;
  theme: DungeonUiThemePalette;
};

export function QualitySetting({ graphicsQuality, onChange, theme }: QualitySettingProps) {
  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accentMuted }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Graphics Quality
      </label>
      <div className="grid grid-cols-3 gap-2">
        {QUALITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${
              graphicsQuality === option.value
                ? 'text-white'
                : 'border-stone-700/50 bg-stone-800/50 text-stone-400 hover:border-stone-600 hover:bg-stone-700/50'
            }`}
            style={
              graphicsQuality === option.value
                ? {
                    borderColor: theme.accentBorderStrong,
                    backgroundColor: theme.accentBgStrong,
                    boxShadow: `0 0 12px ${theme.accentGlow}`,
                  }
                : undefined
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
