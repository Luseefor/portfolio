'use client';

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Preload the GLB
useGLTF.preload('/car.glb');

export function Car() {
    const scroll = useScroll();
    const groupRef = useRef<THREE.Group>(null!)
    const { scene } = useGLTF('/car.glb')
    const clone = useMemo(() => scene.clone(), [scene])

    const wheelsRef = useRef<THREE.Mesh[]>([])
    const isSetup = useRef(false)

    useLayoutEffect(() => {
        const box = new THREE.Box3().setFromObject(clone)
        const center = new THREE.Vector3()
        box.getCenter(center)
        clone.position.copy(center).multiplyScalar(-1)
    }, [clone])

    const scale = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clone)
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim === 0) return 1
        return 4.5 / maxDim
    }, [clone])

    useLayoutEffect(() => {
        if (isSetup.current) return
        wheelsRef.current = []
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('wheel')) {
                child.geometry = child.geometry.clone()
                child.geometry.computeBoundingBox()
                const geomBox = child.geometry.boundingBox!
                const geomCenter = new THREE.Vector3()
                geomBox.getCenter(geomCenter)
                child.geometry.translate(-geomCenter.x, -geomCenter.y, -geomCenter.z)
                child.position.add(geomCenter.applyQuaternion(child.quaternion))
                wheelsRef.current.push(child)
            }
        })
        isSetup.current = true
    }, [clone])

    useFrame((state, delta) => {
        const scrollDelta = scroll.delta
        if (Math.abs(scrollDelta) > 0.0001) {
            const spinAmount = scrollDelta * 35
            wheelsRef.current.forEach(wheel => {
                wheel.rotateX(spinAmount)
            })
        }
        // CLEAN POSITION: Removed idle jitter/bobbing for maximum smoothness
        clone.position.y = -0.01;
    })

    return (
        <group ref={groupRef}>
            <group rotation={[0, 0, Math.PI]} scale={scale}>
                <primitive object={clone} />
            </group>
            {/* Dynamic Headlights */}
            <group position={[0, 1, -2]}>
                <spotLight
                    position={[-1, 0, 0]}
                    angle={0.4}
                    penumbra={0.5}
                    intensity={20}
                    color="#ffffee"
                    distance={100}
                    castShadow
                />
                <spotLight
                    position={[1, 0, 0]}
                    angle={0.4}
                    penumbra={0.5}
                    intensity={20}
                    color="#ffffee"
                    distance={100}
                    castShadow
                />
            </group>
            <spotLight
                position={[0.6, 0.6, 1.8]}
                angle={0.5}
                penumbra={0.5}
                intensity={2}
                castShadow
                color="cyan"
                target-position={[0.6, 0.0, 10]}
            />
            <spotLight
                position={[-0.6, 0.6, 1.8]}
                angle={0.5}
                penumbra={0.5}
                intensity={2}
                castShadow
                color="cyan"
                target-position={[-0.6, 0.0, 10]}
            />
        </group>
    );
}
