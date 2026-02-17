'use client';

import { DustMotes } from './dungeon-particles/DustMotes';
import { EmberSystem } from './dungeon-particles/EmberSystem';

export { DustMotes, EmberSystem };

export default function DungeonParticles({
  enabled = true,
  countMultiplier = 1,
}: {
  enabled?: boolean;
  countMultiplier?: number;
}) {
  if (!enabled) return null;
  return (
    <group name="dungeon-particles">
      <DustMotes count={Math.round(150 * countMultiplier)} opacity={0.25} />
      <EmberSystem countMultiplier={countMultiplier} />
    </group>
  );
}
