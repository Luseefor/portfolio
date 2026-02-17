'use client';

import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type RangeSettingProps = {
  label: string;
  valueText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  iconPath: string;
  theme: DungeonUiThemePalette;
  onChange: (value: number) => void;
};

export function RangeSetting({
  label,
  valueText,
  min,
  max,
  step,
  value,
  iconPath,
  theme,
  onChange,
}: RangeSettingProps) {
  return (
    <div>
      <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accentMuted }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
          {label}
        </span>
        <span className="font-mono" style={{ color: theme.accentText }}>
          {valueText}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-700/50"
        style={{ accentColor: theme.accent }}
      />
    </div>
  );
}
