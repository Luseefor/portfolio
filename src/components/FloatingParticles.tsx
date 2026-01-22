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
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<any[]>([]);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const initializeParticles = useCallback((width: number, height: number) => {
        return Array.from({ length: particleCount }, (_, index) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * movementSpeed,
            vy: (Math.random() - 0.5) * movementSpeed,
            size: Math.random() * particleSize + 1,
            opacity: particleOpacity,
            baseOpacity: particleOpacity,
            glowMultiplier: 1,
            id: index
        }));
    }, [particleCount, particleSize, particleOpacity, movementSpeed]);

    const updateParticles = useCallback((width: number, height: number) => {
        const mouse = mouseRef.current;

        particlesRef.current.forEach((particle) => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseInfluence && distance > 0) {
                const force = (mouseInfluence - distance) / mouseInfluence;
                const normalizedDx = dx / distance;
                const normalizedDy = dy / distance;
                const gravityForce = force * (gravityStrength * 0.001);

                if (mouseGravity === 'attract') {
                    particle.vx += normalizedDx * gravityForce;
                    particle.vy += normalizedDy * gravityForce;
                } else if (mouseGravity === 'repel') {
                    particle.vx -= normalizedDx * gravityForce;
                    particle.vy -= normalizedDy * gravityForce;
                }

                particle.opacity = Math.min(1, particle.baseOpacity + force * 0.4);
                particle.glowMultiplier = 1 + force * 2;
            } else {
                particle.opacity = Math.max(particle.baseOpacity * 0.3, particle.opacity - 0.02);
                particle.glowMultiplier = Math.max(1, (particle.glowMultiplier || 1) - 0.05);
            }

            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap-around
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;

            // Global drag
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }, [mouseInfluence, mouseGravity, gravityStrength]);

    const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        particlesRef.current.forEach((particle) => {
            ctx.save();
            const currentGlow = glowIntensity * (particle.glowMultiplier || 1);

            ctx.shadowColor = particleColor;
            ctx.shadowBlur = currentGlow;
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particleColor;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }, [particleColor, glowIntensity]);

    useEffect(() => {
        const animate = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
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
            canvasRef.current.width = width;
            canvasRef.current.height = height;
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
                y: e.clientY - rect.top
            };
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [initializeParticles]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            style={{ backgroundColor }}
        >
            <canvas
                ref={canvasRef}
                className="block h-full w-full"
            />
        </div>
    );
}
