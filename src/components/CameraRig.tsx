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

    // Raycaster for physics snapping
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);

    useFrame((state, delta) => {
        if (!curve || !curve.points || curve.points.length < 2) return;

        // 1. Update Car Position based on Scroll
        const t = Math.max(0, Math.min(1, scroll.offset ?? 0));
        if (isNaN(t)) return;

        // Get ideal curve position (XZ)
        curve.getPointAt(t, vectors.vec);
        const lookAtT = Math.min(t + 0.001, 1);
        curve.getPointAt(lookAtT, vectors.target);

        // PHYSICS SNAP: Raycast down to find actual road surface
        // Start high up and cast down
        raycaster.set(new THREE.Vector3(vectors.vec.x, 50, vectors.vec.z), down);
        const intersects = raycaster.intersectObjects(state.scene.children, true);
        const roadHit = intersects.find(hit => hit.object.name === 'road');

        // Update Car
        if (carRef.current) {
            const pos = vectors.vec.clone();

            if (roadHit) {
                // Found the road! Snap exactly to surface + offset
                // 0.35 (Wheel Radius) + 0.1 (Suspension Margin) = 0.45
                pos.y = roadHit.point.y + 0.45;
            } else {
                // Fallback if ray misses (shouldn't happen on road)
                pos.y += 0.42;
            }

            carRef.current.position.copy(pos);

            // LookAt Logic (Heading)
            const lookTarget = vectors.target.clone();
            if (roadHit) lookTarget.y = pos.y;
            carRef.current.lookAt(lookTarget);

            // BANKING (Click-to-Surface Logic)
            // Raycast Left and Right to find road slope
            const tangent = vectors.target.clone().sub(vectors.vec).normalize();
            const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

            // Width of sampling (approx car width)
            const sideOffset = 1.2;

            const leftOrigin = vectors.vec.clone().sub(right.clone().multiplyScalar(sideOffset));
            const rightOrigin = vectors.vec.clone().add(right.clone().multiplyScalar(sideOffset));

            leftOrigin.y += 50;
            rightOrigin.y += 50;

            // Reuse raycaster for left/right
            raycaster.set(leftOrigin, down);
            const leftHit = raycaster.intersectObjects(state.scene.children, true).find(h => h.object.name === 'road');

            raycaster.set(rightOrigin, down);
            const rightHit = raycaster.intersectObjects(state.scene.children, true).find(h => h.object.name === 'road');

            if (leftHit && rightHit) {
                const dy = rightHit.point.y - leftHit.point.y;
                const dist = 2 * sideOffset;
                // Angle = atan(dy / dist)
                // If Right is higher (dy > 0), we should tilt Left?
                // Standard Z rotation: + is visible CCW?
                // Let's visualize: 
                // Right high -> Car should roll Left (Counter-Clockwise if facing forward?)
                // Actually, if we look from back:
                // Right Up -> Car should rotate CCW (Left). 
                // In Three.js, +Z is axis out of screen (if Y up).
                // Let's rely on simple geometry calculation.
                // rotation.z should align local X with the slope.

                const bankAngle = Math.atan2(dy, dist);

                // Damping/Smoothing
                // We can't easily lerp `rotation.z` directly without state, 
                // but since it runs every frame on a smooth curve, it should be naturally smooth.
                // NOTE check Sign:
                // If dy is positive (Right higher), bankAngle is positive.
                // A positive Z rotation usually tilts Left (CCW) in right-handed Y-up?
                // Let's try direct application.

                carRef.current.rotation.z = bankAngle;
            } else {
                carRef.current.rotation.z = 0;
            }
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

            // Ideal Camera Position: Chase View
            const idealPos = vectors.vec.clone()
                .sub(tangent.clone().multiplyScalar(9)) // 9 units behind (Chase)
                .add(new THREE.Vector3(0, 4, 0));       // 4 units up (Classic Arcades)
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
