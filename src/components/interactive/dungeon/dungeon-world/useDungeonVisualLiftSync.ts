import { useEffect } from 'react';
import { clearDungeonVisualLiftTiles, setDungeonVisualLiftTiles } from '@/lib/dungeonVisualLift';

export function useDungeonVisualLiftSync(walkableTiles: Array<{ x: number; z: number; y: number }>) {
  useEffect(() => {
    setDungeonVisualLiftTiles(walkableTiles);
    return () => {
      clearDungeonVisualLiftTiles();
    };
  }, [walkableTiles]);
}
