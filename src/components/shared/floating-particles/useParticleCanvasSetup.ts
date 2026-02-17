import { useEffect, type MutableRefObject } from 'react';
import { initializeParticles } from './engine';
import type { FloatingParticle, FloatingParticlesProps } from './types';

type UseParticleCanvasSetupParams = {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  mouseRef: MutableRefObject<{ x: number; y: number; active: boolean }>;
  particlesRef: MutableRefObject<FloatingParticle[]>;
  particleCount: number;
  factoryOptions: Pick<FloatingParticlesProps, 'movementSpeed' | 'particleSize' | 'particleOpacity'>;
};

export function useParticleCanvasSetup({
  containerRef,
  canvasRef,
  mouseRef,
  particlesRef,
  particleCount,
  factoryOptions,
}: UseParticleCanvasSetupParams) {
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      particlesRef.current = initializeParticles(width, height, particleCount, factoryOptions);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef, containerRef, factoryOptions, mouseRef, particleCount, particlesRef]);
}
