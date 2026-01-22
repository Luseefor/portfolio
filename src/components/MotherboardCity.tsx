'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cityCurve } from '@/utils/curve';
import { useStore } from '@/utils/store';
import { instancedBuildingMaterial, CircuitCable } from './HardwareAssets';

const BOX_GEO = new THREE.BoxGeometry(1, 1, 1);

export function MotherboardCity() {
    const leftLineCurve = useMemo(() => getOffsetCurve(cityCurve, -8.5), []);
    const rightLineCurve = useMemo(() => getOffsetCurve(cityCurve, 8.5), []);
    const centerLineCurve = useMemo(() => getOffsetCurve(cityCurve, 0), []);
    const setFocusedItem = useStore((state) => state.setFocusedItem);

    const meshRef = useRef<THREE.InstancedMesh>(null!);

    useFrame((state) => {
        instancedBuildingMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    // Optimized Decorative City Data (NOW ULTRA DENSE)
    const decorData = useMemo(() => {
        const count = 1800;
        const items = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const side = Math.random() > 0.5 ? 1 : -1;

            // Tighter clustering closer to the road for "Urban Canyon" feel
            // Dist starts at 18 (just outside sidewalk) and goes up to 100
            // Weighted towards the front
            const distBase = Math.pow(Math.random(), 1.5);
            const dist = 18 + distBase * 80;

            const p = cityCurve.getPointAt(t);
            const tan = cityCurve.getTangentAt(t).normalize();
            const norm = new THREE.Vector3(-tan.z, 0, tan.x);
            const pos = p.clone().add(norm.multiplyScalar(side * dist));

            // Buildings are taller and slimmer for "Tightly spaced apartments"
            const w = 3 + Math.random() * 5;
            const h = 15 + Math.random() * 60;
            const d = 3 + Math.random() * 5;

            const type = Math.random() > 0.4 ? 1.0 : 0.0;
            const colorInt = Math.random();
            const color = new THREE.Color(type > 0.5 ? (colorInt > 0.5 ? '#00ffff' : '#ff00ff') : (colorInt > 0.5 ? '#ffff00' : '#ffffff'));

            items.push({ pos, w, h, d, type, color });
        }
        return items;
    }, []);

    // Natural Detail: Circuit Cables between buildings (Refined for density)
    const cables = useMemo(() => {
        const items = [];
        for (let i = 0; i < 60; i++) { // Increased cable count
            const idxA = Math.floor(Math.random() * decorData.length);
            const idxB = Math.floor(Math.random() * decorData.length);
            const a = decorData[idxA];
            const b = decorData[idxB];

            const dist = a.pos.distanceTo(b.pos);
            if (dist < 30 && dist > 5) {
                const start = a.pos.clone();
                start.y = a.h * 0.7;
                const end = b.pos.clone();
                end.y = b.h * 0.7;
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
            tempObj.rotation.set(0, (Math.random() - 0.5) * 0.2, 0); // Slight rotation for organic feel
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);

            item.color.toArray(colors, i * 3);
            types[i] = item.type;
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
        meshRef.current.geometry.setAttribute('instanceType', new THREE.InstancedBufferAttribute(types, 1));
    }, [decorData]);

    return (
        <group>
            {/* Optimized Asphalt Road (Shadow Receiver) */}
            <mesh name="road" position={[0, -0.05, 0]} scale={[1, 0.01, 1]} receiveShadow>
                <tubeGeometry args={[cityCurve, 800, 10, 8, false]} />
                <meshStandardMaterial color="#050507" roughness={0.7} metalness={0.3} />
            </mesh>

            {/* Organic Detail: Cables connecting buildings */}
            <group>
                {cables.map((cable, i) => (
                    <CircuitCable key={i} start={cable.start} end={cable.end} color={cable.color} />
                ))}
            </group>

            {/* INSTANCED City Clusters (SINGLE DRAW CALL) */}
            <instancedMesh ref={meshRef} args={[BOX_GEO, instancedBuildingMaterial, 1800]} />

            {/* Left White Line */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[leftLineCurve, 800, 0.15, 4, false]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Right White Line - Continuous */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[rightLineCurve, 800, 0.15, 4, false]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Left Side Line - Continuous */}
            <mesh position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <tubeGeometry args={[leftLineCurve, 2000, 0.15, 4, false]} />
                <meshStandardMaterial color="white" />
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
        </group>
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
