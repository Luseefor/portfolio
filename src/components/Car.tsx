'use client';

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/utils/store';

// Preload the GLB
useGLTF.preload('/car.glb');

export function Car() {
    const scroll = useScroll();
    const groupRef = useRef<THREE.Group>(null!)
    const bodyRef = useRef<THREE.Group>(null!)
    const { scene } = useGLTF('/car.glb')
    const clone = useMemo(() => scene.clone(), [scene])

    const lane = useStore((state) => state.lane)
    const wheelsRef = useRef<THREE.Mesh[]>([])
    const frontWheelsRef = useRef<THREE.Mesh[]>([])
    const isSetup = useRef(false)

    // Material State for Dynamic Effects
    const brakeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#ff0000",
        emissive: "#ff0000",
        emissiveIntensity: 5
    }), [])

    useLayoutEffect(() => {
        if (isSetup.current) return
        wheelsRef.current = []
        frontWheelsRef.current = []

        const box = new THREE.Box3().setFromObject(clone)
        const center = new THREE.Vector3()
        box.getCenter(center)
        clone.position.copy(center).multiplyScalar(-1)

        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Professional Paint & Metal Finish
                if (child.material instanceof THREE.MeshStandardMaterial) {
                    if (child.name.toLowerCase().includes('body')) {
                        child.material.roughness = 0.05;
                        child.material.metalness = 1.0;
                    }
                }

                if (child.name.toLowerCase().includes('wheel')) {
                    child.geometry = child.geometry.clone()
                    child.geometry.computeBoundingBox()
                    const geomBox = child.geometry.boundingBox!
                    const geomCenter = new THREE.Vector3()
                    geomBox.getCenter(geomCenter)
                    child.geometry.translate(-geomCenter.x, -geomCenter.y, -geomCenter.z)
                    child.position.add(geomCenter.applyQuaternion(child.quaternion))

                    wheelsRef.current.push(child)
                    if (child.name.toLowerCase().includes('front')) {
                        frontWheelsRef.current.push(child)
                    }
                }

                // Taillight Search & Setup
                if (child.name.toLowerCase().includes('light') && (child.name.toLowerCase().includes('rear') || child.name.toLowerCase().includes('tail'))) {
                    child.material = brakeMaterial;
                }
            }
        })
        isSetup.current = true
    }, [clone, brakeMaterial])

    const scale = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clone)
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim === 0) return 1
        return 4.5 / maxDim
    }, [clone])

    const targetRotationZ = useRef(0)
    const currentRotationZ = useRef(0)
    const targetSteerY = useRef(0)
    const currentSteerY = useRef(0)

    useFrame((state, delta) => {
        const scrollDelta = scroll.delta
        const velocity = Math.abs(scrollDelta) * 100;

        // 1. Wheel Spin
        if (velocity > 0.001) {
            const spinAmount = scrollDelta * 35
            wheelsRef.current.forEach(wheel => {
                wheel.rotateX(spinAmount)
            })
        }

        // 2. Dynamic Brake Lights
        brakeMaterial.emissiveIntensity = velocity < 0.2 ? 10 : 3;

        // 3. Steering & Body Roll (SUBTLE & CLEAN)
        targetRotationZ.current = -lane * 0.05;
        targetSteerY.current = lane * 0.3;

        currentRotationZ.current = THREE.MathUtils.lerp(currentRotationZ.current, targetRotationZ.current, delta * 3);
        currentSteerY.current = THREE.MathUtils.lerp(currentSteerY.current, targetSteerY.current, delta * 3);

        if (bodyRef.current) {
            bodyRef.current.rotation.z = currentRotationZ.current;
            // Ensure car sits slightly above ground to prevent clipping
            bodyRef.current.position.y = 0.05;
        }

        frontWheelsRef.current.forEach(wheel => {
            wheel.rotation.y = currentSteerY.current;
        });

        // 4. Suspension Oscillation (Subtle Speed-dependent bounce)
        const time = state.clock.getElapsedTime();
        const bounce = Math.sin(time * 10) * 0.015 * (velocity > 0.1 ? 1 : 0.2);
        if (bodyRef.current) {
            bodyRef.current.position.y += bounce;
        }
    })

    return (
        <group ref={groupRef}>
            <group ref={bodyRef}>
                <group rotation={[0, 0, Math.PI]} scale={scale}>
                    <primitive object={clone} />
                </group>

                {/* Cyberpunk Neon Underglow (TONED DOWN) */}
                <pointLight position={[0, -0.2, 0]} intensity={8} distance={8} color="#00ffff" />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                    <planeGeometry args={[2, 4]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.15} />
                </mesh>
            </group>

            {/* Optimized High-Performance Headlights (TONED DOWN) */}
            <group position={[0, 1, -2]}>
                <spotLight
                    position={[-0.8, 0, 0]}
                    angle={0.4}
                    penumbra={1}
                    intensity={60}
                    color="#ffffff"
                    distance={120}
                    castShadow
                />
                <spotLight
                    position={[0.8, 0, 0]}
                    angle={0.4}
                    penumbra={1}
                    intensity={60}
                    color="#ffffff"
                    distance={120}
                    castShadow
                />
                {/* Rear Brake Light Glow (TONED DOWN) */}
                <pointLight position={[0, 0.5, 3]} intensity={5} distance={8} color="#ff0000" />
            </group>
        </group>
    );
}
