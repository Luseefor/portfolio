'use client';

import type { ChestPanelTemplateProps } from '@/components/interactive/dungeon/ui/chest-content/panel-types';

export default function FallbackPanel({ chest }: ChestPanelTemplateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-sm text-stone-300">No specialized panel is configured for {chest.title} yet.</p>
    </div>
  );
}
