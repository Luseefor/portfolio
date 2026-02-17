'use client';

import type { DungeonUiThemePalette } from '../useDungeonUiTheme';
import { ControlsHintPanel } from './ControlsHintPanel';
import { MovementStatusPanel } from './MovementStatusPanel';
import { ProgressPanel } from './ProgressPanel';

type DesktopHudOverlaysProps = {
  isTouchDevice: boolean;
  chestsOpened: number;
  totalChests: number;
  speed: number;
  grounded: boolean;
  isMoving: boolean;
  theme: DungeonUiThemePalette;
};

export function DesktopHudOverlays({
  isTouchDevice,
  chestsOpened,
  totalChests,
  speed,
  grounded,
  isMoving,
  theme,
}: DesktopHudOverlaysProps) {
  if (isTouchDevice) return null;

  return (
    <>
      <ProgressPanel chestsOpened={chestsOpened} totalChests={totalChests} speed={speed} theme={theme} />
      <ControlsHintPanel />
      <MovementStatusPanel grounded={grounded} isMoving={isMoving} theme={theme} />
    </>
  );
}
