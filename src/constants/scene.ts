export const sceneLighting = {
  // Fog - atmospheric depth, not too dense to maintain readability
  fogColor: '#1a1410',
  fogDensity: 0.028, // Slightly reduced for better visibility at distance
  
  // Ambient - soft base fill to prevent crushed blacks
  ambientIntensity: 0.52, // Stronger base fill for visibility
  ambientColor: '#f4d7b0',
  
  // Hemisphere - sky/ground color bleed for natural feel
  hemisphereIntensity: 0.5, // Slightly increased
  hemisphereSky: '#f7e6cd',
  hemisphereGround: '#1a1410',
  
  // Fill directional - subtle key light from above-right
  fillDirectionalIntensity: 0.7, // Soft key light to lift shadows
  fillDirectionalColor: '#ffe6c4',
  fillDirectionalPosition: [8, 15, 6] as const, // Raised higher
  
  // Static torch accent lights (in addition to TorchSystem flickering)
  // These provide stable base illumination at key points
  torchLights: [
    // Room A (Spawn Hall) center glow
    { position: [0, 4, -8], intensity: 1.8, color: '#ffb35c', distance: 18 },
    // Corridor 1 midpoint
    { position: [0, 3, 8], intensity: 1.5, color: '#ff9f5a', distance: 14 },
    // Room B (Chest Room) accent
    { position: [0, 4, 24], intensity: 2.0, color: '#ffbf75', distance: 20 },
    // Corridor 2 turn point
    { position: [10, 3, 34], intensity: 1.4, color: '#ffb35c', distance: 14 },
    // Room C (Showcase) fill
    { position: [18, 4, 44], intensity: 1.8, color: '#ffe0a0', distance: 18 },
  ] as const,
};

export const rendererToneMapping = {
  exposure: 1.25, // Slightly higher for dungeon readability
};
