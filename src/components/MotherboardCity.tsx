'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { cityCurve } from '@/utils/curve';

const JUNCTIONS = [0.2, 0.5, 0.8]; // T values for junctions
const JUNCTION_WIDTH = 0.05; // Width in T space

export function MotherboardCity() {
    const leftLineCurve = useMemo(() => getOffsetCurve(cityCurve, -8), []);
    const rightLineCurve = useMemo(() => getOffsetCurve(cityCurve, 8), []);
    const centerLineCurve = useMemo(() => getOffsetCurve(cityCurve, 0), []);

    return (
        <group>
            {/* Main Road Surface */}
            <mesh name="road" position={[0, 0, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[cityCurve, 800, 10, 8, false]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>

            {/* Left White Line */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[leftLineCurve, 800, 0.15, 4, false]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Right White Line - Gapped at junctions */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[rightLineCurve, 800, 0.15, 4, false]} />
                <shaderMaterial
                    transparent
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        void main() {
                            float t = vUv.x;
                            // Gap logic for junctions (precision improved for 2000 segments)
                            if (abs(t - 0.2) < 0.005 || abs(t - 0.8) < 0.005) discard;
                            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                        }
                    `}
                />
            </mesh>

            {/* Left Side Line - Gapped for left junction at 0.5 */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[leftLineCurve, 2000, 0.15, 4, false]} />
                <shaderMaterial
                    transparent
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        void main() {
                            float t = vUv.x;
                            if (abs(t - 0.5) < 0.005) discard;
                            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                        }
                    `}
                />
            </mesh>

            {/* Yellow Center Line */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[centerLineCurve, 2000, 0.15, 4, false]} />
                <shaderMaterial
                    transparent
                    uniforms={{ uColor: { value: new THREE.Color('#f0c040') } }}
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
                            float dash = step(0.5, fract(vUv.x * 100.0));
                            if (dash < 0.5) discard;
                            gl_FragColor = vec4(uColor, 1.0);
                        }
                    `}
                />
            </mesh>

            {/* Junctions */}
            <Junction t={0.2} side={1} curve={cityCurve} />
            <Junction t={0.5} side={-1} curve={cityCurve} />
            <Junction t={0.8} side={1} curve={cityCurve} />
        </group>
    );
}

function Junction({ t, side, curve }: { t: number; side: number; curve: THREE.CatmullRomCurve3 }) {
    const length = 50;
    const width = 14;

    const { position, rotation } = useMemo(() => {
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x);
        const midPoint = p.clone().add(norm.clone().multiplyScalar(side * (length / 2 + 10)));
        const angle = Math.atan2(norm.x, norm.z);
        return { position: midPoint, rotation: new THREE.Euler(0, angle, 0) };
    }, [t, side, curve]);

    return (
        <group position={[position.x, 0.05, position.z]} rotation={rotation}>
            {/* Blending Apron (The part that merges with the main road) */}
            <mesh position={[0, -0.05, -length / 2 - 2]} rotation={[0, 0, 0]}>
                <boxGeometry args={[width + 8, 0.1, 8]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Side Road Surface */}
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[width, 0.1, length]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>

            {/* Zebra Crossing */}
            <ZebraCrossing position={[0, 0.02, -length / 2 + 6]} width={width} height={5} />

            {/* Center Line */}
            <mesh position={[0, 0.01, 0]}>
                <boxGeometry args={[0.15, 0.02, length]} />
                <meshStandardMaterial color="white" transparent opacity={0.6} />
            </mesh>

            {/* Stop Line */}
            <mesh position={[0, 0.02, -length / 2 + 1]}>
                <boxGeometry args={[width, 0.02, 0.6]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
}

function ZebraCrossing({ position, width, height }: { position: [number, number, number], width: number, height: number }) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width, height]} />
            <shaderMaterial
                transparent
                vertexShader={`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `}
                fragmentShader={`
                    varying vec2 vUv;
                    void main() {
                        float stripes = step(0.5, fract(vUv.x * 8.0)); 
                        if (stripes < 0.5) discard;
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    }
                `}
            />
        </mesh>
    );
}

function getOffsetCurve(curve: THREE.CatmullRomCurve3, offset: number) {
    const points = [];
    const samples = 200;
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const p = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
        points.push(p.clone().add(normal.multiplyScalar(offset)));
    }
    return new THREE.CatmullRomCurve3(points);
}
