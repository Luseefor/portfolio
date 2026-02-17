'use client';

import { MINIMAP_GRID_STEP, MINIMAP_HEIGHT, MINIMAP_WIDTH } from './constants';

export function MinimapGrid() {
  return (
    <>
      <defs>
        <radialGradient id="minimap-bg-glow" cx="50%" cy="50%" r="85%">
          <stop offset="0%" stopColor="rgba(32,38,44,0.35)" />
          <stop offset="100%" stopColor="rgba(6,8,10,0.95)" />
        </radialGradient>
        <filter id="beam-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.1" />
        </filter>
      </defs>

      <rect
        x={0}
        y={0}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        fill="url(#minimap-bg-glow)"
        stroke="rgba(148,163,184,0.22)"
        strokeWidth={1}
        rx={8}
      />

      {Array.from({ length: Math.floor(MINIMAP_WIDTH / MINIMAP_GRID_STEP) }).map((_, index) => {
        const x = (index + 1) * MINIMAP_GRID_STEP;
        return (
          <line
            key={`grid-v-${x}`}
            x1={x}
            y1={1}
            x2={x}
            y2={MINIMAP_HEIGHT - 1}
            stroke="rgba(148,163,184,0.08)"
            strokeWidth={0.6}
          />
        );
      })}

      {Array.from({ length: Math.floor(MINIMAP_HEIGHT / MINIMAP_GRID_STEP) }).map((_, index) => {
        const y = (index + 1) * MINIMAP_GRID_STEP;
        return (
          <line
            key={`grid-h-${y}`}
            x1={1}
            y1={y}
            x2={MINIMAP_WIDTH - 1}
            y2={y}
            stroke="rgba(148,163,184,0.08)"
            strokeWidth={0.6}
          />
        );
      })}
    </>
  );
}
