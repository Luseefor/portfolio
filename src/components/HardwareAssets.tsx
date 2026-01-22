'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. RAM STICK
export function RamStick({ position, rotation, scale = 1, color = "#ff0055" }: { position: [number, number, number], rotation?: [number, number, number], scale?: number, color?: string }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            {/* PCB Board */}
            <mesh position={[0, 5, 0]}>
                <boxGeometry args={[0.5, 10, 4]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Gold Pins */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.55, 1, 3.8]} />
                <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.9} />
            </mesh>

            {/* Heatsink Body */}
            <mesh position={[0, 6, 0]}>
                <boxGeometry args={[0.6, 9, 3.8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.1} metalness={0.8} />
            </mesh>
        </group>
    );
}

// 2. CAPACITOR
export function Capacitor({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    return (
        <group position={position} scale={scale}>
            {/* Body */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
            </mesh>
            {/* Stripe */}
            <mesh position={[0.81, 1.5, 0]}>
                <boxGeometry args={[0.05, 2.8, 0.5]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} />
            </mesh>
            {/* Top Cap */}
            <mesh position={[0, 3.01, 0]}>
                <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
                <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

// 3. MICROCHIP
export function Microchip({ position, scale = 1, rotation }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            {/* Body */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[4, 1, 4]} />
                <meshStandardMaterial color="#0a0a0a" roughness={1} metalness={0.1} />
            </mesh>

            {/* Legs */}
            {Array.from({ length: 6 }).map((_, i) => (
                <group key={i}>
                    <mesh position={[-2.1, 0.2, -1.5 + i * 0.6]}>
                        <boxGeometry args={[0.4, 0.4, 0.2]} />
                        <meshStandardMaterial color="#888" metalness={0.9} />
                    </mesh>
                    <mesh position={[2.1, 0.2, -1.5 + i * 0.6]}>
                        <boxGeometry args={[0.4, 0.4, 0.2]} />
                        <meshStandardMaterial color="#888" metalness={0.9} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// 4. COOLING FAN
export function CoolingFan({ position, scale = 1, rotation }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    const bladeRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (bladeRef.current) {
            bladeRef.current.rotation.y += delta * 10;
        }
    });

    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[2.5, 2.5, 2, 32, 1, true]} />
                <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} metalness={0.5} roughness={0.2} />
            </mesh>

            <mesh position={[0, 1, 0]} ref={bladeRef}>
                <cylinderGeometry args={[0.5, 0.5, 0.5, 8]} />
                <meshStandardMaterial color="#111" />
                {Array.from({ length: 7 }).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
                        <boxGeometry args={[2, 0.1, 0.5]} />
                        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.1} />
                    </mesh>
                ))}
            </mesh>

            <mesh position={[0, 2.01, 0]}>
                <ringGeometry args={[2.2, 2.5, 32]} />
                <meshBasicMaterial color="#00ffff" toneMapped={false} />
            </mesh>
        </group>
    );
}

// 5. GRAPHICS CARD (GPU)
export function GraphicsCard({ position, rotation, scale = 1 }: { position: [number, number, number], rotation?: [number, number, number], scale?: number }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            <mesh position={[0, 4, 0]}>
                <boxGeometry args={[0.4, 8, 12]} />
                <meshStandardMaterial color="#050505" roughness={0.8} metalness={0.1} />
            </mesh>
            <mesh position={[-0.25, 4, 0]}>
                <boxGeometry args={[0.1, 7.8, 11.8]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>

            {[-3.5, 0, 3.5].map((z, i) => (
                <group key={i} position={[0.3, 4, z]} rotation={[0, 0, -Math.PI / 2]}>
                    <mesh>
                        <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
                        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.15, 0]}>
                        <ringGeometry args={[1.6, 1.8, 32]} />
                        <meshBasicMaterial color="#00ff88" toneMapped={false} />
                    </mesh>
                </group>
            ))}

            <mesh position={[0.21, 7.5, 0]}>
                <boxGeometry args={[0.05, 0.2, 10]} />
                <meshBasicMaterial color="#00ff88" toneMapped={false} />
            </mesh>
        </group>
    );
}

// 6. CAPACITOR TOWER
export function CapacitorTower({ position, scale = 1, color = "#00ffff" }: { position: [number, number, number], scale?: number, color?: string }) {
    const height = 15 + Math.random() * 25;
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, height / 2, 0]}>
                <cylinderGeometry args={[2, 2.2, height, 16]} />
                <meshStandardMaterial color="#080808" roughness={0.6} metalness={0.2} />
            </mesh>
            {Array.from({ length: Math.floor(height / 4) }).map((_, i) => (
                <mesh key={i} position={[0, i * 4 + 2, 0]}>
                    <cylinderGeometry args={[2.22, 2.22, 0.4, 16]} />
                    <meshBasicMaterial color={color} toneMapped={false} />
                </mesh>
            ))}
        </group>
    );
}

