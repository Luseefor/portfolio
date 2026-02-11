/**
 * Detailed wall node analysis - compute actual world-space dimensions
 * The GLB nodes have scale of 100 baked in, and the code applies rotation -PI/2 on X.
 * We need to understand what dimensions the nodes actually produce.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const glbPath = join(__dirname, '..', 'public', 'models', 'dungeon', 'structure', 'Modular Ruins Pack.glb');
const buffer = readFileSync(glbPath);
const chunk0Length = buffer.readUInt32LE(12);
const jsonStr = buffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonStr);

// Build a map: meshIndex -> combined bounding box
function getMeshBounds(meshIndex) {
    const mesh = gltf.meshes[meshIndex];
    if (!mesh) return null;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const prim of mesh.primitives || []) {
        const posIdx = prim.attributes?.POSITION;
        if (posIdx === undefined) continue;
        const acc = gltf.accessors[posIdx];
        if (!acc || !acc.min || !acc.max) continue;
        minX = Math.min(minX, acc.min[0]);
        minY = Math.min(minY, acc.min[1]);
        minZ = Math.min(minZ, acc.min[2]);
        maxX = Math.max(maxX, acc.max[0]);
        maxY = Math.max(maxY, acc.max[1]);
        maxZ = Math.max(maxZ, acc.max[2]);
    }

    if (!isFinite(minX)) return null;
    return { minX, minY, minZ, maxX, maxY, maxZ };
}

function analyzeNode(name) {
    const node = gltf.nodes.find(n => n.name === name);
    if (!node) return null;

    const meshIdx = node.mesh;
    if (meshIdx === undefined) return null;

    const bounds = getMeshBounds(meshIdx);
    if (!bounds) return null;

    const scale = node.scale || [1, 1, 1];

    // Model-space size (before scale)
    const rawSizeX = bounds.maxX - bounds.minX;
    const rawSizeY = bounds.maxY - bounds.minY;
    const rawSizeZ = bounds.maxZ - bounds.minZ;

    // After applying node scale
    const scaledX = rawSizeX * scale[0];
    const scaledY = rawSizeY * scale[1];
    const scaledZ = rawSizeZ * scale[2];

    // The code applies rotation X = -PI/2, which maps:
    // Y -> Z, Z -> -Y (so height becomes Z, depth becomes Y)
    // But let me report both orientations

    return {
        name,
        scale,
        rawBounds: {
            x: rawSizeX.toFixed(6),
            y: rawSizeY.toFixed(6),
            z: rawSizeZ.toFixed(6),
        },
        // After scale, before rotation
        scaledSize: {
            x: scaledX.toFixed(4),
            y: scaledY.toFixed(4),
            z: scaledZ.toFixed(4),
        },
        // After rotation -PI/2 on X: x stays, y = -z (depth), z = y (height)
        worldSize: {
            width: scaledX.toFixed(4),     // X stays
            depth: scaledZ.toFixed(4),     // original Z becomes Y (depth)  
            height: scaledY.toFixed(4),    // original Y becomes Z (height)
        },
    };
}

// Wall nodes
const wallNodes = [
    'Wall', 'Wall_Half', 'Wall_Broken', 'Wall_Overgrown', 'Wall_Hole',
    'Wall_Double_Hole', 'Wall_Double_Broken',
    'Wall_ArchRound', 'Wall_ArchGothic',
    'Wall_ArchRound_Overgrown', 'Wall_ArchRound_Broken', 'Wall_ArchRound_Overgrown_Broken',
];

// Arch nodes (standalone arches)
const archNodes = [
    'Arch_Gothic', 'Arch_Round',
    'Arch_Gothic_RoundColumn', 'Arch_Round_RoundColumn',
];

// Column nodes
const columnNodes = [
    'Column_Square', 'Column_Round', 'Column_BridgeSupport', 'Column_Round_Short',
];

// Floor nodes (for reference)
const floorNodes = [
    'Floor_Standard', 'Floor_Squares', 'Floor_Diamond', 'Floor_Standard_Half',
    'Floor_SquareLarge', 'Floor_Hole_Straight', 'Floor_Hole_Corner',
];

console.log('\n=============================');
console.log(' WALL NODE ANALYSIS');
console.log('=============================');
console.log('(worldSize = after scale and -PI/2 X rotation)\n');

for (const name of wallNodes) {
    const data = analyzeNode(name);
    if (data) {
        console.log(`${name}:`);
        console.log(`  GLB scale: [${data.scale.join(', ')}]`);
        console.log(`  Scaled size: X=${data.scaledSize.x}  Y=${data.scaledSize.y}  Z=${data.scaledSize.z}`);
        console.log(`  World: width=${data.worldSize.width}  depth=${data.worldSize.depth}  height=${data.worldSize.height}`);
        console.log();
    } else {
        console.log(`${name}: NOT FOUND`);
    }
}

console.log('\n=============================');
console.log(' ARCH NODE ANALYSIS');
console.log('=============================\n');

for (const name of archNodes) {
    const data = analyzeNode(name);
    if (data) {
        console.log(`${name}:`);
        console.log(`  GLB scale: [${data.scale.join(', ')}]`);
        console.log(`  Scaled size: X=${data.scaledSize.x}  Y=${data.scaledSize.y}  Z=${data.scaledSize.z}`);
        console.log(`  World: width=${data.worldSize.width}  depth=${data.worldSize.depth}  height=${data.worldSize.height}`);
        console.log();
    }
}

console.log('\n=============================');
console.log(' COLUMN NODE ANALYSIS');
console.log('=============================\n');

for (const name of columnNodes) {
    const data = analyzeNode(name);
    if (data) {
        console.log(`${name}:`);
        console.log(`  GLB scale: [${data.scale.join(', ')}]`);
        console.log(`  Scaled size: X=${data.scaledSize.x}  Y=${data.scaledSize.y}  Z=${data.scaledSize.z}`);
        console.log(`  World: width=${data.worldSize.width}  depth=${data.worldSize.depth}  height=${data.worldSize.height}`);
        console.log();
    }
}

console.log('\n=============================');
console.log(' FLOOR NODE ANALYSIS (reference)');
console.log('=============================\n');

for (const name of floorNodes) {
    const data = analyzeNode(name);
    if (data) {
        console.log(`${name}:`);
        console.log(`  GLB scale: [${data.scale.join(', ')}]`);
        console.log(`  Scaled size: X=${data.scaledSize.x}  Y=${data.scaledSize.y}  Z=${data.scaledSize.z}`);
        console.log(`  World: width=${data.worldSize.width}  depth=${data.worldSize.depth}  height=${data.worldSize.height}`);
        console.log();
    }
}

// Summary table
console.log('\n=============================');
console.log(' SUMMARY TABLE (world units)');
console.log('=============================');
console.log('Name                              | Width   | Height  | Depth');
console.log('----------------------------------|---------|---------|--------');

for (const name of [...wallNodes, ...archNodes, ...columnNodes]) {
    const data = analyzeNode(name);
    if (data) {
        const pad = name.padEnd(34);
        console.log(`${pad}| ${data.worldSize.width.padStart(7)} | ${data.worldSize.height.padStart(7)} | ${data.worldSize.depth.padStart(7)}`);
    }
}
