'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useStore } from '@/utils/store';
import { Car } from './Car';

interface CameraRigProps {
    curve: THREE.CatmullRomCurve3;
}

// Stop points configuration (Placeholder for now)
const STOPS: { offset: number; target: THREE.Vector3; name: string }[] = [
    // Examples: Re-enable when sections are placed
    // { offset: 0.1, target: new THREE.Vector3(0, 5, -50), name: "ABOUT" },
];

export function CameraRig({ curve }: CameraRigProps) {
    const scroll = useScroll();
    const { camera } = useThree();
    const activeSection = useStore((state) => state.activeSection);
    const setActiveSection = useStore((state) => state.setActiveSection);

    const carRef = useRef<THREE.Group>(null);

    // Vectors for calculation - useMemo to prevent re-creation
    const vectors = useMemo(() => ({
        vec: new THREE.Vector3(),
        target: new THREE.Vector3()
    }), []);

    useFrame((state, delta) => {
        if (!curve || !curve.points || curve.points.length < 2) return;

        // 1. Update Car Position based on Scroll
        // Safe clamp to ensure t is always valid [0, 1]
        const t = Math.max(0, Math.min(1, scroll.offset ?? 0));

        if (isNaN(t)) return;

        // Get car position on curve
        curve.getPointAt(t, vectors.vec);

        // Get car forward direction
        const lookAtT = Math.min(t + 0.001, 1);
        curve.getPointAt(lookAtT, vectors.target);

        // Update Car
        if (carRef.current) {
            const pos = vectors.vec.clone();
            pos.y += 0.35; // Lift car
            carRef.current.position.copy(pos);
            carRef.current.lookAt(vectors.target.clone().add(new THREE.Vector3(0, 0.35, 0)));

            // Disable banking
            carRef.current.rotation.z = 0;
        }

        // 2. Update Camera (Follow Logic)

        // Check stops
        const activeStop = STOPS.find(stop => Math.abs(t - stop.offset) < 0.05);

        if (activeStop) {
            if (activeSection !== activeStop.name) setActiveSection(activeStop.name);

            // SNAP LOGIC
            const stopCamPos = activeStop.target.clone().add(new THREE.Vector3(0, 5, 10));

            camera.position.lerp(stopCamPos, 0.05);

            const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
            currentLookAt.lerp(activeStop.target, 0.05);
            camera.lookAt(currentLookAt);

        } else {
            if (activeSection !== null) setActiveSection(null);

            // DRIVING FOLLOW LOGIC

            const tangent = vectors.target.clone().sub(vectors.vec).normalize();

            // Ideal Camera Position: CarPos - (Tangent * Distance) + (Up * Height)
            const idealPos = vectors.vec.clone()
                .sub(tangent.clone().multiplyScalar(6))
                .add(new THREE.Vector3(0, 5, 0));

            // Smoothly move camera there
            camera.position.lerp(idealPos, 0.1);

            // Look at the Car
            const idealLookAt = vectors.vec.clone().add(tangent.clone().multiplyScalar(5));
            camera.lookAt(idealLookAt);
        }
    });

    return (
        <>
            <group ref={carRef}>
                <Car />
            </group>
        </>
    );
}
