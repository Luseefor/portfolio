import { useMemo } from 'react';
import { BORDER_COLLIDER_HEIGHT_PAD, BORDER_COLLIDER_PAD } from './constants';
import { colliderArgsFromSize } from './propHelpers';
import type { AmbientPropVisual, BorderSegment, PotVisual, TorchVisual } from './types';

export function useDungeonColliders(
  borderWalls: BorderSegment[],
  torchVisuals: TorchVisual[],
  ambientPropVisuals: AmbientPropVisual[],
  potVisuals: PotVisual[],
  brokenPotIds: Set<string>,
) {
  const borderColliders = useMemo(
    () =>
      borderWalls.map((wall) => ({
        id: `collider-${wall.id}`,
        position: wall.position,
        size: [wall.size[0] + BORDER_COLLIDER_PAD, wall.size[1] + BORDER_COLLIDER_HEIGHT_PAD, wall.size[2] + BORDER_COLLIDER_PAD] as [number, number, number],
      })),
    [borderWalls],
  );

  const torchColliders = useMemo(
    () =>
      torchVisuals.map((torch) => ({
        id: `collider-${torch.id}`,
        position: [torch.position[0], torch.position[1] + torch.size[1] * 0.5, torch.position[2]] as [number, number, number],
        args: colliderArgsFromSize(torch.size, 0.76),
      })),
    [torchVisuals],
  );

  const ambientColliders = useMemo(
    () =>
      ambientPropVisuals.map((prop) => ({
        id: `collider-${prop.id}`,
        position: [prop.position[0], prop.position[1] + prop.size[1] * 0.5, prop.position[2]] as [number, number, number],
        args: colliderArgsFromSize(prop.size, prop.size[1] < 0.66 ? 0.6 : 0.8),
      })),
    [ambientPropVisuals],
  );

  const potColliders = useMemo(
    () =>
      potVisuals.map((pot) => {
        const height = brokenPotIds.has(pot.id) ? pot.brokenHeight : pot.size[1];
        const size: [number, number, number] = [pot.size[0], height, pot.size[2]];
        return {
          id: `collider-${pot.id}`,
          position: [pot.position[0], pot.position[1] + height * 0.5, pot.position[2]] as [number, number, number],
          args: colliderArgsFromSize(size, 0.8),
        };
      }),
    [brokenPotIds, potVisuals],
  );

  return { borderColliders, torchColliders, ambientColliders, potColliders };
}
