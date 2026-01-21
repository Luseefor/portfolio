'use client';

import { useMemo } from 'react';
import { cityCurve as curve } from '@/utils/curve';
import { CPUPalace } from './CPUPalace';
import { ToonMaterial } from './ToonMaterial';
import { RamStick, Capacitor, Microchip, CoolingFan } from './HardwareAssets';

export function MotherboardCity() {
    // Use the shared curve for the road
    const linePoints = useMemo(() => curve.getPoints(300), []);

    return (
        <group>
            {/* The Road (Circuit Trace) */}
            <mesh position={[0, -0.9, 0]}>
                <tubeGeometry args={[curve, 300, 2, 8, false]} />
                <ToonMaterial color="#222" emissive="#00ffff" emissiveIntensity={0.2} outlineColor="#004444" />
            </mesh>

            {/* --- START: RAM DISTRICT (0 to -30) --- */}
            {/* Left Side Skyscrapers */}
            <RamStick position={[-8, 0, 0]} scale={2} color="#ff0055" />
            <RamStick position={[-8, 0, -8]} scale={1.8} color="#ff0055" />
            <RamStick position={[-10, 0, -15]} scale={2.2} color="#ff0055" />

            {/* Right Side Skyscrapers */}
            <RamStick position={[8, 0, -2]} scale={2} color="#00aaff" />
            <RamStick position={[8, 0, -12]} scale={2.1} color="#00aaff" />
            <RamStick position={[10, 0, -25]} scale={1.5} color="#00aaff" />

            {/* Scatter Capacitors around start */}
            <Capacitor position={[-4, 0, -5]} />
            <Capacitor position={[-5, 0, -2]} scale={0.8} />
            <Capacitor position={[4, 0, -8]} />
            <Capacitor position={[5, 0, -4]} scale={1.2} />


            {/* --- MIDDLE: GPU DISTRICT (-30 to -80) --- */}
            {/* The "Main" GPU Building at the stop point (-50) */}
            <mesh position={[-5, 3, -50]}>
                <boxGeometry args={[10, 1, 15]} />
                <ToonMaterial color="#222" outlineColor="black" />
            </mesh>
            <CoolingFan position={[-5, 4, -50]} scale={3} />
            <CoolingFan position={[-5, 4, -45]} scale={2} />
            <CoolingFan position={[-5, 4, -55]} scale={2} />

            {/* Surrounding Components */}
            <Microchip position={[8, 0, -40]} scale={2} rotation={[0, 0.5, 0]} />
            <Microchip position={[12, 0, -50]} scale={3} />
            <Capacitor position={[6, 0, -45]} scale={1.5} />
            <Capacitor position={[5, 0, -55]} scale={1.5} />


            {/* --- CONTACT: IO LANE (-80 to -120) --- */}
            {/* Process of rising up to CPU */}
            {Array.from({ length: 10 }).map((_, i) => (
                <Capacitor key={i} position={[i % 2 === 0 ? 5 : -5, 0, -80 - i * 3]} scale={0.5 + Math.random()} />
            ))}
            <Microchip position={[-8, 0, -90]} scale={1.5} />
            <Microchip position={[8, 0, -100]} scale={1.5} />


            {/* The Final Destination: CPU Palace */}
            <CPUPalace position={[0, 11, -120]} />
        </group>
    );
}