// 7. CHIP BUILDING
export function ChipBuilding({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    const w = 6 + Math.random() * 4;
    const h = 10 + Math.random() * 30;
    const d = 6 + Math.random() * 4;
    const color = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';

    return (
        <group position={position} scale={scale}>
            <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color="#050505" roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[w + 0.1, h - 2, d + 0.1]} />
                <shaderMaterial
                    transparent
                    uniforms={{ uColor: { value: new THREE.Color(color) } }}
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform vec3 uColor;
                        void main() {
                            vec2 grid = fract(vUv * vec2(10.0, 20.0));
                            float win = step(0.1, grid.x) * step(0.1, grid.y);
                            if (win < 0.5) discard;
                            gl_FragColor = vec4(uColor, 0.6);
                        }
                    `}
                />
            </mesh>
        </group>
    );
}

// 8. INSTANCED BUILDING SHADER (Ultra-fast & Living)
export const instancedBuildingMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uTime: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        attribute vec3 instanceColor;
        attribute float instanceType;
        varying vec3 vColor;
        varying float vType;
        varying float vHeight;
        void main() {
            vUv = uv;
            vColor = instanceColor;
            vType = instanceType;
            vHeight = position.y + 0.5; // Offset to start from bottom
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vType;
        varying float vHeight;
        uniform float uTime;
        void main() {
            vec3 color = vec3(0.015, 0.015, 0.018); // Dark industrial slate
            
            if (vType > 0.5) {
                // Chip style: Window grid + logic lines
                vec2 grid = fract(vUv * vec2(8.0, 20.0));
                float win = step(0.2, grid.x) * step(0.1, grid.y);
                if (win > 0.5) color = vColor * 0.25;
                
                // Tech lines (Living circuits)
                float lines = step(0.995, fract(vUv.y * 100.0));
                if (lines > 0.5) color = vColor;
            } else {
                // Capacitor style: Vertical stripes + danger zone
                float stripe = step(0.85, fract(vUv.x * 2.0));
                if (stripe > 0.5) color = vec3(0.9, 0.7, 0.0);
                
                // Glowing rings
                float rings = step(0.96, fract(vUv.y * 15.0));
                if (rings > 0.5) color = vColor;
            }
            
            // Subtle edge lighting for "Million Dollar" stability/separation
            float edge = step(0.98, vUv.x) + step(0.98, 1.0-vUv.x);
            color += vec3(0.1) * edge;

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

// 9. CIRCUIT CABLE (Organic technical detail)
export function CircuitCable({ start, end, color = "#00ffff" }: { start: THREE.Vector3, end: THREE.Vector3, color?: string }) {
    const curve = useMemo(() => {
        const mid = start.clone().lerp(end, 0.5);
        mid.y += 5 + Math.random() * 10;
        return new THREE.QuadraticBezierCurve3(start, mid, end);
    }, [start, end]);

    return (
        <mesh>
            <tubeGeometry args={[curve, 20, 0.1, 8, false]} />
            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            <mesh>
                <tubeGeometry args={[curve, 20, 0.12, 8, false]} />
                <shaderMaterial
                    transparent
                    uniforms={{ uColor: { value: new THREE.Color(color) }, uTime: { value: 0 } }}
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform vec3 uColor;
                        uniform float uTime;
                        void main() {
                            float pulse = step(0.9, fract(vUv.x * 5.0 - uTime * 2.0));
                            if (pulse < 0.5) discard;
                            gl_FragColor = vec4(uColor, 0.8);
                        }
                    `}
                />
            </mesh>
        </mesh>
    );
}

// 8. HIGH PERFORMANCE BUILDING (Deprecated in favor of instanced, but kept for landmarks)
export function HighPerfBuilding({ position, scale = 1, type = 'chip' }: { position: [number, number, number], scale?: number, type?: 'chip' | 'cap' }) {
    const w = type === 'chip' ? 4 + Math.random() * 4 : 2 + Math.random() * 2;
    const h = 10 + Math.random() * 40;
    const d = type === 'chip' ? 4 + Math.random() * 4 : 2 + Math.random() * 2;
    const colorInt = Math.random();
    const color = type === 'chip' ? (colorInt > 0.5 ? '#00ffff' : '#ff00ff') : (colorInt > 0.5 ? '#ffff00' : '#ffffff');

    return (
        <group position={position} scale={scale}>
            <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[w, h, d]} />
                <shaderMaterial
                    transparent
                    uniforms={{
                        uColor: { value: new THREE.Color(color) },
                        uType: { value: type === 'chip' ? 1.0 : 0.0 }
                    }}
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform vec3 uColor;
                        uniform float uType;
                        void main() {
                            vec3 color = vec3(0.02, 0.02, 0.02);
                            if (uType > 0.5) {
                                vec2 grid = fract(vUv * vec2(8.0, 20.0));
                                float win = step(0.2, grid.x) * step(0.1, grid.y);
                                if (win > 0.5) color = uColor * 0.3;
                                float lines = step(0.99, fract(vUv.y * 100.0));
                                if (lines > 0.5) color = uColor;
                            } else {
                                float stripe = step(0.85, fract(vUv.x * 2.0));
                                if (stripe > 0.5) color = vec3(1.0, 0.8, 0.0);
                                float rings = step(0.95, fract(vUv.y * 15.0));
                                if (rings > 0.5) color = uColor;
                            }
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `}
                />
            </mesh>
        </group>
    );
}
