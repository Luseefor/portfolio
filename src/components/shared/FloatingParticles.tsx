'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface FloatingParticlesProps {
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

interface FloatingParticle {
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
  const [, setCanvasSize] = useState({ width: 0, height: 0 });

  const createParticle = useCallback(
    (width: number, height: number) => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * movementSpeed,
        vy: (Math.random() - 0.5) * movementSpeed,
        size: Math.random() * particleSize + 1,
        opacity: 0,
        baseOpacity: particleOpacity,
        glowMultiplier: 1,
        life: Math.random() * 0.5 + 0.5,
        maxLife: 0.002 + Math.random() * 0.005,
        id: Math.random(),
      };
    },
    [movementSpeed, particleSize, particleOpacity],
  );

  const initializeParticles = useCallback(
    (width: number, height: number) => {
      return Array.from({ length: particleCount }, () => {
        const p = createParticle(width, height);
        p.opacity = particleOpacity; // Start initialized particles with full opacity
        return p;
      });
    },
    [particleCount, createParticle, particleOpacity],
  );

  const updateParticles = useCallback(
    (width: number, height: number) => {
      const mouse = mouseRef.current;

      particlesRef.current.forEach((particle, index) => {
        // Natural lifecycle: gradually fade and respawn
        particle.life -= particle.maxLife;

        if (particle.life <= 0) {
          // Respawn particle
          particlesRef.current[index] = createParticle(width, height);
          return;
        }

        // Smooth fade in/out based on life
        const targetOpacity =
          particle.life < 0.2
            ? (particle.life / 0.2) * particle.baseOpacity
            : particle.life > 0.8
              ? ((1 - particle.life) / 0.2) * particle.baseOpacity
              : particle.baseOpacity;

        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Baseline movement (drifting)
        particle.vx += (Math.random() - 0.5) * 0.01;
        particle.vy += (Math.random() - 0.5) * 0.01;

        if (mouse.active && distance < mouseInfluence && distance > 0) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          const gravityForce = force * (gravityStrength * 0.001);

          if (mouseGravity === 'attract') {
            particle.vx += normalizedDx * gravityForce * 2;
            particle.vy += normalizedDy * gravityForce * 2;
          } else if (mouseGravity === 'repel') {
            particle.vx -= normalizedDx * gravityForce * 2;
            particle.vy -= normalizedDy * gravityForce * 2;
          }

          particle.opacity = Math.min(1, targetOpacity + force * 0.4);
          particle.glowMultiplier = 1 + force * 2;
        } else {
          particle.opacity = Math.max(
            0,
            particle.opacity + (targetOpacity - particle.opacity) * 0.1,
          );
          particle.glowMultiplier = Math.max(1, (particle.glowMultiplier || 1) - 0.05);
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap-around
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Global drag / terminal velocity
        particle.vx *= 0.98;
        particle.vy *= 0.98;
      });
    },
    [mouseInfluence, mouseGravity, gravityStrength, createParticle],
  );

  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw connections
      ctx.lineWidth = 0.5;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.opacity <= 0) continue;

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            // Connection distance
            const opacity = (1 - distance / 150) * Math.min(p1.opacity, p2.opacity) * 0.5;
            if (opacity > 0) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Draw particle
        ctx.save();
        const currentGlow = glowIntensity * (p1.glowMultiplier || 1);
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = currentGlow;
        ctx.globalAlpha = p1.opacity;
        ctx.fillStyle = particleColor;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    [particleColor, glowIntensity],
  );

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      updateParticles(canvas.width, canvas.height);
      drawParticles(ctx);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [updateParticles, drawParticles]);

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

      setCanvasSize({ width, height });
      particlesRef.current = initializeParticles(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
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
  }, [initializeParticles]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
