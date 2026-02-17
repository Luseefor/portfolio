'use client';

import { DUNGEON_SCALE, TORCH_PLACEMENTS } from '@/constants/dungeonLayout';
import { EmberSparkEmitter } from './EmberSparkEmitter';

export function EmberSystem({ countMultiplier = 1 }: { countMultiplier?: number }) {
  return (
    <group name="ember-system">
      {TORCH_PLACEMENTS.map((torch, index) => (
        <EmberSparkEmitter
          key={`ember-${index}`}
          position={[
            torch.position[0] * DUNGEON_SCALE,
            (torch.position[1] + 0.5) * DUNGEON_SCALE,
            torch.position[2] * DUNGEON_SCALE,
          ]}
          count={Math.round(12 * countMultiplier)}
          spread={0.4}
        />
      ))}
    </group>
  );
}
