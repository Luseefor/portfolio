'use client';

export default function DungeonScene() {
  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#cbd5f5" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}
