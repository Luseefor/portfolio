import { Fragment } from 'react';
import { wallFallbackMaterial } from '../materials';
import type { AmbientPropVisual, BushVisual, WallBackerVisual, WallVisual } from '../types';

type Props = {
  wallBackers: WallBackerVisual[];
  wallVisuals: WallVisual[];
  bushVisuals: BushVisual[];
  ambientPropVisuals: AmbientPropVisual[];
};

export default function DungeonWallLayer({
  wallBackers,
  wallVisuals,
  bushVisuals,
  ambientPropVisuals,
}: Props) {
  return (
    <Fragment>
      {wallBackers.map((backer) => (
        <group key={backer.id} position={backer.position} rotation={[0, backer.rotationY, 0]}>
          {backer.object ? <primitive object={backer.object} /> : <mesh material={wallFallbackMaterial} castShadow={false} receiveShadow={false}><boxGeometry args={backer.size} /></mesh>}
        </group>
      ))}
      {wallVisuals.map((wall) => (
        <group key={wall.id} position={wall.position} rotation={[0, wall.rotationY, 0]}>
          {wall.object ? <primitive object={wall.object} /> : <mesh material={wallFallbackMaterial} castShadow={false} receiveShadow><boxGeometry args={wall.size} /></mesh>}
        </group>
      ))}
      {bushVisuals.map((bush) => (
        <group key={bush.id} position={bush.position} rotation={[0, bush.rotationY, 0]}>
          {bush.object ? <primitive object={bush.object} /> : null}
        </group>
      ))}
      {ambientPropVisuals.map((prop) => (
        <group key={prop.id} position={prop.position} rotation={[0, prop.rotationY, 0]}>
          {prop.object ? <primitive object={prop.object} /> : null}
        </group>
      ))}
    </Fragment>
  );
}
