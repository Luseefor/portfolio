'use client';

import { Physics, type RapierRigidBody } from '@react-three/rapier';
import { Html, Line } from '@react-three/drei';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AxesHelper, Color, MathUtils, Vector3, type Group } from 'three';
import PlayerController from './PlayerController';
import CameraRig from './CameraRig';
import DungeonAmbience from './DungeonAmbience';
import { TorchSystem } from './Torch';
import DungeonPostProcessing from './DungeonPostProcessing';
import DungeonParticles from './DungeonParticles';
import { sceneLighting } from '@/constants/scene';
import DungeonLayout from './DungeonLayout';
import DungeonColliders from './DungeonColliders';
import { useDungeonInput } from '@/lib/dungeonInput';
import { CAMERA_PITCH } from '@/constants/camera';
import { usePlayerState, playerStateSelectors } from '@/lib/playerState';

const FOG_COLOR = new Color(sceneLighting.fogColor);
const DEBUG_TOGGLE_KEY = 'F1';
const LAYOUT_TOGGLE_KEY = 'F2';
const PARTICLE_TOGGLE_KEY = 'F3';
const PARTICLE_STRESS_KEY = 'F4';
const TELEPORT_KEY = 'F5';
const FREECAM_KEY = 'F6';

export default function DungeonScene() {
  const playerRef = useRef<Group>(null);
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const cameraYawRef = useRef(0);
  const cameraPitchRef = useRef(CAMERA_PITCH.initial);
  const debugFromQuery = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1',
    [],
  );
  const [debugEnabled, setDebugEnabled] = useState(debugFromQuery);
  const [layoutEnabled, setLayoutEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [particleMultiplier, setParticleMultiplier] = useState(1);
  const [teleportIndex, setTeleportIndex] = useState(0);
  const axesHelper = useMemo(() => new AxesHelper(6), []);
  const playerPosition = usePlayerState(playerStateSelectors.position);
  const playerSpeed = usePlayerState(playerStateSelectors.speed);
  const playerGrounded = usePlayerState(playerStateSelectors.grounded);
  const playerMoving = usePlayerState(playerStateSelectors.isMoving);
  const keys = useDungeonInput((state) => state.keys);
  const lastEvent = useDungeonInput((state) => state.lastEvent);
  const addEvent = useDungeonInput((state) => state.addEvent);
  const freeCam = useDungeonInput((state) => state.freeCam);
  const setFreeCam = useDungeonInput((state) => state.setFreeCam);

  const teleportTargets = useMemo<[number, number, number][]>(
    () => [
      [0, 2, 0],
      [0, 2, 12],
      [0, 2, 20],
      [14, 2, 10],
      [14, 2, 24],
      [-4, 2, 0],
    ],
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === DEBUG_TOGGLE_KEY || event.key === DEBUG_TOGGLE_KEY) {
        event.preventDefault();
        setDebugEnabled((prev) => !prev);
        addEvent('F1 debug overlay toggle');
        return;
      }

      if (event.code === LAYOUT_TOGGLE_KEY || event.key === LAYOUT_TOGGLE_KEY) {
        event.preventDefault();
        setLayoutEnabled((prev) => !prev);
        addEvent('F2 layout toggle');
        return;
      }

      if (event.code === PARTICLE_TOGGLE_KEY || event.key === PARTICLE_TOGGLE_KEY) {
        event.preventDefault();
        setParticlesEnabled((prev) => !prev);
        addEvent('F3 particles toggle');
        return;
      }

      if (event.code === PARTICLE_STRESS_KEY || event.key === PARTICLE_STRESS_KEY) {
        event.preventDefault();
        setParticleMultiplier((prev) => (prev === 1 ? 3 : 1));
        addEvent('F4 particle stress toggle');
        return;
      }

      if (event.code === TELEPORT_KEY || event.key === TELEPORT_KEY) {
        event.preventDefault();
        const body = playerBodyRef.current;
        if (!body) return;
        setTeleportIndex((prev) => {
          const next = (prev + 1) % teleportTargets.length;
          const [x, y, z] = teleportTargets[next];
          body.setTranslation({ x, y, z }, true);
          body.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.wakeUp();
          addEvent(`F5 teleport -> ${next}`);
          return next;
        });
      }

      if (event.code === FREECAM_KEY || event.key === FREECAM_KEY) {
        event.preventDefault();
        setFreeCam(!freeCam);
        addEvent(`F6 freecam ${!freeCam ? 'on' : 'off'}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addEvent, freeCam, setFreeCam, teleportTargets]);

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
          <DebugOverlay playerRef={playerRef} yawRef={cameraYawRef} pitchRef={cameraPitchRef} />
          <TestHarnessOverlay
            layoutEnabled={layoutEnabled}
            particlesEnabled={particlesEnabled}
            particleMultiplier={particleMultiplier}
            teleportIndex={teleportIndex}
            freeCam={freeCam}
            playerPosition={playerPosition}
            playerSpeed={playerSpeed}
            playerGrounded={playerGrounded}
            playerMoving={playerMoving}
            keys={keys}
            lastEvent={lastEvent}
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
      <DungeonParticles enabled={particlesEnabled} countMultiplier={particleMultiplier} />

      <DungeonAmbience />

      {layoutEnabled && (
        <Suspense fallback={null}>
          <DungeonLayout />
        </Suspense>
      )}

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
  playerRef: RefObject<Group | null>;
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
      <Line points={linePoints} color="#00ffcc" lineWidth={2} />
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

function TestHarnessOverlay({
  layoutEnabled,
  particlesEnabled,
  particleMultiplier,
  teleportIndex,
  freeCam,
  playerPosition,
  playerSpeed,
  playerGrounded,
  playerMoving,
  keys,
  lastEvent,
}: {
  layoutEnabled: boolean;
  particlesEnabled: boolean;
  particleMultiplier: number;
  teleportIndex: number;
  freeCam: boolean;
  playerPosition: { x: number; y: number; z: number };
  playerSpeed: number;
  playerGrounded: boolean;
  playerMoving: boolean;
  keys: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    run: boolean;
    jump: boolean;
  };
  lastEvent: string;
}) {
  const { camera } = useThree();

  return (
    <Html position={[0, 6.2, 0]} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(6, 9, 12, 0.75)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 8,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#e2e8f0',
          minWidth: 260,
        }}
      >
        <div>debug controls: F1 overlay, F2 layout, F3 particles, F4 particle stress, F5 teleport, F6 freecam</div>
        <div>layout: {layoutEnabled ? 'on' : 'off'}</div>
        <div>particles: {particlesEnabled ? 'on' : 'off'} (x{particleMultiplier})</div>
        <div>teleport index: {teleportIndex}</div>
        <div>freecam: {freeCam ? 'on' : 'off'}</div>
        <div>keys: W={keys.forward ? '1' : '0'} A={keys.left ? '1' : '0'} S={keys.backward ? '1' : '0'} D={keys.right ? '1' : '0'} Shift={keys.run ? '1' : '0'} Space={keys.jump ? '1' : '0'}</div>
        <div>player: {playerPosition.x.toFixed(2)}, {playerPosition.y.toFixed(2)}, {playerPosition.z.toFixed(2)}</div>
        <div>speed: {playerSpeed.toFixed(2)} moving: {playerMoving ? 'yes' : 'no'} grounded: {playerGrounded ? 'yes' : 'no'}</div>
        <div>camera: {camera.position.x.toFixed(2)}, {camera.position.y.toFixed(2)}, {camera.position.z.toFixed(2)}</div>
        <div>last event: {lastEvent}</div>
      </div>
    </Html>
  );
}
