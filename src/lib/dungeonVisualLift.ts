type LiftTile = {
  x: number;
  z: number;
  halfSize: number;
  lift: number;
};

const LIFT_EDGE_PADDING = 0.06;
const LIFT_EDGE_BLEND = 0.22;
const SAMPLE_RADIUS = 0.12;
const HASH_CELL_SIZE = 1.25;

let liftTiles: LiftTile[] = [];
let liftTileBuckets = new Map<string, LiftTile[]>();

function bucketKey(ix: number, iz: number) {
  return `${ix}:${iz}`;
}

export function setDungeonVisualLiftTiles(tiles: LiftTile[]) {
  liftTiles = tiles;
  liftTileBuckets = new Map<string, LiftTile[]>();
  for (let i = 0; i < liftTiles.length; i += 1) {
    const tile = liftTiles[i];
    const minX = Math.floor((tile.x - tile.halfSize - SAMPLE_RADIUS) / HASH_CELL_SIZE);
    const maxX = Math.floor((tile.x + tile.halfSize + SAMPLE_RADIUS) / HASH_CELL_SIZE);
    const minZ = Math.floor((tile.z - tile.halfSize - SAMPLE_RADIUS) / HASH_CELL_SIZE);
    const maxZ = Math.floor((tile.z + tile.halfSize + SAMPLE_RADIUS) / HASH_CELL_SIZE);
    for (let ix = minX; ix <= maxX; ix += 1) {
      for (let iz = minZ; iz <= maxZ; iz += 1) {
        const key = bucketKey(ix, iz);
        const bucket = liftTileBuckets.get(key);
        if (bucket) bucket.push(tile);
        else liftTileBuckets.set(key, [tile]);
      }
    }
  }
}

export function clearDungeonVisualLiftTiles() {
  liftTiles = [];
  liftTileBuckets = new Map<string, LiftTile[]>();
}

export function getDungeonVisualLiftAt(x: number, z: number) {
  const ix = Math.floor(x / HASH_CELL_SIZE);
  const iz = Math.floor(z / HASH_CELL_SIZE);
  const candidates = liftTileBuckets.get(bucketKey(ix, iz)) ?? [];
  if (!candidates.length) return 0;

  let weightedLift = 0;
  let totalWeight = 0;
  for (let i = 0; i < candidates.length; i += 1) {
    const tile = candidates[i];
    const dx = Math.abs(x - tile.x) - tile.halfSize;
    const dz = Math.abs(z - tile.z) - tile.halfSize;
    const outside = Math.max(dx, dz);
    if (outside > LIFT_EDGE_PADDING + LIFT_EDGE_BLEND) continue;

    let influence = 1;
    if (outside > LIFT_EDGE_PADDING) {
      influence = 1 - (outside - LIFT_EDGE_PADDING) / LIFT_EDGE_BLEND;
    }
    const centerDistance = Math.hypot(x - tile.x, z - tile.z);
    const centerWeight = 1 / (1 + centerDistance * centerDistance * 3.5);
    const weight = influence * centerWeight;
    weightedLift += tile.lift * weight;
    totalWeight += weight;
  }
  if (totalWeight <= 1e-5) return 0;
  return weightedLift / totalWeight;
}
