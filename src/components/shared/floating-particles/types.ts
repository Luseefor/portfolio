export interface FloatingParticlesProps {
  particleCount?: number;
  particleSize?: number;
  particleOpacity?: number;
  glowIntensity?: number;
  movementSpeed?: number;
  mouseInfluence?: number;
  backgroundColor?: string;
  particleColor?: string;
  mouseGravity?: 'none' | 'attract' | 'repel';
  gravityStrength?: number;
}

export interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  glowMultiplier: number;
  life: number;
  maxLife: number;
  id: number;
}
