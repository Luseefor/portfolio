'use client';

import type { MutableRefObject, PointerEvent as ReactPointerEvent } from 'react';
import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type Vec2 = { x: number; y: number };

type MobileJoystickProps = {
  theme: DungeonUiThemePalette;
  stickOffset: Vec2;
  joystickRef: MutableRefObject<HTMLDivElement | null>;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function MobileJoystick({
  theme,
  stickOffset,
  joystickRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: MobileJoystickProps) {
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 pb-[env(safe-area-inset-bottom)]">
      <div
        ref={joystickRef}
        data-testid="mobile-joystick"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{ touchAction: 'none' }}
        className="relative h-28 w-28 rounded-full border border-stone-600/80 bg-stone-900/65 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute inset-[11px] rounded-full border border-stone-700/70" />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgStrong,
            boxShadow: `0 0 20px ${theme.accentGlow}`,
            transform: `translate(calc(-50% + ${stickOffset.x}px), calc(-50% + ${stickOffset.y}px))`,
          }}
        />
      </div>
    </div>
  );
}
