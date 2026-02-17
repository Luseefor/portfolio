export type GraphicsQuality = 'low' | 'medium' | 'high';

export function getRenderQualitySettings(graphicsQuality: GraphicsQuality) {
  const shadowsEnabled = graphicsQuality !== 'low';
  const canvasDpr: [number, number] =
    graphicsQuality === 'high' ? [1, 2] : graphicsQuality === 'medium' ? [0.9, 1.5] : [0.75, 1];
  const antialiasEnabled = graphicsQuality !== 'low';
  return { shadowsEnabled, canvasDpr, antialiasEnabled };
}
