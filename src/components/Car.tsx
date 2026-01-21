/*
Car.tsx
Current Status:
- Uses external GLB model: '/car.glb'
- Orientation: The model is assumed to be +Z forward. We rotate it if needed.
- Animations: Wheels spin based on scroll delta.
- Features:
  - Exhaust smoke particles
  - Headlights (SpotLights)

Attribution:
CAR Model by Ignition Labs [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/5zUWP5UsLg-)
*/
'use client';

import React, { useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Preload the GLB to avoid pop-in
useGLTF.preload('/car.glb');

function ExhaustSmoke() {
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 60; i++) {
            const speed = 0.05 + Math.random() * 0.05;
            const life = Math.random() * 1;
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            temp.push({
                position: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, -speed),
                life,
                maxLife: 1.0 + Math.random() * 0.5,
                offset
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const meshRef = useRef<THREE.InstancedMesh>(null!);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        particles.forEach((p, i) => {
            p.life -= delta;
            if (p.life <= 0) {
                p.life = p.maxLife;
                // Reset emission point (approximate for exhaust pipe)
                p.position.set(0, 0.3, -1.8);
            }

            p.position.add(p.velocity.clone().multiplyScalar(1));
            p.position.y += delta * 0.5; // Rise up smoke

            // Scale down/up lifecycle
            const scale = (p.life / p.maxLife) * 0.4;

            dummy.position.copy(p.position).add(p.offset);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();

            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 60]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#555" transparent opacity={0.3} depthWrite={false} />
        </instancedMesh>
    );
}

export function Car() {
    const scroll = useScroll();
    // Auto-scale and Auto-center logic
    const groupRef = useRef<THREE.Group>(null!)
    const { scene } = useGLTF('/car.glb')

    // Clone scene so we can mutate it safely
    const clone = useMemo(() => scene.clone(), [scene])

    useLayoutEffect(() => {
        // 1. Compute Bounding Box
        const box = new THREE.Box3().setFromObject(clone)
        const size = new THREE.Vector3()
        box.getSize(size)
        const center = new THREE.Vector3()
        box.getCenter(center)

        console.log("CAR ORIGINAL SIZE:", size)
        console.log("CAR ORIGINAL CENTER:", center)

        // 2. Center the model (if origin is off)
        // We move the *scene* contents, or just offset the primitive.
        // Easiest is to move the clone position to -center.
        // BUT we are using <primitive object={clone} />.
        // Better: Apply translation to the clone itself.
        clone.position.copy(center).multiplyScalar(-1)

        // We need to put the clone inside a wrapper that we scale, 
        // OR scale the clone and adjust position.
        // Let's rely on a wrapper group for scaling.
    }, [clone])

    // 3. Determine Scale
    // standard car is ~4-5 meters long.
    // We want to scale 'size.z' (or max dimension) to approx 4.0.
    // However, we don't know if Z is length. Usually it is.
    // Let's assume Max Dim = 4.0
    const scale = useMemo(() => {
        const box = new THREE.Box3().setFromObject(clone)
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)

        if (maxDim === 0) return 1 // prevent div by zero
        return 4.5 / maxDim // Target size 4.5 units
    }, [clone])

    // 4. Animation Refs
    const wheelsRef = useRef<THREE.Mesh[]>([])
    const isSetup = useRef(false)
    const chassisRef = useRef<THREE.Group>(null!)

    useLayoutEffect(() => {
        if (isSetup.current) return

        wheelsRef.current = []

        // Fix Pivot Points for Wheels
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('wheel')) {
                // 1. Calculate Center
                const box = new THREE.Box3().setFromObject(child)
                const center = new THREE.Vector3()
                box.getCenter(center)

                // 2. Offset Geometry to align center with local origin
                // We need to inverse transforms to apply to geometry? 
                // Simpler: Apply inverse world position to geometry?
                // Actually, cleanest way for GLTF primitives:
                // child.geometry.center() centers it at (0,0,0) of its local space
                // BUT we want to preserve its visual spot.

                // Let's use the standard "center geometry, displace mesh" trick.
                // Note: This requires the geometry to be unique if shared.
                child.geometry = child.geometry.clone() // verify uniqueness
                child.geometry.computeBoundingBox()
                const geomBox = child.geometry.boundingBox!
                const geomCenter = new THREE.Vector3()
                geomBox.getCenter(geomCenter)

                child.geometry.translate(-geomCenter.x, -geomCenter.y, -geomCenter.z)
                // Now geometry is centered at 0,0,0

                // 3. Move Mesh to compensate
                // We moved geometry by -geomCenter (Local). 
                // So we must move Mesh by +geomCenter (Local) converted to... wait.
                // If we move geometry, the mesh visually shifts.
                // We just simply add geomCenter to the Mesh's position?
                // Yes, if we perform the translation in the same coordinate space.
                // Geometry translation happens in Local Space.

                child.position.add(geomCenter.applyQuaternion(child.quaternion))

                wheelsRef.current.push(child)
            }
        })

        isSetup.current = true
    }, [clone])

    useFrame((state, delta) => {
        const scrollDelta = scroll.delta

        // 1. Wheel Spin
        if (Math.abs(scrollDelta) > 0.0001) {
            const spinAmount = scrollDelta * 20
            wheelsRef.current.forEach(wheel => {
                // Rotate on X axis (assuming X is the axle after pivot fix)
                wheel.rotateX(spinAmount)
            })
        }

        // 2. Chassis Suspension / Body Roll
        // Add subtle bounce (Smoother, heavier feel)
        clone.position.y = (Math.sin(state.clock.elapsedTime * 2) * 0.02) - (0.02)
        // Add sway (Smoother turn simulation)
        clone.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
        clone.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.005
    })

    return (
        <group ref={groupRef}>
            {/* 
          Rotation Fix:
          User said "Facing backside" with [0, PI, PI].
          This likely means Z was flipped (Backwards) and Y was flipped (Upside down).
          Let's try [0, 0, Math.PI]. 
          - Math.PI on Z flips it upside down (so it becomes upright).
          - 0 on Y means it faces original direction.
      */}
            <group rotation={[0, 0, Math.PI]} scale={scale}>
                <primitive object={clone} />
            </group>

            {/* Headlights: Attached relative to the car group. 
          Adjust position if model size differs significantly. */}
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

            {/* Exhaust Smoke */}
            <ExhaustSmoke />
        </group>
    );
}
