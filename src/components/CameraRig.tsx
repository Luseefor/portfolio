'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useStore } from '@/utils/store';
import { Car } from './Car';
import { mapScrollToCurve } from '@/utils/curve';
import { runCurveTests } from '@/utils/test';

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

    // Run curve tests in development mode
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            runCurveTests();
        }
    }, []);

    useFrame((state, delta) => {
        if (!curve || !curve.points || curve.points.length < 2) return;

        // 1. Map scroll to trimmed curve range (10% buffer on each end)
        const rawT = Math.max(0, Math.min(1, scroll.offset ?? 0));
        if (isNaN(rawT)) return;

        const t = mapScrollToCurve(rawT);

        // Sample curve positions for current, forward, and backward points
        const tForward = Math.min(t + 0.002, 0.999);
        const tBackward = Math.max(t - 0.002, 0.001);

        // Get curve positions - these ARE the road surface positions
        const currentPos = new THREE.Vector3();
        const forwardPos = new THREE.Vector3();
        const backwardPos = new THREE.Vector3();

        curve.getPointAt(t, currentPos);
        curve.getPointAt(tForward, forwardPos);
        curve.getPointAt(tBackward, backwardPos);

        // Update Car position directly from curve
        if (carRef.current) {
            // Car height offset calculation:
            // 1. Road tube geometry: radius=9, Y-scale=0.05, so road surface = curveY + (9 * 0.05) = curveY + 0.45
            // 2. Car model is centered, so we need to add half its height to place wheels on ground
            // 3. The car is scaled to ~4.5 units max. Height is roughly 1/4 of that = ~1.1 units
            // 4. Half height = 0.55. Plus road offset 0.45 = 1.0
            const roadSurfaceOffset = 0.45; // tube radius (9) * Y-scale (0.05)
            const carCenterOffset = 0.55;   // half of car's height (~1.1 units)
            const carHeight = roadSurfaceOffset + carCenterOffset;

            // Position car exactly on the curve with height offset
            carRef.current.position.set(currentPos.x, currentPos.y + carHeight, currentPos.z);

            // === CALCULATE HEADING AND PITCH FROM CURVE TANGENT ===
            // The curve tangent gives us both heading (XZ) and pitch (Y component)
            const tangent = curve.getTangentAt(t).normalize();

            // Heading (Yaw): direction in XZ plane
            const heading = Math.atan2(tangent.x, tangent.z);

            // Pitch: calculated from tangent Y component
            // tangent.y gives the slope - positive = going up, negative = going down
            const pitchAngle = Math.asin(THREE.MathUtils.clamp(tangent.y, -1, 1));

            // === ROLL: Sample left/right points at same curve position ===
            // For a flat road with banking, we need to check the tube's cross-section
            // Since the road is flat (tube squashed to 0.05 Y), roll should be minimal
            // But we can estimate banking from curve curvature
            const tAhead = Math.min(t + 0.01, 0.999);
            const tBehind = Math.max(t - 0.01, 0.001);
            const aheadPos = new THREE.Vector3();
            const behindPos = new THREE.Vector3();
            curve.getPointAt(tAhead, aheadPos);
            curve.getPointAt(tBehind, behindPos);

            // Calculate curvature for banking effect
            const direction1 = new THREE.Vector3().subVectors(currentPos, behindPos).normalize();
            const direction2 = new THREE.Vector3().subVectors(aheadPos, currentPos).normalize();
            // Cross product Y component indicates turning direction
            const turnDirection = direction1.x * direction2.z - direction1.z * direction2.x;
            // Apply banking based on turn (lean into turns like a real car)
            const rollAngle = turnDirection * 0.5; // Adjust multiplier for bank intensity

            // === COMPOSE ROTATION: Heading → Pitch → Roll ===
            // Adding Math.PI to roll to account for car model's base Z-flip
            const euler = new THREE.Euler(pitchAngle, heading, rollAngle + Math.PI, 'YXZ');
            carRef.current.quaternion.setFromEuler(euler);
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
            const tangent = new THREE.Vector3().subVectors(forwardPos, currentPos).normalize();

            // Ideal Camera Position: Chase View
            const idealPos = currentPos.clone()
                .sub(tangent.clone().multiplyScalar(9)) // 9 units behind (Chase)
                .add(new THREE.Vector3(0, 4, 0));       // 4 units up (Classic Arcades)
            // Smoothly move camera there
            camera.position.lerp(idealPos, 0.1);

            // Look at the Car
            const idealLookAt = currentPos.clone().add(tangent.clone().multiplyScalar(5));
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
