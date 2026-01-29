'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute } from 'three';
import { QualityLevel } from '@/constants/quality';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';

const densityMap: Record<QualityLevel, number> = {
  low: 12,
  medium: 22,
  high: 36,
};

export default function BubbleTrail({
  quality,
  enabled = true,
}: {
  quality: QualityLevel;
  enabled?: boolean;
}) {
  const position = usePlayerState(playerStateSelectors.position);
  const forward = usePlayerState(playerStateSelectors.forward);
  const speed = usePlayerState(playerStateSelectors.speed);
  const count = densityMap[quality];

  const offsets = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 0.8;
      data[i * 3 + 1] = Math.random() * 1.6;
      data[i * 3 + 2] = -1 - Math.random() * 1.8;
    }
    return data;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const attributeRef = useRef<BufferAttribute>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (attributeRef.current) {
      attributeRef.current.needsUpdate = true;
    }
  }, [positions]);

  useFrame((_, delta) => {
    if (!enabled) {
      return;
    }
    timeRef.current += delta;

    for (let i = 0; i < count; i += 1) {
      const ix = i * 3;
      offsets[ix + 1] += delta * (0.4 + speed * 0.05);

      if (offsets[ix + 1] > 2.2) {
        offsets[ix] = (Math.random() - 0.5) * 0.8;
        offsets[ix + 1] = -0.4;
        offsets[ix + 2] = -1.2 - Math.random() * 1.8;
      }

      positions[ix] = position.x + offsets[ix] - forward.x * 1.1;
      positions[ix + 1] = position.y + offsets[ix + 1] * 0.5 - 0.4;
      positions[ix + 2] = position.z + offsets[ix + 2] - forward.z * 1.1;
    }

    if (attributeRef.current) {
      attributeRef.current.needsUpdate = true;
    }
  });

  if (!enabled) {
    return null;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={attributeRef} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.16} color="#9cecff" transparent opacity={0.65} depthWrite={false} />
    </points>
  );
}
