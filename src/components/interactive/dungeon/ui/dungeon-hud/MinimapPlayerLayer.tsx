'use client';

import { MINIMAP_WIDTH } from './constants';

type MinimapPlayerLayerProps = {
  playerPoint: { x: number; y: number };
  look: { x: number; z: number };
};

const BEAM_NEAR_LENGTH = 4;
const BEAM_FAR_LENGTH = 30;
const BEAM_NEAR_HALF_WIDTH = 2.8;
const BEAM_FAR_HALF_WIDTH = 11.5;

export function MinimapPlayerLayer({ playerPoint, look }: MinimapPlayerLayerProps) {
  const lookMagnitude = Math.hypot(look.x, look.z);
  const lookX = lookMagnitude > 0.0001 ? look.x / lookMagnitude : 0;
  const lookY = lookMagnitude > 0.0001 ? look.z / lookMagnitude : -1;
  const nearCenterX = playerPoint.x + lookX * BEAM_NEAR_LENGTH;
  const nearCenterY = playerPoint.y + lookY * BEAM_NEAR_LENGTH;
  const farCenterX = playerPoint.x + lookX * BEAM_FAR_LENGTH;
  const farCenterY = playerPoint.y + lookY * BEAM_FAR_LENGTH;
  const perpendicularX = -lookY;
  const perpendicularY = lookX;

  const beamPoints = `${nearCenterX + perpendicularX * BEAM_NEAR_HALF_WIDTH},${nearCenterY + perpendicularY * BEAM_NEAR_HALF_WIDTH} ${farCenterX + perpendicularX * BEAM_FAR_HALF_WIDTH},${farCenterY + perpendicularY * BEAM_FAR_HALF_WIDTH} ${farCenterX - perpendicularX * BEAM_FAR_HALF_WIDTH},${farCenterY - perpendicularY * BEAM_FAR_HALF_WIDTH} ${nearCenterX - perpendicularX * BEAM_NEAR_HALF_WIDTH},${nearCenterY - perpendicularY * BEAM_NEAR_HALF_WIDTH}`;
  const conePoints = `${playerPoint.x},${playerPoint.y} ${farCenterX + perpendicularX * (BEAM_FAR_HALF_WIDTH * 0.45)},${farCenterY + perpendicularY * (BEAM_FAR_HALF_WIDTH * 0.45)} ${farCenterX - perpendicularX * (BEAM_FAR_HALF_WIDTH * 0.45)},${farCenterY - perpendicularY * (BEAM_FAR_HALF_WIDTH * 0.45)}`;

  return (
    <>
      <polygon points={beamPoints} fill="rgba(255,255,255,0.11)" filter="url(#beam-glow)" />
      <polygon points={conePoints} fill="rgba(255,255,255,0.18)" />
      <circle cx={playerPoint.x} cy={playerPoint.y} r={8} fill="rgba(255,255,255,0.2)" />
      <circle cx={playerPoint.x} cy={playerPoint.y} r={5.2} fill="rgba(255,255,255,0.34)" />
      <circle cx={playerPoint.x} cy={playerPoint.y} r={2.9} fill="rgba(255,255,255,1)" />
      <text
        x={MINIMAP_WIDTH - 13}
        y={14}
        fill="rgba(226,232,240,0.88)"
        fontSize={8}
        fontWeight={700}
        textAnchor="middle"
      >
        N
      </text>
    </>
  );
}
