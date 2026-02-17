import { Fragment } from 'react';
import { CEILING_CAP_EXPAND, CEILING_CAP_RISE, CEILING_CAP_THICKNESS } from '../constants';
import { ceilingCapMaterial, ceilingFallbackMaterial, floorUnderlayMaterial } from '../materials';
import { materialForFloor, underlaySpecForFloor } from '../floorUtils';
import type { CeilingVisual, FloorVisual } from '../types';

type Props = {
  ceilingVisuals: CeilingVisual[];
  floorVisuals: FloorVisual[];
};

export default function DungeonFloorCeilingLayer({ ceilingVisuals, floorVisuals }: Props) {
  return (
    <Fragment>
      {ceilingVisuals.map((ceiling) => (
        <group key={ceiling.id} position={ceiling.position} rotation={[0, ceiling.rotationY, 0]}>
          <mesh
            position={[0, ceiling.size[1] * 0.5 + CEILING_CAP_THICKNESS * 0.5 + CEILING_CAP_RISE, 0]}
            material={ceilingCapMaterial}
            castShadow={false}
            receiveShadow
          >
            <boxGeometry args={[ceiling.size[0] + CEILING_CAP_EXPAND, CEILING_CAP_THICKNESS, ceiling.size[2] + CEILING_CAP_EXPAND]} />
          </mesh>
          {ceiling.object ? <primitive object={ceiling.object} /> : <mesh material={ceilingFallbackMaterial} castShadow={false} receiveShadow><boxGeometry args={ceiling.size} /></mesh>}
        </group>
      ))}

      {floorVisuals.map(({ piece, object }) => {
        const underlay = underlaySpecForFloor(piece);
        return (
          <group key={piece.id} position={piece.position} rotation={[0, piece.rotationY, 0]}>
            <mesh
              position={[0, -(piece.size[1] * 0.5 + underlay.thickness * 0.5 + underlay.drop), 0]}
              material={floorUnderlayMaterial}
              castShadow={false}
              receiveShadow
            >
              <boxGeometry args={[piece.size[0] + underlay.expand, underlay.thickness, piece.size[2] + underlay.expand]} />
            </mesh>
            {object ? <primitive object={object} /> : <mesh material={materialForFloor(piece)} castShadow={false} receiveShadow><boxGeometry args={piece.size} /></mesh>}
          </group>
        );
      })}
    </Fragment>
  );
}
