'use client';

import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface Point {
    x: number;
    y: number;
    id: number;
    vx: number;
    vy: number;
}

interface Connection {
    p1: number;
    p2: number;
}

export default function DigitalNexus({ color, isDark }: { color: string; isDark: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Create static points and connections once
    const { points, connections } = useMemo(() => {
        const p: Point[] = [];
        const count = 40;
        for (let i = 0; i < count; i++) {
            p.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                id: i,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
            });
        }

        const c: Connection[] = [];
        for (let i = 0; i < p.length; i++) {
            for (let j = i + 1; j < p.length; j++) {
                const dist = Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y);
                if (dist < 20) {
                    c.push({ p1: i, p2: j });
                }
            }
        }
        return { points: p, connections: c };
    }, []);

    const { scrollY } = useScroll();
    const yOffset = useSpring(useTransform(scrollY, [0, 1000], [0, -100]), {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
                className="h-full w-full"
                style={{ y: yOffset }}
            >
                {/* Connection Lines */}
                {connections.map((conn, i) => (
                    <motion.line
                        key={`l-${i}`}
                        x1={points[conn.p1].x}
                        y1={points[conn.p1].y}
                        x2={points[conn.p2].x}
                        y2={points[conn.p2].y}
                        stroke={color}
                        strokeWidth="0.05"
                        strokeOpacity={isDark ? 0.1 : 0.2}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: isDark ? 0.1 : 0.2 }}
                        transition={{ duration: 2, delay: i * 0.01 }}
                    />
                ))}

                {/* Data Packets */}
                {connections.filter((_, i) => i % 3 === 0).map((conn, i) => (
                    <motion.circle
                        key={`p-${i}`}
                        r="0.15"
                        fill={color}
                        initial={{ opacity: 0 }}
                        animate={{
                            cx: [points[conn.p1].x, points[conn.p2].x],
                            cy: [points[conn.p1].y, points[conn.p2].y],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    />
                ))}

                {/* Nodes */}
                {points.map((p, i) => (
                    <circle
                        key={`n-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="0.1"
                        fill={color}
                        fillOpacity={isDark ? 0.2 : 0.4}
                    />
                ))}
            </motion.svg>

            {/* Ambient Glow */}
            <div
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${color}05 0%, transparent 70%)`,
                    opacity: isDark ? 1 : 0.5
                }}
            />
        </div>
    );
}
