'use client';

import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { ACTION_BUTTONS, type ActionKey } from './constants';

type MobileActionButtonsProps = {
  theme: DungeonUiThemePalette;
  blocked: boolean;
  canInteract: boolean;
  onInteract: () => void;
  onPulseAction: (actionKey: ActionKey) => void;
};

export function MobileActionButtons({
  theme,
  blocked,
  canInteract,
  onInteract,
  onPulseAction,
}: MobileActionButtonsProps) {
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 grid grid-cols-2 gap-2 pb-[env(safe-area-inset-bottom)]">
      {ACTION_BUTTONS.map((action) => (
        <button
          key={action.key}
          type="button"
          data-testid={action.testId}
          disabled={blocked}
          onPointerDown={(event) => {
            event.preventDefault();
            onPulseAction(action.key);
          }}
          className="h-12 min-w-[72px] rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgSoft,
            boxShadow: `0 0 12px ${theme.accentGlow}`,
          }}
        >
          {action.label}
        </button>
      ))}
      <button
        type="button"
        data-testid="mobile-action-interact"
        disabled={blocked || !canInteract}
        onPointerDown={(event) => {
          event.preventDefault();
          onInteract();
        }}
        className="col-span-2 h-12 rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
        style={{
          borderColor: theme.accentBorderStrong,
          backgroundColor: theme.accentBgStrong,
          boxShadow: `0 0 16px ${theme.accentGlowStrong}`,
        }}
      >
        {canInteract ? 'Interact' : 'No Target'}
      </button>
    </div>
  );
}
