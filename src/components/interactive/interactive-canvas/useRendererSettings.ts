import { useEffect, type MutableRefObject } from 'react';
import type { WebGLRenderer } from 'three';
import { rendererToneMapping } from '@/constants/scene';

export function useRendererSettings(
  rendererRef: MutableRefObject<WebGLRenderer | null>,
  exposure: number,
  shadowsEnabled: boolean,
) {
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.toneMappingExposure = Number.isFinite(exposure) ? exposure : rendererToneMapping.exposure;
    renderer.shadowMap.enabled = shadowsEnabled;
  }, [exposure, rendererRef, shadowsEnabled]);
}
