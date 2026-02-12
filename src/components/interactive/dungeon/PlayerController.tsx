'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { Group, MathUtils, PerspectiveCamera, Quaternion, Vector3, type Camera } from 'three';
import { Suspense } from 'react';
import PlayerCharacter, { type PlayerAnimation } from './PlayerCharacter';
import { useDungeonInput } from '@/lib/dungeonInput';
import { getDungeonVisualLiftAt } from '@/lib/dungeonVisualLift';
import { DUNGEON_BOUNDS } from '@/constants/dungeonBounds';
import { DUNGEON_LAYOUT_GRAPH } from '@/constants/dungeonLayout';

const WALK_SPEED = 2.4;
const RUN_SPEED = 6.2;
const SMOOTHING = 10;
const JUMP_SPEED = 7.2;
const GRAVITY = 24;
const START_POSITION: [number, number, number] = [
  DUNGEON_LAYOUT_GRAPH.spawnPoint[0],
  DUNGEON_LAYOUT_GRAPH.spawnPoint[1],
  DUNGEON_LAYOUT_GRAPH.spawnPoint[2],
];
const STEP_INTERVAL_WALK = 0.6;
const STEP_INTERVAL_RUN = 0.42;
const PLAYER_LIFT_UP_SMOOTHING = 18;
const PLAYER_LIFT_DOWN_SMOOTHING = 8;
const DASH_DURATION = 0.2;
const DASH_COOLDOWN = 0.95;
const DASH_MAX_DISTANCE = 5.8;
const DASH_MIN_DISTANCE = 1.6;
const DASH_RAY_BUFFER = 0.45;
const DASH_COLLISION_OFFSET = 0.4;
const DASH_CAMERA_KICK = 2.25;
const DASH_FOV_DAMPING = 14;

const forward = new Vector3();
const right = new Vector3();
const up = new Vector3(0, 1, 0);
const moveDir = new Vector3();
const dashDirection = new Vector3();
const rotation = new Quaternion();
const bodyQuaternion = new Quaternion();

function clampPlayerX(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxX - DUNGEON_BOUNDS.playerPadding,
    Math.max(DUNGEON_BOUNDS.minX + DUNGEON_BOUNDS.playerPadding, value),
  );
}

function clampPlayerZ(value: number) {
  return Math.min(
    DUNGEON_BOUNDS.maxZ - DUNGEON_BOUNDS.playerPadding,
    Math.max(DUNGEON_BOUNDS.minZ + DUNGEON_BOUNDS.playerPadding, value),
  );
}

function isPerspectiveCamera(camera: Camera): camera is PerspectiveCamera {
  return (camera as PerspectiveCamera).isPerspectiveCamera === true;
}

