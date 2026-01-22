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
    const isIntroPlaying = useStore((state) => state.isIntroPlaying);
    const setIntroPlaying = useStore((state) => state.setIntroPlaying);
    const isWelcomeOpen = useStore((state) => state.isWelcomeOpen);

    const carRef = useRef<THREE.Group>(null);
    const cameraTargetRef = useRef(new THREE.Vector3());
    const currentLaneOffsetRef = useRef(4); // Default to right lane
    const introTimeRef = useRef(0);

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
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);

            const offsetPos = currentPos.clone().add(normal.clone().multiplyScalar(laneOffset));
            carRef.current.position.set(offsetPos.x, offsetPos.y + carHeight, offsetPos.z);

            const heading = Math.atan2(tangent.x, tangent.z);
            const pitchAngle = Math.asin(THREE.MathUtils.clamp(tangent.y, -1, 1));

            const tAhead = Math.min(t + 0.01, 0.999);
            const tBehind = Math.max(t - 0.01, 0.001);
            const aheadPos = new THREE.Vector3();
            const behindPos = new THREE.Vector3();
            curve.getPointAt(tAhead, aheadPos);
            curve.getPointAt(tBehind, behindPos);

            const direction1 = new THREE.Vector3().subVectors(currentPos, behindPos).normalize();
            const direction2 = new THREE.Vector3().subVectors(aheadPos, currentPos).normalize();
            const turnDirection = direction1.x * direction2.z - direction1.z * direction2.x;
            const rollAngle = turnDirection * 0.5;

            const pCamera = camera as THREE.PerspectiveCamera;
            if (pCamera.fov !== undefined) {
                const targetFOV = isWelcomeOpen ? 45 : (45 + velocity * 15);
                pCamera.fov = THREE.MathUtils.lerp(pCamera.fov, targetFOV, 0.05);
                pCamera.updateProjectionMatrix();
            }

            const dynamicRoll = (rollAngle + Math.PI) + (turnDirection * velocity * 0.2);
            const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitchAngle, heading, dynamicRoll, 'YXZ'));
            carRef.current.quaternion.slerp(targetQuaternion, 0.1);

            const tangentCam = new THREE.Vector3().subVectors(forwardPos, currentPos).normalize();
            const speedBackoff = velocity * 4;

            // 0. IDEAL FOLLOW & TARGETS
            const idealFollowPos = offsetPos.clone()
                .sub(tangentCam.clone().multiplyScalar(7 + speedBackoff))
                .add(new THREE.Vector3(0, 2.5, 0));

            const idealLookAt = offsetPos.clone().add(tangentCam.clone().multiplyScalar(4 + velocity * 10));

            // 1. WELCOME SCREEN AMBIENT ORBIT
            if (isWelcomeOpen) {
                const clock = state.clock.getElapsedTime();
                const angle = clock * 0.2; // Slow orbit
                const radius = 16;
                const height = 6;

                const ambientPos = offsetPos.clone().add(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                ));

                camera.position.lerp(ambientPos, 0.05);
                cameraTargetRef.current.lerp(offsetPos, 0.05);
                camera.lookAt(cameraTargetRef.current);
                return;
            }

            // 2. CINEMATIC INTRO SWEEP
            if (isIntroPlaying) {
                introTimeRef.current += delta;
                const introDuration = 4.5;
                const progress = introTimeRef.current / introDuration;

                if (progress >= 1) {
                    setIntroPlaying(false);
                    introTimeRef.current = 0;
                } else {
                    const angle = progress * Math.PI * 1.5 + Math.PI * 0.25;
                    const radius = 12 * (1 - progress * 0.4);
                    const height = 4 * (1 - progress * 0.5) + 1.5;

                    const orbitPos = offsetPos.clone().add(new THREE.Vector3(
                        Math.cos(angle) * radius,
                        height,
                        Math.sin(angle) * radius
                    ));

                    const blend = THREE.MathUtils.smoothstep(progress, 0.8, 1.0);
                    camera.position.lerpVectors(orbitPos, idealFollowPos, blend);

                    cameraTargetRef.current.lerp(idealLookAt, 0.1);
                    camera.lookAt(cameraTargetRef.current);
                    return;
                }
            }

            // 3. NORMAL CAMERA FOLLOW
            camera.position.lerp(idealFollowPos, 0.15);
            cameraTargetRef.current.lerp(idealLookAt, 0.15);
            camera.lookAt(cameraTargetRef.current);
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
