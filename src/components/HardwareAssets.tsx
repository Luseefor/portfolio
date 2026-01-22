import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// 1. WELCOME GATE (The Starting Arch)
export function WelcomeGate({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
    return (
        <group position={position} rotation={new THREE.Euler(...rotation)}>
            {/* Main Arch Structure */}
            <mesh position={[-12, 10, 0]}>
                <boxGeometry args={[1, 20, 1]} />
                <meshStandardMaterial color="#0a2510" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[12, 10, 0]}>
                <boxGeometry args={[1, 20, 1]} />
                <meshStandardMaterial color="#0a2510" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 20, 0]}>
                <boxGeometry args={[25, 1, 1]} />
                <meshStandardMaterial color="#0a2510" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Neon Text */}
            <Text
                position={[0, 22, 0]}
                fontSize={2}
                color="#00ffff"
                font="/fonts/Inter-Bold.woff"
                anchorX="center"
                anchorY="middle"
            >
                WELCOME TO THE MOTHERBOARD
                <meshBasicMaterial color="#00ffff" toneMapped={false} />
            </Text>

            {/* Glowing Accent */}
            <mesh position={[0, 20.2, 0]}>
                <boxGeometry args={[26, 0.2, 1.1]} />
                <meshBasicMaterial color="#00ffff" toneMapped={false} />
            </mesh>
        </group>
    );
}

// 2. COMPONENT SKYSCRAPERS (Instanced Models)
export const RESISTOR_GEO = new THREE.CylinderGeometry(1, 1, 1, 16);
export const IC_GEO = new THREE.BoxGeometry(1, 1, 1);
export const TRANSFORMER_GEO = new THREE.BoxGeometry(1, 1, 1);

export const componentMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uTime: { value: 0 }
    },
    vertexShader: `
        attribute mat4 instanceMatrix;
        attribute vec3 instanceColor;
        attribute float instanceType;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vType;
        varying float vHeight;
        
        void main() {
            vUv = uv;
            vColor = instanceColor;
            vType = instanceType;
            vHeight = position.y + 0.5;
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
            vec3 color = vec3(0.05, 0.08, 0.05); // Dark PCB Green base
            
            if (vType < 0.33) {
                // RESISTOR: Color bands
                float bands = fract(vUv.y * 5.0);
                if (bands < 0.2) color = vec3(0.8, 0.5, 0.2); // Brown
                else if (bands > 0.4 && bands < 0.6) color = vec3(0.9, 0.1, 0.1); // Red
                else if (bands > 0.8) color = vec3(0.7, 0.7, 0.1); // Gold
                else color = vec3(0.7, 0.6, 0.4); // Beige body
            } 
            else if (vType < 0.66) {
                // IC: Metal pins + label
                color = vec3(0.1, 0.1, 0.1); // Black IC body
                float pins = step(0.8, fract(vUv.y * 15.0));
                if (pins > 0.5 && (vUv.x < 0.1 || vUv.x > 0.9)) color = vec3(0.8, 0.8, 0.9); // Silver pins
                
                // Central Label
                float label = step(0.3, vUv.x) * step(0.3, 1.0-vUv.x) * step(0.4, vUv.y) * step(0.4, 1.0-vUv.y);
                if (label > 0.5) color += vec3(0.2);
            }
            else {
                // TRANSFORMER: Copper wire coil effect
                float coils = step(0.5, fract(vUv.y * 40.0));
                if (coils > 0.5) color = vec3(0.7, 0.4, 0.1); // Copper color
                else color = vec3(0.2, 0.2, 0.2); // Core
            }

            // Pulsing data pulse
            float pulse = step(0.98, fract(vHeight * 0.1 - uTime * 0.5));
            color += vColor * pulse * 0.5;

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

// 3. ORIGINAL HARDWARE COMPONENTS (For Landmarks)
export function RamStick({ position, rotation, scale = 1, color = "#ff0055" }: { position: [number, number, number], rotation?: [number, number, number], scale?: number, color?: string }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            <mesh position={[0, 5, 0]}>
                <boxGeometry args={[0.5, 10, 4]} />
                <meshStandardMaterial color="#0a2510" roughness={0.8} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.55, 1, 3.8]} />
                <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.9} />
            </mesh>
            <mesh position={[0, 6, 0]}>
                <boxGeometry args={[0.6, 9, 3.8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.1} metalness={0.8} />
            </mesh>
        </group>
    );
}

export function Capacitor({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0.81, 1.5, 0]}>
                <boxGeometry args={[0.05, 2.8, 0.5]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} />
            </mesh>
            <mesh position={[0, 3.01, 0]}>
                <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
                <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}

export function Microchip({ position, scale = 1, rotation }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined} scale={scale}>
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[4, 1, 4]} />
                <meshStandardMaterial color="#1a1a1a" roughness={1} metalness={0.1} />
            </mesh>
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

export function CoolingFan({ position, scale = 1, rotation }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    const bladeRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (bladeRef.current) bladeRef.current.rotation.y += delta * 10;
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
                    vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                    fragmentShader={`varying vec2 vUv; uniform vec3 uColor; uniform float uTime; void main() { float pulse = step(0.9, fract(vUv.x * 5.0 - uTime * 2.0)); if (pulse < 0.5) discard; gl_FragColor = vec4(uColor, 0.8); }`}
                />
            </mesh>
        </mesh>
    );
}
