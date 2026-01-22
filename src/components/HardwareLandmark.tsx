'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GraphicsCard, RamStick, Microchip, CoolingFan } from './HardwareAssets';
import { mapScrollToCurve } from '@/utils/curve';

interface Section {
    id: string;
    title: string;
    description: string;
    details: string[];
    asset: 'gpu' | 'ram' | 'cpu' | 'fan';
    t: number;
}

const SECTIONS: Section[] = [
    {
        id: 'bio',
        title: 'Graphics Processing',
        description: 'Who am I?',
        details: ['Passionate Full-Stack Developer', '3D Web Pioneer', 'AI Enthusiast'],
        asset: 'gpu',
        t: 0.25,
    },
    {
        id: 'education',
        title: 'Memory Module',
        description: 'Education & Research',
        details: ['BS in Computer Engineering', 'Focus on Hardware-Software Co-design', 'Specialized in High-Perf Architecture'],
        asset: 'ram',
        t: 0.45,
    },
    {
        id: 'skills',
        title: 'Central Processing',
        description: 'Technical Toolkit',
        details: ['React / Next.js / TypeScript', 'Three.js / WebGL / Shaders', 'Node.js / Python / Rust'],
        asset: 'cpu',
        t: 0.7,
    },
    {
        id: 'projects',
        title: 'Thermal Management',
        description: 'Dynamic Solutions',
        details: ['Hardware-Accelerated Web Apps', 'Interactive 3D Visualizations', 'Scalable AI Architectures'],
        asset: 'fan',
        t: 0.9,
    }
];

export function HardwareLandmarks({ curve }: { curve: THREE.CatmullRomCurve3 }) {
    return (
        <group>
            {SECTIONS.map((section) => (
                <HardwareLandmark key={section.id} section={section} curve={curve} />
            ))}
        </group>
    );
}

function HardwareLandmark({ section, curve }: { section: Section, curve: THREE.CatmullRomCurve3 }) {
    const { position, rotation } = useMemo(() => {
        const p = curve.getPointAt(section.t);
        const tan = curve.getTangentAt(section.t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x);
        // SIDEBANKED Landmarks: Pushed far back to sit behind sidewalks (Concrete/Asphalt logic)
        const sidePos = p.clone().add(norm.multiplyScalar(40));
        const angle = Math.atan2(tan.x, tan.z) + Math.PI / 2;
        return { position: sidePos, rotation: new THREE.Euler(0, angle, 0) };
    }, [section.t, curve]);

    return (
        <group position={position} rotation={rotation}>
            {section.asset === 'gpu' && <GraphicsCard position={[0, 0, 0]} scale={2.5} />}
            {section.asset === 'ram' && <RamStick position={[0, 0, 0]} scale={2} color="#00ffff" />}
            {section.asset === 'cpu' && <Microchip position={[0, 0, 0]} scale={3.5} />}
            {section.asset === 'fan' && <CoolingFan position={[0, 0, 0]} scale={3} />}
        </group>
    );
}
