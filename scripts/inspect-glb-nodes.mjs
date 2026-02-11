/**
 * Inspect GLB node names and bounding box dimensions
 * Usage: node scripts/inspect-glb-nodes.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// We'll parse the GLB binary directly to extract node names
const __dirname = dirname(fileURLToPath(import.meta.url));
const glbPath = join(__dirname, '..', 'public', 'models', 'dungeon', 'structure', 'Modular Ruins Pack.glb');

const buffer = readFileSync(glbPath);

// GLB format: 12-byte header, then chunks
// Header: magic (4) + version (4) + length (4)
const magic = buffer.readUInt32LE(0);
if (magic !== 0x46546C67) {
    console.error('Not a valid GLB file');
    process.exit(1);
}

const version = buffer.readUInt32LE(4);
const totalLength = buffer.readUInt32LE(8);
console.log(`GLB version: ${version}, total size: ${totalLength} bytes`);

// First chunk should be JSON
const chunk0Length = buffer.readUInt32LE(12);
const chunk0Type = buffer.readUInt32LE(16);

if (chunk0Type !== 0x4E4F534A) { // 'JSON'
    console.error('First chunk is not JSON');
    process.exit(1);
}

const jsonStr = buffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonStr);

console.log('\n=== GLTF STRUCTURE ===');
console.log(`Nodes: ${gltf.nodes?.length ?? 0}`);
console.log(`Meshes: ${gltf.meshes?.length ?? 0}`);
console.log(`Accessors: ${gltf.accessors?.length ?? 0}`);

// Extract all node names
console.log('\n=== ALL NODE NAMES ===');
const nodesByName = {};
if (gltf.nodes) {
    gltf.nodes.forEach((node, idx) => {
        const name = node.name || `unnamed_${idx}`;
        nodesByName[name] = { index: idx, ...node };
        const hasMesh = node.mesh !== undefined;
        const hasChildren = node.children && node.children.length > 0;
        const scale = node.scale || [1, 1, 1];
        const translation = node.translation || [0, 0, 0];
        const rotation = node.rotation || [0, 0, 0, 1];
        console.log(`  [${idx}] "${name}" mesh:${hasMesh ? node.mesh : '-'} children:${hasChildren ? node.children.length : 0} scale:[${scale.map(s => s.toFixed(3)).join(',')}] pos:[${translation.map(t => t.toFixed(3)).join(',')}]`);
    });
}

// Categorize nodes for wall system
console.log('\n=== WALL-RELEVANT NODES ===');
const wallNodes = [];
const archNodes = [];
const pillarNodes = [];
const floorNodes = [];
const otherNodes = [];

if (gltf.nodes) {
    gltf.nodes.forEach((node, idx) => {
        const name = node.name || '';
        if (name.startsWith('Wall')) wallNodes.push(name);
        else if (name.startsWith('Arch') || name.includes('Arch')) archNodes.push(name);
        else if (name.startsWith('Column') || name.startsWith('Pillar')) pillarNodes.push(name);
        else if (name.startsWith('Floor')) floorNodes.push(name);
        else otherNodes.push(name);
    });
}

console.log('\nWall nodes:', wallNodes);
console.log('\nArch nodes:', archNodes);
console.log('\nPillar/Column nodes:', pillarNodes);
console.log('\nFloor nodes:', floorNodes);
console.log('\nOther nodes:', otherNodes);

// Extract mesh bounding data from accessors
console.log('\n=== MESH ACCESSOR BOUNDS ===');
if (gltf.meshes) {
    gltf.meshes.forEach((mesh, idx) => {
        // Find which node uses this mesh
        const nodeNames = gltf.nodes
            ?.filter(n => n.mesh === idx)
            .map(n => n.name || 'unnamed') || [];

        console.log(`\n  Mesh ${idx} (used by: ${nodeNames.join(', ')})`);

        mesh.primitives?.forEach((prim, primIdx) => {
            const posAccessorIdx = prim.attributes?.POSITION;
            if (posAccessorIdx !== undefined && gltf.accessors?.[posAccessorIdx]) {
                const accessor = gltf.accessors[posAccessorIdx];
                if (accessor.min && accessor.max) {
                    const min = accessor.min;
                    const max = accessor.max;
                    const sizeX = max[0] - min[0];
                    const sizeY = max[1] - min[1];
                    const sizeZ = max[2] - min[2];
                    console.log(`    Primitive ${primIdx}: min=[${min.map(v => v.toFixed(4)).join(',')}] max=[${max.map(v => v.toFixed(4)).join(',')}]`);
                    console.log(`    Bounding size: X=${sizeX.toFixed(4)} Y=${sizeY.toFixed(4)} Z=${sizeZ.toFixed(4)}`);
                }
            }
        });
    });
}
