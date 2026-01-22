'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cityCurve } from '@/utils/curve';
import { useStore } from '@/utils/store';
import { componentMaterial, RESISTOR_GEO, IC_GEO, TRANSFORMER_GEO, WelcomeGate, RamStick, Microchip, Capacitor, CircuitCable } from './HardwareAssets';

const JUNCTIONS = [0.2, 0.5, 0.8];
const JUNCTION_WIDTH = 0.05;

export function MotherboardCity() {
    const leftLineCurve = useMemo(() => getOffsetCurve(cityCurve, -8.5), []);
    const rightLineCurve = useMemo(() => getOffsetCurve(cityCurve, 8.5), []);
    const centerLineCurve = useMemo(() => getOffsetCurve(cityCurve, 0), []);
    const leftSidewalkCurve = useMemo(() => getOffsetCurve(cityCurve, -22), []);
    const rightSidewalkCurve = useMemo(() => getOffsetCurve(cityCurve, 22), []);
    const setFocusedItem = useStore((state) => state.setFocusedItem);

    const resRef = useRef<THREE.InstancedMesh>(null!);
    const icRef = useRef<THREE.InstancedMesh>(null!);
    const transRef = useRef<THREE.InstancedMesh>(null!);

    useFrame((state) => {
        componentMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    const decorData = useMemo(() => {
        const count = 500;
        const items = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 35 + Math.random() * 80;
            const p = cityCurve.getPointAt(t);
            const tan = cityCurve.getTangentAt(t).normalize();
            const norm = new THREE.Vector3(-tan.z, 0, tan.x);
            const pos = p.clone().add(norm.multiplyScalar(side * dist));

            const h = 10 + Math.random() * 50;
            const compType = Math.random();
            const color = new THREE.Color(compType < 0.33 ? '#8b4513' : (compType < 0.66 ? '#111111' : '#b87333'));

            items.push({ pos, h, type: compType, color });
        }
        return items;
    }, []);

    const cables = useMemo(() => {
        const items = [];
        for (let i = 0; i < 40; i++) {
            const idxA = Math.floor(Math.random() * decorData.length);
            const idxB = Math.floor(Math.random() * decorData.length);
            const a = decorData[idxA];
            const b = decorData[idxB];
            const dist = a.pos.distanceTo(b.pos);
            if (dist < 50 && dist > 15) {
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

        // Prepare arrays for attributes (Max 500 per mesh to match args)
        const maxCount = 500;
        const resColors = new Float32Array(maxCount * 3);
        const resTypes = new Float32Array(maxCount);
        const icColors = new Float32Array(maxCount * 3);
        const icTypes = new Float32Array(maxCount);
        const transColors = new Float32Array(maxCount * 3);
        const transTypes = new Float32Array(maxCount);

        let resIdx = 0, icIdx = 0, transIdx = 0;

        decorData.forEach((item) => {
            tempObj.position.set(item.pos.x, item.h / 2, item.pos.z);
            tempObj.rotation.set(0, Math.random() * Math.PI, 0);

            if (item.type < 0.33) {
                if (resIdx < maxCount) {
                    tempObj.scale.set(3, item.h, 3);
                    tempObj.updateMatrix();
                    resRef.current.setMatrixAt(resIdx, tempObj.matrix);

                    item.color.toArray(resColors, resIdx * 3);
                    resTypes[resIdx] = 0.1; // Resistor ID
                    resIdx++;
                }
            } else if (item.type < 0.66) {
                if (icIdx < maxCount) {
                    tempObj.scale.set(12, item.h, 12);
                    tempObj.updateMatrix();
                    icRef.current.setMatrixAt(icIdx, tempObj.matrix);

                    item.color.toArray(icColors, icIdx * 3);
                    icTypes[icIdx] = 0.5; // IC ID
                    icIdx++;
                }
            } else {
                if (transIdx < maxCount) {
                    tempObj.scale.set(8, item.h, 8);
                    tempObj.updateMatrix();
                    transRef.current.setMatrixAt(transIdx, tempObj.matrix);

                    item.color.toArray(transColors, transIdx * 3);
                    transTypes[transIdx] = 0.9; // Transformer ID
                    transIdx++;
                }
            }
        });

        // Update counts to render only used instances
        resRef.current.count = resIdx;
        icRef.current.count = icIdx;
        transRef.current.count = transIdx;

        // Apply attributes
        resRef.current.instanceMatrix.needsUpdate = true;
        resRef.current.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(resColors, 3));
        resRef.current.geometry.setAttribute('instanceType', new THREE.InstancedBufferAttribute(resTypes, 1));

        icRef.current.instanceMatrix.needsUpdate = true;
        icRef.current.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(icColors, 3));
        icRef.current.geometry.setAttribute('instanceType', new THREE.InstancedBufferAttribute(icTypes, 1));

        transRef.current.instanceMatrix.needsUpdate = true;
        transRef.current.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(transColors, 3));
        transRef.current.geometry.setAttribute('instanceType', new THREE.InstancedBufferAttribute(transTypes, 1));
    }, [decorData]);

    const interactiveNodes = useMemo(() => {
        const items = [];
        const content = [
            { title: "Cache Layer", content: "Ultra-fast L3 cache handling project data fetching." },
            { title: "Bus Controller", content: "Manages communication between interactive UI and 3D scene." },
            { title: "Bridge Module", content: "Connects legacy knowledge with cutting-edge future technologies." }
        ];
        for (let i = 0; i < 20; i++) {
            const t = Math.random();
            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 14 + Math.random() * 6;
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
            {/* Start Gate */}
            {(() => {
                const p = cityCurve.getPointAt(0.01);
                const tan = cityCurve.getTangentAt(0.01).normalize();
                const angle = Math.atan2(tan.x, tan.z);
                return <WelcomeGate position={[p.x, 0, p.z]} rotation={[0, angle, 0]} />;
            })()}

            {/* Road (Shadow Receiver) */}
            <mesh name="road" position={[0, -0.05, 0]} scale={[1, 0.01, 1]} receiveShadow>
                <tubeGeometry args={[cityCurve, 800, 10, 8, false]} />
                <meshStandardMaterial color="#050507" roughness={0.7} metalness={0.3} />
            </mesh>

            {/* Sidewalks (PCB Green) */}
            <mesh position={[0, -0.01, 0]} scale={[1, 0.01, 1]} receiveShadow>
                <tubeGeometry args={[leftSidewalkCurve, 400, 12, 4, false]} />
                <meshStandardMaterial color="#0a2510" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.01, 0]} scale={[1, 0.01, 1]} receiveShadow>
                <tubeGeometry args={[rightSidewalkCurve, 400, 12, 4, false]} />
                <meshStandardMaterial color="#0a2510" roughness={0.8} />
            </mesh>

            {/* COMPONENT INSTANCES */}
            <instancedMesh ref={resRef} args={[RESISTOR_GEO, componentMaterial, 500]} />
            <instancedMesh ref={icRef} args={[IC_GEO, componentMaterial, 500]} />
            <instancedMesh ref={transRef} args={[TRANSFORMER_GEO, componentMaterial, 500]} />

            {/* Interactive Nodes */}
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

            {/* Road Detail Elements */}
            <group position={[0, 0.11, 0]} scale={[1, 0.01, 1]}>
                <mesh>
                    <tubeGeometry args={[leftLineCurve, 800, 0.1, 4, false]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh>
                    <tubeGeometry args={[rightLineCurve, 800, 0.1, 4, false]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>

            {/* Junctions */}
            <Junction t={0.2} side={1} curve={cityCurve} />
            <Junction t={0.5} side={-1} curve={cityCurve} />
            <Junction t={0.8} side={1} curve={cityCurve} />

            {/* Cables */}
            <group>
                {cables.map((cable, i) => (
                    <CircuitCable key={i} start={cable.start} end={cable.end} color={cable.color} />
                ))}
            </group>
        </group>
    );
}

function Junction({ t, side, curve }: { t: number, side: number, curve: THREE.CatmullRomCurve3 }) {
    const length = 50;
    const width = 14;

    const { position, rotation } = useMemo(() => {
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x);
        const midPoint = p.clone().add(norm.clone().multiplyScalar(side * (length / 2 + 12)));
        const angle = Math.atan2(norm.x, norm.z);
        return { position: midPoint, rotation: new THREE.Euler(0, angle, 0) };
    }, [t, side, curve]);

    return (
        <group position={[position.x, 0.05, position.z]} rotation={rotation}>
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[width, 0.1, length]} />
                <meshStandardMaterial color="#0a2510" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, -length / 2 + 6]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[width, 5]} />
                <meshStandardMaterial color="white" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}

function ZebraCrossing({ position, width, height }: { position: [number, number, number], width: number, height: number }) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial color="white" transparent opacity={0.5} />
        </mesh>
    );
}

function getOffsetCurve(curve: THREE.CatmullRomCurve3, offset: number) {
    const points = [];
    for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x);
        points.push(p.clone().add(norm.multiplyScalar(offset)));
    }
    return new THREE.CatmullRomCurve3(points);
}
