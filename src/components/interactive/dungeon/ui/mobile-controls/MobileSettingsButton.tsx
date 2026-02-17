'use client';

import type { DungeonUiThemePalette } from '../useDungeonUiTheme';

type MobileSettingsButtonProps = {
  theme: DungeonUiThemePalette;
  onOpenSettings: () => void;
};

export function MobileSettingsButton({ theme, onOpenSettings }: MobileSettingsButtonProps) {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 pb-[env(safe-area-inset-top)]">
      <button
        type="button"
        data-testid="mobile-settings"
        onPointerDown={(event) => {
          event.preventDefault();
          onOpenSettings();
        }}
        className="flex h-12 w-12 items-center justify-center rounded-xl border bg-stone-900/90 shadow-[0_0_18px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        style={{ borderColor: theme.accentBorderStrong, color: theme.accentText }}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.9}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
