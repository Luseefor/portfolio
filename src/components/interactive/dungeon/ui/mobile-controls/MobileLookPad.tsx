'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';

type MobileLookPadProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function MobileLookPad({ onPointerDown, onPointerMove, onPointerUp, onPointerCancel }: MobileLookPadProps) {
  return (
    <div
      data-testid="mobile-look-pad"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ touchAction: 'none' }}
      className="pointer-events-auto absolute bottom-0 right-0 top-0 w-[52%]"
    />
  );
}
