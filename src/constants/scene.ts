export const sceneLighting = {
  fogColor: '#1a1410',
  fogDensity: 0.035,
  ambientIntensity: 0.35,
  ambientColor: '#f4d7b0',
  hemisphereIntensity: 0.4,
  hemisphereSky: '#f7e6cd',
  hemisphereGround: '#1a1410',
  fillDirectionalIntensity: 0.65,
  fillDirectionalColor: '#ffe6c4',
  fillDirectionalPosition: [8, 12, 6] as const,
  torchLights: [
    { position: [4, 3, -2], intensity: 2.6, color: '#ffb35c', distance: 20 },
    { position: [-5, 3, 4], intensity: 2.2, color: '#ff9f5a', distance: 18 },
    { position: [0, 3, 8], intensity: 2.1, color: '#ffbf75', distance: 18 },
  ] as const,
};

export const rendererToneMapping = {
  exposure: 1.15,
};
