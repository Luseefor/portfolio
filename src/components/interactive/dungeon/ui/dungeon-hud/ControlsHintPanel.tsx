'use client';

const CONTROL_HINTS: Array<{ key: string; label: string }> = [
  { key: 'WASD', label: 'Move' },
  { key: 'SHIFT', label: 'Run' },
  { key: 'SPACE', label: 'Jump' },
  { key: 'Q', label: 'Dash' },
  { key: 'C', label: 'Roll' },
  { key: 'R', label: 'Attack' },
  { key: 'M', label: 'Mute / Unmute' },
  { key: 'F1', label: 'Debug Overlay' },
  { key: 'ESC', label: 'Settings' },
  { key: 'Right Click', label: 'Unlock Pointer' },
];

export function ControlsHintPanel() {
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-30">
      <div className="space-y-1.5 text-[10px] uppercase tracking-wider text-stone-500">
        {CONTROL_HINTS.map((entry) => (
          <div key={entry.key} className="flex items-center gap-2">
            <span className="rounded border border-stone-700 bg-stone-800/80 px-1.5 py-0.5">{entry.key}</span>
            <span>{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
