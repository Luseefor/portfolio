'use client';

import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { Html, Line } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AxesHelper, Color, MathUtils, Vector3, type Group } from 'three';
import PlayerController from '@/components/dungeon/PlayerController';
import CameraRig from '@/components/dungeon/CameraRig';
import DungeonAmbience from '@/components/dungeon/DungeonAmbience';
import { TorchSystem } from '@/components/dungeon/Torch';
import DungeonPostProcessing from '@/components/dungeon/DungeonPostProcessing';
import DungeonParticles from '@/components/dungeon/DungeonParticles';
import { sceneLighting } from '@/constants/scene';
import DungeonLayout from '@/components/dungeon/DungeonLayout';
import DungeonColliders from '@/components/dungeon/DungeonColliders';
import { useDungeonInput } from '@/lib/dungeonInput';
import { CAMERA_PITCH } from '@/constants/camera';

const FOG_COLOR = new Color(sceneLighting.fogColor);
const DEBUG_TOGGLE_KEY = 'F1';

export default function DungeonScene() {
  const playerRef = useRef<Group>(null);
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(CAMERA_PITCH.initial);
  const debugFromQuery = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1',
    []
  );
  const [debugEnabled, setDebugEnabled] = useState(debugFromQuery);
  const axesHelper = useMemo(() => new AxesHelper(6), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== DEBUG_TOGGLE_KEY && event.key !== DEBUG_TOGGLE_KEY) return;
      event.preventDefault();
      setDebugEnabled((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <group>
      <color attach="background" args={['#0b0908']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, sceneLighting.fogDensity]} />

      {/* Base ambient lighting */}
      <ambientLight intensity={sceneLighting.ambientIntensity} color={sceneLighting.ambientColor} />
      <hemisphereLight
        intensity={sceneLighting.hemisphereIntensity}
        color={sceneLighting.hemisphereSky}
        groundColor={sceneLighting.hemisphereGround}
      />
      <directionalLight
        position={sceneLighting.fillDirectionalPosition}
        intensity={sceneLighting.fillDirectionalIntensity}
        color={sceneLighting.fillDirectionalColor}
      />

      {debugEnabled && (
        <group name="debug-primitives">
          <directionalLight position={[6, 12, 4]} intensity={3.5} color="#ffffff" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color="#2f5d57" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshStandardMaterial color="#ff2d55" />
          </mesh>
          <primitive object={axesHelper} />
          <DebugOverlay
            playerRef={playerRef}
            yawRef={cameraYawRef}
            pitchRef={cameraPitchRef}
          />
        </group>
      )}

      {/* Static point lights for base illumination */}
      {sceneLighting.torchLights.map((torch, index) => (
        <pointLight
          key={`torch-${index}`}
          position={torch.position}
          intensity={torch.intensity}
          color={torch.color}
          distance={torch.distance}
        />
      ))}

      <Suspense fallback={null}>
        {/* Agent B: Torch system with flickering lights */}
        <TorchSystem />
      </Suspense>

      {/* Agent B: Atmospheric particles (dust motes + torch embers) */}
      <DungeonParticles />

      <DungeonAmbience />

      <Suspense fallback={null}>
        <DungeonLayout />
      </Suspense>

      <Physics gravity={[0, -25, 0]}>
        <DungeonColliders />
        <CameraRig
          target={playerRef}
          yawRef={cameraYawRef}
          pitchRef={cameraPitchRef}
          targetBody={playerBodyRef}
        />
        <Suspense fallback={null}>
          <PlayerController
            playerRef={playerRef}
            cameraYawRef={cameraYawRef}
            bodyRef={playerBodyRef}
          />
        </Suspense>
      </Physics>

      {/* Agent B: Postprocessing (bloom, vignette, tone mapping) */}
      <DungeonPostProcessing />
    </group>
  );
}

function DebugOverlay({
  playerRef,
  yawRef,
  pitchRef,
}: {
  playerRef: RefObject<Group>;
  yawRef: MutableRefObject<number>;
  pitchRef: MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const isPointerLocked = useDungeonInput((state) => state.isPointerLocked);
  const hasFocus = useDungeonInput((state) => state.hasFocus);
  const [linePoints, setLinePoints] = useState<[number, number, number][]>([
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [debugText, setDebugText] = useState({
    player: 'n/a',
    camera: 'n/a',
    yaw: 0,
    pitch: 0,
  });
  const throttleRef = useRef(0);
  const tempPlayer = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    throttleRef.current += delta;
    if (throttleRef.current < 0.1) return;
    throttleRef.current = 0;

    const player = playerRef.current;
    if (player) {
      player.getWorldPosition(tempPlayer);
      setLinePoints([
        [tempPlayer.x, tempPlayer.y + 1.2, tempPlayer.z],
        [camera.position.x, camera.position.y, camera.position.z],
      ]);
      setDebugText({
        player: `${tempPlayer.x.toFixed(2)}, ${tempPlayer.y.toFixed(2)}, ${tempPlayer.z.toFixed(2)}`,
        camera: `${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`,
        yaw: MathUtils.radToDeg(yawRef.current),
        pitch: MathUtils.radToDeg(pitchRef.current),
      });
    }
  });

  return (
    <>
      <Line
        points={linePoints}
        color="#00ffcc"
        lineWidth={2}
      />
      <Html position={[0, 3.6, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.65)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '8px 10px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#f1f5f9',
            minWidth: 220,
          }}
        >
          <div>focus: {hasFocus ? 'yes' : 'no'}</div>
          <div>pointer lock: {isPointerLocked ? 'yes' : 'no'}</div>
          <div>yaw: {debugText.yaw.toFixed(2)}°</div>
          <div>pitch: {debugText.pitch.toFixed(2)}°</div>
          <div>player: {debugText.player}</div>
          <div>camera: {debugText.camera}</div>
        </div>
      </Html>
    </>
  );
}
