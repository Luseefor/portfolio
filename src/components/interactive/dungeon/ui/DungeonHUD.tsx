'use client';

import { useDungeonInput } from '@/lib/dungeonInput';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';
import { useDungeonUiTheme } from './useDungeonUiTheme';
import { MinimapPanel } from './dungeon-hud/MinimapPanel';
import { ProgressPanel } from './dungeon-hud/ProgressPanel';
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
      {!isTouchDevice ? (
        <ProgressPanel chestsOpened={chestsOpened} totalChests={totalChests} theme={theme} />
      ) : null}
    </>
  );
}
