'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Sphere, Float, Stars } from '@react-three/drei';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { PORTFOLIO_CONTENT } from '@/app/identity/portfolio-template';
import * as THREE from 'three';

// --- 3D COMPONENTS ---

const HolographicCore = ({ scrollProgress }: { scrollProgress: any }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    // Smoothly interpolate color based on scroll
    // 0 -> Blue, 0.5 -> Purple, 1 -> Orange
    const color = useTransform(
        scrollProgress,
        [0, 0.5, 1],
        ['#00f0ff', '#bd00ff', '#ff6b00']
    );

    const distort = useTransform(scrollProgress, [0, 1], [0.3, 0.8]);
    const speed = useTransform(scrollProgress, [0, 1], [1.5, 4]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
        if (materialRef.current) {
            // Manual update for non-motion-value props if needed, 
            // but we'll try to use the color state directly if possible or update manually
            materialRef.current.color.set(color.get());
            materialRef.current.distort = distort.get();
            materialRef.current.speed = speed.get();
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1.5, 64, 64]}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#00f0ff"
                    emissive="#000000"
                    roughness={0.1}
                    metalness={1}
                    distort={0.4}
                    speed={2}
                    wireframe={true} // Cyberpunk wireframe feel
                />
            </Sphere>
            {/* Inner Core */}
            <Sphere args={[1.0, 32, 32]}>
                <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
            </Sphere>
        </Float>
    );
};

const Scene = ({ scrollProgress }: { scrollProgress: any }) => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -5]} intensity={1} color="#ff0000" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <HolographicCore scrollProgress={scrollProgress} />

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </>
    );
};

// --- TIMELINE COMPONENTS ---

const ExperienceCard = ({ item, index }: { item: any; index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative pl-8 pb-16 border-l border-white/10 last:border-0 group"
        >
            {/* Timeline Dot */}
            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] group-hover:scale-150 transition-transform duration-300" />

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.role}</h3>
                    <span className="text-xs font-mono text-cyan-500/80 bg-cyan-500/10 px-2 py-1 rounded inline-block mt-2 md:mt-0">{item.period}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-300 mb-4">{item.company}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
            </div>
        </motion.div>
    );
};

export default function ExperienceSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Smooth spring for the 3D interaction
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    return (
        <section ref={containerRef} className="relative w-full min-h-[150vh] flex flex-col md:flex-row bg-[#020410]">

            {/* LEFT: 3D Sticky Panel */}
            <div className="md:w-1/2 h-[50vh] md:h-screen md:sticky md:top-0 flex items-center justify-center bg-gradient-to-b from-[#020410] to-[#050714] overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <Scene scrollProgress={smoothProgress} />
                    </Canvas>
                </div>

                {/* Overlay Text */}
                <div className="absolute bottom-10 left-10 pointer-events-none z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-2">
                            Professional<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Experience</span>
                        </h2>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            Drag model to rotate
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT: Scrollable Timeline */}
            <div className="md:w-1/2 p-6 md:p-24 flex flex-col justify-center">
                <div className="space-y-4">
                    {PORTFOLIO_CONTENT.experience.items.map((item, i) => (
                        <ExperienceCard key={i} item={item} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
