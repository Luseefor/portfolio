'use client';

import { useMemo } from 'react';
import { Points } from '@react-three/drei';
import { QualityLevel } from '@/constants/quality';

const densityMap: Record<QualityLevel, number> = {
  low: 150,
  medium: 280,
  high: 420,
};

export default function ParticlesField({ quality }: { quality: QualityLevel }) {
  const count = densityMap[quality];
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 120 * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const y = -20 + Math.random() * 40;
      data[i * 3] = Math.cos(theta) * radius;
      data[i * 3 + 1] = y;
      data[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return data;
  }, [count]);

  return (
    <Points positions={positions} stride={3} frustumCulled>
      <pointsMaterial size={0.22} color="#6ad3e8" transparent opacity={0.35} depthWrite={false} />
    </Points>
  );
}
