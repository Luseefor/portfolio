'use client';

import { useRef } from 'react';
import type { FloatingParticle, FloatingParticlesProps } from './floating-particles/types';
import { useParticleAnimation } from './floating-particles/useParticleAnimation';
import { useParticleCanvasSetup } from './floating-particles/useParticleCanvasSetup';

export default function FloatingParticles({
  particleCount = 60,
  particleSize = 1.5,
  particleOpacity = 0.5,
  glowIntensity = 10,
  movementSpeed = 0.4,
  mouseInfluence = 200,
  backgroundColor = 'transparent',
  particleColor = '#FFFFFF',
  mouseGravity = 'repel',
  gravityStrength = 60,
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(undefined);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<FloatingParticle[]>([]);

  const factoryOptions = { movementSpeed, particleSize, particleOpacity };
  const updateOptions = { mouseInfluence, mouseGravity, gravityStrength };
  const drawOptions = { particleColor, glowIntensity };

  useParticleCanvasSetup({
    containerRef,
    canvasRef,
    mouseRef,
    particlesRef,
    particleCount,
    factoryOptions,
  });

  useParticleAnimation({
    canvasRef,
    animationRef,
    particlesRef,
    mouseRef,
    drawOptions,
    updateOptions,
    factoryOptions,
  });

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
