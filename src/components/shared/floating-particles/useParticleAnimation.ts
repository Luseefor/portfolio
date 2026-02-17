import { useEffect, type MutableRefObject } from 'react';
import { drawParticles, updateParticles } from './engine';
import type { FloatingParticle, FloatingParticlesProps } from './types';

type UseParticleAnimationParams = {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  animationRef: MutableRefObject<number | undefined>;
  particlesRef: MutableRefObject<FloatingParticle[]>;
  mouseRef: MutableRefObject<{ x: number; y: number; active: boolean }>;
  drawOptions: Pick<FloatingParticlesProps, 'particleColor' | 'glowIntensity'>;
  updateOptions: Pick<FloatingParticlesProps, 'mouseInfluence' | 'mouseGravity' | 'gravityStrength'>;
  factoryOptions: Pick<FloatingParticlesProps, 'movementSpeed' | 'particleSize' | 'particleOpacity'>;
};

export function useParticleAnimation({
  canvasRef,
  animationRef,
  particlesRef,
  mouseRef,
  drawOptions,
  updateOptions,
  factoryOptions,
}: UseParticleAnimationParams) {
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      updateParticles(
        particlesRef.current,
        canvas.width,
        canvas.height,
        mouseRef.current,
        updateOptions,
        factoryOptions,
      );
      drawParticles(ctx, particlesRef.current, drawOptions);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animationRef, canvasRef, drawOptions, factoryOptions, mouseRef, particlesRef, updateOptions]);
}
