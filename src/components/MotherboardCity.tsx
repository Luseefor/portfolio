'use client';

import { useMemo } from 'react';
import { cityCurve as curve } from '@/utils/curve';
import { CPUPalace } from './CPUPalace';
import { ToonMaterial } from './ToonMaterial';
import { RamStick, Capacitor, Microchip, CoolingFan } from './HardwareAssets';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export function MotherboardCity() {

    // Revert to TubeGeometry but FLATTEN it to make a road
    // ExtrudeGeometry was causing vertical wall issues due to frame orientation

    return (
        <group>
            {/* THE ROAD: Black Asphalt */}
            {/* We use a large tube and scale it down on Y to make a flat ribbon */}
            <mesh position={[0, -1, 0]} scale={[1, 0.05, 1]}>
                <tubeGeometry args={[curve, 400, 3, 8, false]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* --- CITY INFRASTRUCTURE --- */}

            {/* DISTRICT 1: MEMORY LANE (Starts) */}
            <group>
                {/* Left Block */}
                <mesh position={[-12, -1, 0]}>
                    <boxGeometry args={[10, 0.5, 40]} />
                    <meshStandardMaterial color="#0a0a0a" />
                </mesh>
                <RamStick position={[-10, 0, 0]} scale={3} color="#D12020" />
                <RamStick position={[-10, 0, -8]} scale={3} color="#D12020" />
                <RamStick position={[-14, 0, -4]} scale={4} color="#D12020" />
                <RamStick position={[-10, 0, -16]} scale={3} color="#D12020" />

                {/* Right Block */}
                <mesh position={[12, -1, -5]}>
                    <boxGeometry args={[10, 0.5, 50]} />
                    <meshStandardMaterial color="#0a0a0a" />
                </mesh>
                <RamStick position={[10, 0, -5]} scale={3} color="#00aaff" />
                <RamStick position={[10, 0, -15]} scale={3.5} color="#00aaff" />
                <RamStick position={[14, 0, -10]} scale={2.5} color="#00aaff" />
            </group>

            {/* DISTRICT 2: POWER PLANT (Capacitors) */}
            <group>
                {/* Massive Capacitor Cluster */}
                <mesh position={[-15, -1, -50]}>
                    <boxGeometry args={[15, 0.5, 30]} />
                    <meshStandardMaterial color="#0a0a0a" />
                </mesh>
                <Capacitor position={[-12, 0, -45]} scale={2} />
                <Capacitor position={[-16, 0, -45]} scale={2.5} />
                <Capacitor position={[-14, 0, -55]} scale={3} />
            </group>

            {/* DISTRICT 3: GPU FACTORY (Fans) */}
            <group>
                <mesh position={[15, 3, -60]}>
                    <boxGeometry args={[10, 1, 20]} />
                    <ToonMaterial color="#222" outlineColor="cyan" />
                </mesh>
                <CoolingFan position={[15, 4, -60]} scale={4} rotation={[Math.PI / 2, 0, 0]} />
                <CoolingFan position={[15, 4, -55]} scale={3} rotation={[Math.PI / 2, 0, 0]} />

                {/* Ground Scatter */}
                <Microchip position={[8, 0, -50]} scale={2} />
                <Microchip position={[8, 0, -65]} scale={2} />
            </group>

            {/* DISTRICT 4: THE CORE APPROACH */}
            {/* Lining the path to CPU */}
            {Array.from({ length: 8 }).map((_, i) => (
                <group key={i}>
                    <RamStick position={[-8, 0, -90 - i * 4]} scale={2} color="#cc00ff" />
                    <RamStick position={[8, 0, -90 - i * 4]} scale={2} color="#cc00ff" />
                </group>
            ))}


            {/* The Final Destination: CPU Palace */}
            <CPUPalace position={[0, 11, -130]} />
        </group>
    );
}
