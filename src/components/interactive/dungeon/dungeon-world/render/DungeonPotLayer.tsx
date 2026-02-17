import type { ThreeEvent } from '@react-three/fiber';
import type { PotVisual } from '../types';

type Props = {
  potVisuals: PotVisual[];
  brokenPotIds: Set<string>;
  onPotPointerDown: (potId: string, event: ThreeEvent<PointerEvent>) => void;
};

export default function DungeonPotLayer({ potVisuals, brokenPotIds, onPotPointerDown }: Props) {
  return (
    <>
      {potVisuals.map((pot) => {
        const isBroken = brokenPotIds.has(pot.id);
        return (
          <group
            key={pot.id}
            position={pot.position}
            rotation={[0, pot.rotationY, 0]}
            onPointerDown={(event) => onPotPointerDown(pot.id, event)}
          >
            {isBroken ? (
              pot.brokenObject ? (
                <primitive object={pot.brokenObject} />
              ) : (
                <mesh position={[0, pot.brokenHeight * 0.5, 0]}>
                  <cylinderGeometry args={[pot.size[0] * 0.5, pot.size[0] * 0.45, pot.brokenHeight, 8]} />
                  <meshStandardMaterial color="#6b6154" roughness={0.95} />
                </mesh>
              )
            ) : pot.intactObject ? (
              <primitive object={pot.intactObject} />
            ) : (
              <mesh position={[0, pot.size[1] * 0.5, 0]}>
                <cylinderGeometry args={[pot.size[0] * 0.42, pot.size[0] * 0.52, pot.size[1], 10]} />
                <meshStandardMaterial color="#8f7f67" roughness={0.88} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}
