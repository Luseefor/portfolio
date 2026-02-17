'use client';

export default function DungeonDebugPrimitives() {
  return (
    <group name="dungeon-debug-overlay">
      <directionalLight position={[7, 14, 6]} intensity={1.5} color="#ffffff" />
      <gridHelper args={[120, 120, '#4ade80', '#334155']} position={[0, 0.02, 0]} />
      <axesHelper args={[6]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}
