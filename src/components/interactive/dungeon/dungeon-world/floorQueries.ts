import type { DungeonBuildPiece } from '@/game/dungeon/buildDungeon';

export function pointInsideFloorPiece(x: number, z: number, piece: DungeonBuildPiece) {
  const halfX = piece.size[0] * 0.5;
  const halfZ = piece.size[2] * 0.5;
  return (
    x >= piece.position[0] - halfX &&
    x <= piece.position[0] + halfX &&
    z >= piece.position[2] - halfZ &&
    z <= piece.position[2] + halfZ
  );
}

export function pointInsideAnyFloor(x: number, z: number, floorPieces: DungeonBuildPiece[]) {
  for (let i = 0; i < floorPieces.length; i += 1) {
    if (pointInsideFloorPiece(x, z, floorPieces[i])) return true;
  }
  return false;
}

export function floorSurfaceYAt(x: number, z: number, floorPieces: DungeonBuildPiece[]) {
  let topY = 0;
  for (let i = 0; i < floorPieces.length; i += 1) {
    const piece = floorPieces[i];
    if (!pointInsideFloorPiece(x, z, piece)) continue;
    topY = Math.max(topY, piece.position[1] + piece.size[1] * 0.5);
  }
  return topY;
}
