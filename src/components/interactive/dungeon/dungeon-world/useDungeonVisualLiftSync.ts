import { useEffect } from 'react';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';
import type { DungeonWalkableTile } from '@/game/dungeon/buildDungeon';

export function useDungeonVisualLiftSync(walkableTiles: DungeonWalkableTile[]) {
  useEffect(() => {
    setDungeonVisualLiftTiles(walkableTiles);
    return () => {
      clearDungeonVisualLiftTiles();
    };
  }, [walkableTiles]);
}
