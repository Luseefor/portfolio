'use client';

import { useDungeonInput } from '@/lib/dungeonInput';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';
import { useDungeonUiTheme } from './useDungeonUiTheme';
import { DesktopHudOverlays } from './dungeon-hud/DesktopHudOverlays';
import { MinimapPanel } from './dungeon-hud/MinimapPanel';
import { worldToMinimap } from './dungeon-hud/constants';

interface DungeonHUDProps {
  chestsOpened: number;
  totalChests: number;
  openedChestIds: ReadonlySet<string>;
}

export default function DungeonHUD({ chestsOpened, totalChests, openedChestIds }: DungeonHUDProps) {
  const theme = useDungeonUiTheme();
  const isTouchDevice = useDungeonInput((state) => state.isTouchDevice);
  const position = usePlayerState(playerStateSelectors.position);
  const look = usePlayerState(playerStateSelectors.look);
  const speed = usePlayerState(playerStateSelectors.speed);
  const grounded = usePlayerState(playerStateSelectors.grounded);
  const isMoving = usePlayerState(playerStateSelectors.isMoving);
  const playerPoint = worldToMinimap(position.x, position.z);

  return (
    <>
      <MinimapPanel
        chestsOpened={chestsOpened}
        totalChests={totalChests}
        openedChestIds={openedChestIds}
        playerPoint={playerPoint}
        look={look}
        theme={theme}
      />
      <DesktopHudOverlays
        isTouchDevice={isTouchDevice}
        chestsOpened={chestsOpened}
        totalChests={totalChests}
        speed={speed}
        grounded={grounded}
        isMoving={isMoving}
        theme={theme}
      />
    </>
  );
}
