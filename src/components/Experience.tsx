'use client';

import { ScrollControls } from '@react-three/drei';
import { MotherboardCity } from './MotherboardCity';
import { CameraRig } from './CameraRig';
import { WindStreaks } from './WindStreaks';
import { cityCurve } from '@/utils/curve';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function ExperienceContent() {
    return (
        <>
            {/* Lights - Cyberpunk feel */}
            <ambientLight intensity={0.2} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1.5}
                color="#ffaa00"
                castShadow
            />
            <pointLight position={[-10, 5, -10]} intensity={2} color="#00ffff" />

            {/* The City & Road */}
            <MotherboardCity />

            {/* Driving Logic */}
            <CameraRig curve={cityCurve} />

            {/* Particles */}
            <WindStreaks />

            {/* Post Processing */}
            <EffectComposer>
                <Bloom
                    luminanceThreshold={1}
                    mipmapBlur
                    intensity={1.5}
                    radius={0.4}
                />
            </EffectComposer>
        </>
    );
}

export function Experience() {
    return (
        <>
            {/* Cyber-sunset Environment - Darker for Bloom pop */}
            <color attach="background" args={['#100018']} />
            <fogExp2 attach="fog" args={['#100018', 0.015]} />

            {/* Infinite Ground Grid */}
            <gridHelper args={[200, 100, 0xff0055, 0x220044]} position={[0, -1, 0]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
                <planeGeometry args={[500, 500]} />
                <meshBasicMaterial color="#110022" />
            </mesh>

            {/* SCROLL CONTROLS: Longer duration for extended path */}
            <ScrollControls pages={20} damping={0.2}>
                <ExperienceContent />
            </ScrollControls>
        </>
    );
}
