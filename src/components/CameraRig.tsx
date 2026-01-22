'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { useStore } from '@/utils/store';
import { Car } from './Car';
import { mapScrollToCurve } from '@/utils/curve';

interface CameraRigProps {
    curve: THREE.CatmullRomCurve3;
}

export function CameraRig({ curve }: CameraRigProps) {
    const scroll = useScroll();
    const { camera } = useThree();
    const activeSection = useStore((state) => state.activeSection);
    const setActiveSection = useStore((state) => state.setActiveSection);
    const lane = useStore((state) => state.lane);

    const carRef = useRef<THREE.Group>(null);
    const cameraTargetRef = useRef(new THREE.Vector3());
    const currentLaneOffsetRef = useRef(4); // Default to right lane

    useFrame((state, delta) => {
        if (!curve || !curve.points || curve.points.length < 2) return;

        // Smoothly interpolate lane offset
        const targetLaneOffset = lane * 4;
        currentLaneOffsetRef.current = THREE.MathUtils.lerp(
            currentLaneOffsetRef.current,
            targetLaneOffset,
            0.1
        );

        const rawT = Math.max(0, Math.min(1, scroll.offset ?? 0));
        if (isNaN(rawT)) return;

        const scrollDelta = Math.abs(scroll.delta);
        const velocity = THREE.MathUtils.clamp(scrollDelta * 50, 0, 1);
        const t = mapScrollToCurve(rawT);

        const currentPos = new THREE.Vector3();
        curve.getPointAt(t, currentPos);

        const tForward = Math.min(t + 0.005, 0.999);
        const forwardPos = new THREE.Vector3();
        curve.getPointAt(tForward, forwardPos);

        if (carRef.current) {
            const carHeight = 0.4;
            const laneOffset = currentLaneOffsetRef.current;
            const tangent = curve.getTangentAt(t).normalize();
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            // Position Car
            const carPos = currentPos.clone().add(normal.clone().multiplyScalar(laneOffset));
            carRef.current.position.set(carPos.x, carPos.y + carHeight, carPos.z);

            // Stable Heading for Car
            const heading = Math.atan2(tangent.x, tangent.z);
            carRef.current.rotation.set(0, heading + Math.PI, 0);

            // ULTIMATE STABLE CHASE CAM
            const tangentCam = new THREE.Vector3().subVectors(forwardPos, currentPos).normalize();
            const backoff = 8 + velocity * 4;
            const upOffset = 3;

            const cameraPos = carPos.clone()
                .sub(tangentCam.clone().multiplyScalar(backoff))
                .add(new THREE.Vector3(0, upOffset, 0));

            camera.position.lerp(cameraPos, 0.1);

            // Hero LookAt (Stable & Centered)
            const lookAhead = 10;
            const targetPoint = carPos.clone().add(tangentCam.clone().multiplyScalar(lookAhead));
            cameraTargetRef.current.lerp(targetPoint, 0.05);
            camera.lookAt(cameraTargetRef.current);

            // Cinematic FOV
            const pCamera = camera as THREE.PerspectiveCamera;
            if (pCamera.fov !== undefined) {
                const targetFOV = 40 + velocity * 15;
                pCamera.fov = THREE.MathUtils.lerp(pCamera.fov, targetFOV, 0.05);
                pCamera.updateProjectionMatrix();
            }
        }
    });

    return (
        <group ref={carRef}>
            <Car />
            <ContactShadows
                opacity={0.6}
                scale={10}
                blur={2}
                far={1}
                resolution={256}
                color="#000000"
                position={[0, -0.35, 0]}
            />
        </group>
    );
}