export default function PlayerController({
  bodyRef,
  cameraYawRef,
}: {
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
  cameraYawRef?: MutableRefObject<number>;
}) {
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const keys = useDungeonInput((state) => state.keys);
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    roll: false,
  });

  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedTimer = useRef(0);
  const jumpBuffer = useRef(1);
  const rollTimer = useRef(0);
  const stepTimer = useRef(0);
  const stepIndex = useRef(0);
  const characterRootRef = useRef<Group | null>(null);
  const visualLiftRef = useRef(0);
  const stepAudioRef = useRef<HTMLAudioElement[]>([]);
  const jumpAudioRef = useRef<HTMLAudioElement | null>(null);
  const dashRef = useRef({
    active: false,
    timeLeft: 0,
    speed: 0,
    direction: new Vector3(0, 0, 1),
  });
  const dashCooldownRef = useRef(0);
  const dashButtonPrevRef = useRef(false);
  const baseFovRef = useRef(isPerspectiveCamera(camera) ? camera.fov : 50);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!stepAudioRef.current.length) {
      stepAudioRef.current = [
        new Audio('/sounds/footsteps/gravel_step.wav'),
        new Audio('/sounds/footsteps/grassy_step.wav'),
      ];
      stepAudioRef.current.forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = 0.35;
      });
    }
    jumpAudioRef.current = null;
  }, []);

  useEffect(() => {
    if (!isPerspectiveCamera(camera)) return;
    baseFovRef.current = camera.fov;
    return () => {
      camera.fov = baseFovRef.current;
      camera.updateProjectionMatrix();
    };
  }, [camera]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.forward = pressed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.backward = pressed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.left = pressed;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.right = pressed;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.run = pressed;
          break;
        case 'Space':
          inputRef.current.jump = pressed;
          break;
        case 'KeyC':
        case 'KeyR':
          inputRef.current.roll = pressed;
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const onBlur = () => {
      inputRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        jump: false,
        roll: false,
      };
      dashButtonPrevRef.current = false;
      dashRef.current.active = false;
      dashRef.current.timeLeft = 0;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const position = body.translation();
    const linvel = body.linvel();

    // Keep grounding simple and deterministic for this tilemap.
    const grounded = Math.abs(linvel.y) < 0.2 && position.y <= 2.05;

    const targetVisualLift = grounded ? getDungeonVisualLiftAt(position.x, position.z) : 0;
    const liftSmoothing =
      targetVisualLift >= visualLiftRef.current ? PLAYER_LIFT_UP_SMOOTHING : PLAYER_LIFT_DOWN_SMOOTHING;
    const liftLerp = 1 - Math.exp(-liftSmoothing * delta);
    visualLiftRef.current = MathUtils.lerp(visualLiftRef.current, targetVisualLift, liftLerp);
    if (characterRootRef.current) {
      characterRootRef.current.position.y = visualLiftRef.current;
    }
    if (grounded) groundedTimer.current = 0;
    else groundedTimer.current += delta;

    const cameraYaw = cameraYawRef?.current;
    if (Number.isFinite(cameraYaw)) {
      const safeYaw = cameraYaw as number;
      forward.set(Math.sin(safeYaw), 0, Math.cos(safeYaw));
    } else {
      camera.getWorldDirection(forward);
      forward.y = 0;
    }
    if (forward.lengthSq() < 1e-4) forward.set(0, 0, 1);
    forward.normalize();
    right.set(forward.z, 0, -forward.x).normalize();

    const forwardPressed = keys.forward || inputRef.current.forward;
    const backwardPressed = keys.backward || inputRef.current.backward;
    const leftPressed = keys.left || inputRef.current.left;
    const rightPressed = keys.right || inputRef.current.right;
    const runPressed = keys.run || inputRef.current.run;
    const jumpPressed = keys.jump || inputRef.current.jump;
    const rollPressed = keys.roll || inputRef.current.roll;

    moveDir.set(0, 0, 0);
    if (forwardPressed) moveDir.add(forward);
    if (backwardPressed) moveDir.sub(forward);
    if (leftPressed) moveDir.sub(right);
    if (rightPressed) moveDir.add(right);

    const hasInput = moveDir.lengthSq() > 0.001;
    const dashPressed = runPressed;
    const dashJustPressed = dashPressed && !dashButtonPrevRef.current;
    dashButtonPrevRef.current = dashPressed;

    if (hasInput || jumpPressed || dashJustPressed) {
      body.wakeUp();
    }

    const targetSpeed = runPressed ? RUN_SPEED : WALK_SPEED;
    let targetX = 0;
    let targetZ = 0;

    if (hasInput) {
      dashDirection.copy(moveDir).normalize();
      moveDir.copy(dashDirection).multiplyScalar(targetSpeed);
      targetX = moveDir.x;
      targetZ = moveDir.z;
      const desiredYaw = Math.atan2(moveDir.x, moveDir.z);
      rotation.setFromAxisAngle(up, desiredYaw);
      body.setRotation(rotation, true);
    } else {
      const bodyRotation = body.rotation();
      bodyQuaternion.set(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w);
      dashDirection.set(0, 0, 1).applyQuaternion(bodyQuaternion);
      dashDirection.y = 0;
      if (dashDirection.lengthSq() < 1e-4) {
        dashDirection.set(forward.x, 0, forward.z);
      }
      dashDirection.normalize();
    }

    const now = performance.now() / 1000;
    if (dashJustPressed && !dashRef.current.active && now >= dashCooldownRef.current) {
      const ray = new rapier.Ray(
        {
          x: position.x,
          y: position.y + 1,
          z: position.z,
        },
        {
          x: dashDirection.x,
          y: 0,
          z: dashDirection.z,
        },
      );
      const hit = world.castRay(
        ray,
        DASH_MAX_DISTANCE + DASH_RAY_BUFFER,
        true,
        undefined,
        undefined,
        undefined,
        body,
      );

      let allowedDistance = DASH_MAX_DISTANCE;
      if (hit && Number.isFinite(hit.timeOfImpact)) {
        allowedDistance = Math.max(DASH_MIN_DISTANCE, hit.timeOfImpact - DASH_COLLISION_OFFSET);
      }

      dashRef.current.active = true;
      dashRef.current.timeLeft = DASH_DURATION;
      dashRef.current.speed = allowedDistance / DASH_DURATION;
      dashRef.current.direction.copy(dashDirection);
      dashCooldownRef.current = now + DASH_COOLDOWN;
    }

    const desiredX = targetX;
    const desiredZ = targetZ;
    const smoothing = 1 - Math.exp(-SMOOTHING * delta);
    const smoothX = MathUtils.lerp(linvel.x, desiredX, smoothing);
    const smoothZ = MathUtils.lerp(linvel.z, desiredZ, smoothing);

    jumpBuffer.current = jumpPressed || rollPressed ? 0 : jumpBuffer.current + delta;
    const canJump = jumpBuffer.current < 0.2 && groundedTimer.current < 0.2;
    let nextY = linvel.y - GRAVITY * delta;
    if (canJump) {
      nextY = JUMP_SPEED;
      if (rollPressed && hasInput) {
        rollTimer.current = 0.6;
        const rollBoost = runPressed ? 3.4 : 2.6;
        body.setLinvel(
          {
            x: smoothX + moveDir.x * rollBoost,
            y: nextY,
            z: smoothZ + moveDir.z * rollBoost,
          },
          true,
        );
      } else if (forwardPressed) {
        rollTimer.current = 0.6;
        const rollBoost = runPressed ? 3.2 : 2.4;
        body.setLinvel(
          {
            x: smoothX + moveDir.x * rollBoost,
            y: nextY,
            z: smoothZ + moveDir.z * rollBoost,
          },
          true,
        );
      }
      jumpBuffer.current = 1;
      groundedTimer.current = 1;
    } else if (grounded) {
      nextY = 0;
    }

    if (dashRef.current.active) {
      dashRef.current.timeLeft = Math.max(0, dashRef.current.timeLeft - delta);
      body.setLinvel(
        {
          x: dashRef.current.direction.x * dashRef.current.speed,
          y: nextY,
          z: dashRef.current.direction.z * dashRef.current.speed,
        },
        true,
      );
      if (dashRef.current.timeLeft <= 0) {
        dashRef.current.active = false;
      }
    } else if (!hasInput && Math.abs(smoothX) < 0.02 && Math.abs(smoothZ) < 0.02) {
      body.setLinvel({ x: 0, y: nextY, z: 0 }, true);
    } else {
      body.setLinvel({ x: smoothX, y: nextY, z: smoothZ }, true);
    }

    if (rollTimer.current > 0) {
      rollTimer.current = Math.max(0, rollTimer.current - delta);
    }

    // Hard physics border: player body cannot leave dungeon map bounds.
    const postStep = body.translation();
    const clampedX = clampPlayerX(postStep.x);
    const clampedZ = clampPlayerZ(postStep.z);
    if (Math.abs(clampedX - postStep.x) > 0.001 || Math.abs(clampedZ - postStep.z) > 0.001) {
      body.setTranslation({ x: clampedX, y: postStep.y, z: clampedZ }, true);
      const currentVel = body.linvel();
      body.setLinvel(
        {
          x: clampedX !== postStep.x ? 0 : currentVel.x,
          y: currentVel.y,
          z: clampedZ !== postStep.z ? 0 : currentVel.z,
        },
        true,
      );
    }

    const speed = Math.hypot(smoothX, smoothZ);
    stepTimer.current -= delta;
    if (grounded && speed > 0.2 && rollTimer.current <= 0 && !dashRef.current.active) {
      if (stepTimer.current <= 0) {
        const index = stepIndex.current % stepAudioRef.current.length;
        const stepAudio = stepAudioRef.current[index];
        if (stepAudio) {
          stepAudio.currentTime = 0;
          stepAudio.volume = runPressed ? 0.55 : 0.38;
          stepAudio.playbackRate = runPressed ? 1.1 + Math.random() * 0.12 : 0.92 + Math.random() * 0.08;
          stepAudio.play().catch(() => {});
        }
        stepIndex.current += 1;
        const speedBlend = Math.min(1, speed / RUN_SPEED);
        const interval = MathUtils.lerp(STEP_INTERVAL_WALK, STEP_INTERVAL_RUN, speedBlend);
        stepTimer.current = interval * (0.95 + Math.random() * 0.1);
      }
    } else {
      stepTimer.current = 0;
    }

    if (isPerspectiveCamera(camera)) {
      const dashFovTarget = dashRef.current.active ? baseFovRef.current + DASH_CAMERA_KICK : baseFovRef.current;
      const fovBlend = 1 - Math.exp(-DASH_FOV_DAMPING * delta);
      const nextFov = MathUtils.lerp(camera.fov, dashFovTarget, fovBlend);
      if (Math.abs(nextFov - camera.fov) > 0.001) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }

    let nextAnim: PlayerAnimation = 'idle';
    if (dashRef.current.active) {
      nextAnim = 'dash';
    } else if (rollTimer.current > 0) {
      nextAnim = 'jump';
    } else if (speed > 0.15) {
      nextAnim = runPressed ? 'run' : 'walk';
    }
    if (nextAnim !== animation) setAnimation(nextAnim);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={0.2}
      angularDamping={0.2}
    >
      <CapsuleCollider args={[0.8, 0.35]} position={[0, 1.1, 0]} />
      <group ref={characterRootRef}>
        <Suspense
          fallback={
            <mesh position={[0, 1.1, 0]}>
              <capsuleGeometry args={[0.35, 1.6, 6, 12]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          }
        >
          <PlayerCharacter animation={animation} />
        </Suspense>
      </group>
    </RigidBody>
  );
}
