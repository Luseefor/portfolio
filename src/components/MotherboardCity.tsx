'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cityCurve } from '@/utils/curve';
import { useStore } from '@/utils/store';
import { instancedBuildingMaterial, RamStick, Microchip, Capacitor, CircuitCable } from './HardwareAssets';

const JUNCTIONS = [0.2, 0.5, 0.8]; // T values for junctions
const JUNCTION_WIDTH = 0.05; // Width in T space
const BOX_GEO = new THREE.BoxGeometry(1, 1, 1);

export function MotherboardCity() {
    const leftLineCurve = useMemo(() => getOffsetCurve(cityCurve, -8.5), []);
    const rightLineCurve = useMemo(() => getOffsetCurve(cityCurve, 8.5), []);
    const centerLineCurve = useMemo(() => getOffsetCurve(cityCurve, 0), []);
    const leftSidewalkCurve = useMemo(() => getOffsetCurve(cityCurve, -22), []);
    const rightSidewalkCurve = useMemo(() => getOffsetCurve(cityCurve, 22), []);
    const setFocusedItem = useStore((state) => state.setFocusedItem);

    const meshRef = useRef<THREE.InstancedMesh>(null!);

    useFrame((state) => {
        instancedBuildingMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    // Optimized Decorative City Data
    const decorData = useMemo(() => {
        const count = 500;
        const items = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 35 + Math.random() * 60;
            const p = cityCurve.getPointAt(t);
            const tan = cityCurve.getTangentAt(t).normalize();
            const norm = new THREE.Vector3(-tan.z, 0, tan.x);
            const pos = p.clone().add(norm.multiplyScalar(side * dist));

            const w = 4 + Math.random() * 4;
            const h = 10 + Math.random() * 40;
            const d = 4 + Math.random() * 4;
            const type = Math.random() > 0.5 ? 1.0 : 0.0;
            const colorInt = Math.random();
            const color = new THREE.Color(type > 0.5 ? (colorInt > 0.5 ? '#00ffff' : '#ff00ff') : (colorInt > 0.5 ? '#ffff00' : '#ffffff'));

            items.push({ pos, w, h, d, type, color });
        }
        return items;
    }, []);

    // Natural Detail: Circuit Cables between buildings
    const cables = useMemo(() => {
        const items = [];
        for (let i = 0; i < 30; i++) {
            const idxA = Math.floor(Math.random() * decorData.length);
            const idxB = Math.floor(Math.random() * decorData.length);
            const a = decorData[idxA];
            const b = decorData[idxB];

            // Only connect nearby buildings on the same side
            const dist = a.pos.distanceTo(b.pos);
            if (dist < 40 && dist > 10) {
                const start = a.pos.clone();
                start.y = a.h * 0.8;
                const end = b.pos.clone();
                end.y = b.h * 0.8;
                items.push({ start, end, color: a.color.getStyle() });
            }
        }
        return items;
    }, [decorData]);

    useLayoutEffect(() => {
        const tempObj = new THREE.Object3D();
        const colors = new Float32Array(decorData.length * 3);
        const types = new Float32Array(decorData.length);

        decorData.forEach((item, i) => {
            tempObj.position.set(item.pos.x, item.h / 2, item.pos.z);
            tempObj.scale.set(item.w, item.h, item.d);
            tempObj.rotation.set(0, Math.random() * Math.PI, 0);
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);

            item.color.toArray(colors, i * 3);
            types[i] = item.type;
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
        meshRef.current.geometry.setAttribute('instanceType', new THREE.InstancedBufferAttribute(types, 1));
    }, [decorData]);

    // Streetlights for "Bustling City" feel (OPTIMIZED: No PointLights)
    const streetlights = useMemo(() => {
        const lights = [];
        for (let i = 0; i < 40; i++) {
            const t = i / 40;
            const p = cityCurve.getPointAt(t);
            const tan = cityCurve.getTangentAt(t).normalize();
            const norm = new THREE.Vector3(-tan.z, 0, tan.x);
            lights.push({ pos: p.clone().add(norm.multiplyScalar(12)) });
            lights.push({ pos: p.clone().add(norm.multiplyScalar(-12)) });
        }
        return lights;
    }, []);

    // Interactive Nodes between skyscrapers
    const interactiveNodes = useMemo(() => {
        const items = [];
        const content = [
            { title: "Cache Layer", content: "Ultra-fast L3 cache handling project data fetching and state synchronization." },
            { title: "Bus Controller", content: "Manages the high-speed communication between interactive UI and 3D scene." },
            { title: "Bridge Module", content: "Connects legacy knowledge with cutting-edge future technologies." }
        ];
        for (let i = 0; i < 15; i++) {
            const t = Math.random();
            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 14 + Math.random() * 6; // Sidewalk zone (10-22)
            const p = cityCurve.getPointAt(t);
            const tan = cityCurve.getTangentAt(t).normalize();
            const norm = new THREE.Vector3(-tan.z, 0, tan.x);
            const pos = p.clone().add(norm.multiplyScalar(side * dist));
            const data = content[i % content.length];
            const type = i % 3 === 0 ? 'ram' : (i % 3 === 1 ? 'chip' : 'cap');
            items.push({ pos, type, data });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Ultra Smooth Asphalt Road */}
            <mesh name="road" position={[0, -0.05, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[cityCurve, 1200, 10, 8, false]} />
                <meshStandardMaterial color="#08080b" roughness={0.9} metalness={0.1} />
            </mesh>

            {/* Elevated Sidewalks */}
            <mesh position={[0, -0.01, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[leftSidewalkCurve, 600, 12, 4, false]} />
                <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.01, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[rightSidewalkCurve, 600, 12, 4, false]} />
                <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>

            {/* Organic Detail: Cables connecting buildings */}
            <group>
                {cables.map((cable, i) => (
                    <CircuitCable key={i} start={cable.start} end={cable.end} color={cable.color} />
                ))}
            </group>

            {/* Streetlights (Optimized) */}
            {streetlights.map((light, i) => (
                <group key={i} position={[light.pos.x, 0, light.pos.z]}>
                    <mesh position={[0, 4, 0]}>
                        <cylinderGeometry args={[0.05, 0.08, 8, 8]} />
                        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 8, 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color="#ffaa00" toneMapped={false} />
                    </mesh>
                </group>
            ))}

            {/* INSTANCED Motherboard City (SINGLE DRAW CALL) */}
            <instancedMesh ref={meshRef} args={[BOX_GEO, instancedBuildingMaterial, 500]} />

            {/* Interactive Motherboard Nodes (On Sidewalks) */}
            {interactiveNodes.map((item, i) => (
                <group
                    key={`int-${i}`}
                    position={item.pos}
                    onClick={(e) => {
                        e.stopPropagation();
                        setFocusedItem(item.data);
                    }}
                    onPointerOver={() => { document.body.style.cursor = 'pointer' }}
                    onPointerOut={() => { document.body.style.cursor = 'auto' }}
                >
                    {item.type === 'ram' && <RamStick position={[0, 0, 0]} scale={0.5} color="#00ffff" />}
                    {item.type === 'chip' && <Microchip position={[0, 0, 0]} scale={0.8} />}
                    {item.type === 'cap' && <Capacitor position={[0, 0, 0]} scale={0.6} />}
                </group>
            ))}

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
