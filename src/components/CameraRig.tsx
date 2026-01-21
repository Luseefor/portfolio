'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { useStore } from '@/utils/store';
import { Car } from './Car';

interface CameraRigProps {
    curve: THREE.CatmullRomCurve3;
}

// Stop points configuration
const STOPS = [
    { offset: 0.2, target: new THREE.Vector3(5, 2, -20), name: "RAM" },
    { offset: 0.5, target: new THREE.Vector3(-5, 3, -50), name: "GPU" },
    { offset: 1.0, target: new THREE.Vector3(0, 11, -120), name: "CPU" },
];

export function CameraRig({ curve }: CameraRigProps) {
    const scroll = useScroll();
    const { camera } = useThree();
    const activeSection = useStore((state) => state.activeSection);
    const setActiveSection = useStore((state) => state.setActiveSection);

    const carRef = useRef<THREE.Group>(null);

    // Vectors for calculation
    const vec = new THREE.Vector3(); // Car Position
    const target = new THREE.Vector3(); // Car LookAt

    useFrame((state, delta) => {
        // 1. Update Car Position based on Scroll
        const t = scroll.offset;

        // Get car position on curve
        curve.getPointAt(t, vec);

        // Get car forward direction
        const lookAtT = Math.min(t + 0.001, 1);
        curve.getPointAt(lookAtT, target);

        // Update Car
        if (carRef.current) {
            carRef.current.position.copy(vec);
            carRef.current.lookAt(target);

            // Disable banking to ensure car stays upright
            // The default up vector (0,1,0) usage by lookAt should generally work 
            // unless the curve is extreme, but we can enforce it.
        }

        // 2. Update Camera (Follow Logic)

        // Check stops
        const activeStop = STOPS.find(stop => Math.abs(t - stop.offset) < 0.05);

        if (activeStop) {
            if (activeSection !== activeStop.name) setActiveSection(activeStop.name);

            // SNAP LOGIC
            // Camera moves to a fixed position relative to the SCENE, looking at the BUILDING
            const stopCamPos = activeStop.target.clone().add(new THREE.Vector3(0, 5, 10)); // Simple offset

            camera.position.lerp(stopCamPos, 0.05);

            const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
            currentLookAt.lerp(activeStop.target, 0.05);
            camera.lookAt(currentLookAt);

        } else {
            if (activeSection !== null) setActiveSection(null);

            // DRIVING FOLLOW LOGIC
            // Camera should be behind and above the car

            const tangent = target.clone().sub(vec).normalize();

            // Ideal Camera Position: CarPos - (Tangent * Distance) + (Up * Height)
            const idealPos = vec.clone()
                .sub(tangent.clone().multiplyScalar(5)) // 5 units behind
                .add(new THREE.Vector3(0, 3, 0));       // 3 units up

            // Smoothly move camera there
            camera.position.lerp(idealPos, 0.1);

            // Look at the Car (or slightly ahead of it)
            const idealLookAt = vec.clone().add(tangent.clone().multiplyScalar(5)); // Look ahead
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
