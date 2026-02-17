import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight as SpotLightImpl } from 'three';
import type { TorchVisual } from './types';

export function useTorchFlicker(torchVisuals: TorchVisual[]) {
  const torchLightRefs = useRef<Record<string, SpotLightImpl | null>>({});

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    for (let i = 0; i < torchVisuals.length; i += 1) {
      const torch = torchVisuals[i];
      const light = torchLightRefs.current[torch.id];
      if (!light) continue;
      const flicker =
        Math.sin(elapsed * 7.4 + torch.flickerSeed) * 0.2 +
        Math.sin(elapsed * 11.2 + torch.flickerSeed * 1.7) * 0.08;
      light.intensity = torch.baseIntensity * (1 + flicker);
    }
  });

  return { torchLightRefs };
}
