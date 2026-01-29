'use client';

import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useSettings } from '@/lib/settings';

/**
 * DungeonPostProcessing - Agent B (B2)
 * 
 * Subtle postprocessing effects for dungeon atmosphere:
 * - ACES tone mapping for cinematic look
 * - Subtle bloom on bright areas (torch lights)
 * - Vignette for focus and mood
 * 
 * Effects scale with graphics quality setting.
 */
export default function DungeonPostProcessing() {
  const graphicsQuality = useSettings((s) => s.graphicsQuality);
  const exposure = useSettings((s) => s.exposure ?? 1.0);

  // Disable postprocessing on low quality
  if (graphicsQuality === 'low') {
    return null;
  }

  // Scale effects based on quality
  const bloomIntensity = graphicsQuality === 'high' ? 0.4 : 0.25;
  const bloomLuminanceThreshold = graphicsQuality === 'high' ? 0.8 : 0.9;

  return (
    <EffectComposer>
      {/* ACES Filmic Tone Mapping */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
      />

      {/* Subtle bloom for torch glow */}
      <Bloom
        intensity={bloomIntensity * exposure}
        luminanceThreshold={bloomLuminanceThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />

      {/* Vignette for atmospheric focus */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        eskil={false}
      />
    </EffectComposer>
  );
}
