'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { MathUtils, Quaternion, Vector3, type Group, type PositionalAudio as PositionalAudioImpl } from 'three';
import PlayerCharacter, { type PlayerAnimation } from './PlayerCharacter';
import { usePlayerState } from '@/lib/playerState';
import { useDungeonInput } from '@/lib/dungeonInput';
import { getNextAnimationState } from './math/animationMath';
import { computeMoveVector } from './math/movementMath';

const WALK_SPEED = 2.4;
const RUN_SPEED = 4.2;
const ACCELERATION = 16;
const FRICTION = 20;
const JUMP_SPEED = 5.2; // Adjusted for snappy jumps
const GRAVITY = 20; // Increased scale for tighter controls
const START_POSITION: [number, number, number] = [0, 2, 0]; // Start slightly higher to prevent clip

const direction = new Vector3();
const targetVelocity = new Vector3();
const rotation = new Quaternion();
const forwardVector = new Vector3();
const upVector = new Vector3(0, 1, 0);

const FOOTSTEP_INTERVAL = {
  walk: 0.48,
  run: 0.32,
};

const FOOTSTEP_URLS = [
  '/sounds/footsteps/grassy_step.wav',
  '/sounds/footsteps/gravel_step.wav',
];

export default function PlayerController({
  playerRef,
  cameraYawRef,
  bodyRef,
}: {
  playerRef?: RefObject<Group | null>;
  cameraYawRef?: MutableRefObject<number>;
  bodyRef?: MutableRefObject<RapierRigidBody | null>;
}) {
  const internalRef = useRef<Group>(null);
  const groupRef = playerRef ?? internalRef;
  const internalBodyRef = useRef<RapierRigidBody | null>(null);
  const rigidBodyRef = bodyRef ?? internalBodyRef;

  const { rapier, world } = useRapier();
  const hasFocus = useDungeonInput((state) => state.hasFocus);

  // State
  const [animation, setAnimation] = useState<PlayerAnimation>('idle');
  const groundedRef = useRef(false);
  const facingRef = useRef(0);
  const jumpRequestedRef = useRef(false);

  // Audio refs
  const footstepRefs = useRef<PositionalAudioImpl[]>([]);
  const jumpAudioRef = useRef<PositionalAudioImpl | null>(null);
  const landAudioRef = useRef<PositionalAudioImpl | null>(null);
  const footstepTimer = useRef(0);
  const wasGroundedRef = useRef(false);

  // Input tracking
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const resetInputs = useCallback(() => {
    inputRef.current.forward = false;
    inputRef.current.backward = false;
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.run = false;
    jumpRequestedRef.current = false;
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      // Allow input even without strict focus if body capture is active
      // but respecting the hasFocus flag is good for UI overlays
      if (!hasFocus && pressed) return;

      const code = event.code;
      switch (code) {
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
          if (pressed) {
            jumpRequestedRef.current = true;
          } else {
            jumpRequestedRef.current = false;
          }
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    const onBlur = () => resetInputs();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [hasFocus, resetInputs]);

  // Main Physics Loop
  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    // Wake up body if input detected
    const anyInput = inputRef.current.forward ||
      inputRef.current.backward ||
      inputRef.current.left ||
      inputRef.current.right ||
      jumpRequestedRef.current;

    // Always wake up if moving
    if (anyInput) body.wakeUp();

    const position = body.translation();

    // Ground Check: Raycast down
    // Center of capsule is at y=1.15 relative to foot. Ray starts a bit lower.
    // Origin: position + small offset up
    const rayOrigin = { x: position.x, y: position.y + 0.5, z: position.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(rayOrigin, rayDir);
    // Ray length should be enough to touch ground (0.5 up + ~0.3 to ground)
    // Capsule half-height 0.8, radius 0.35. Total height ~2.3
    // Position is center of mass.
    // Let's rely on explicit distance tolerance.
    const groundHit = world.castRay(ray, 1.2, true);

    const isGrounded = Boolean(groundHit && (groundHit as any).toi < 0.6); // Tolerance
    groundedRef.current = isGrounded;

    // Landing Sound
    if (!wasGroundedRef.current && isGrounded) {
      // Only play if we fell a bit (velocity check optional)
      landAudioRef.current?.play();
    }
    wasGroundedRef.current = isGrounded;

    // Jumping
    const linVel = body.linvel();
    let nextY = linVel.y;

    if (jumpRequestedRef.current && isGrounded) {
      nextY = JUMP_SPEED;
      groundedRef.current = false; // Detatch immediately
      jumpAudioRef.current?.play();
      jumpRequestedRef.current = false; // Consume jump request
    }

    // Movement Calculation
    const yaw = cameraYawRef?.current ?? 0;
    const moveVector = computeMoveVector(
      inputRef.current,
      yaw
    );

    direction.set(moveVector.x, moveVector.y, moveVector.z);

    // Determine target speed
    const isRunning = inputRef.current.run;
    const inputActive = direction.lengthSq() > 0.001;
    const targetSpeed = isRunning ? RUN_SPEED : WALK_SPEED;

    if (inputActive) {
      direction.normalize();
      targetVelocity.copy(direction).multiplyScalar(targetSpeed);

      // Rotate character model
      const desiredYaw = Math.atan2(direction.x, direction.z);
      facingRef.current = lerpAngle(facingRef.current, desiredYaw, 10 * delta);
    } else {
      targetVelocity.set(0, 0, 0);
    }

    // Apply movement forces (velocity based)
    // Smooth x/z velocity, direct y velocity
    const accel = inputActive ? ACCELERATION : FRICTION;
    const nextX = moveToward(linVel.x, targetVelocity.x, accel * delta);
    const nextZ = moveToward(linVel.z, targetVelocity.z, accel * delta);

    // Apply gravity manually if needed, or let physics handle it (we set gravityScale=0 in previous code, let's enable it nicely)
    // Actually, tight controls usually need manual gravity or strong damping.
    // Let's implement manual gravity for predictable jumps
    if (!isGrounded) {
      nextY -= GRAVITY * delta;
    }

    body.setLinvel({ x: nextX, y: nextY, z: nextZ }, true);

    // Lock rotation to prevent tipping
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    rotation.setFromAxisAngle(upVector, facingRef.current);
    // Sync React ref for model
    if (groupRef.current) {
      groupRef.current.rotation.setFromQuaternion(rotation);
    }

    // Animation State
    const speed = Math.hypot(nextX, nextZ);
    const nextAnim = getNextAnimationState(animation, {
      inputActive,
      isRunning,
      grounded: isGrounded,
      speedOnGround: speed
    });

    if (nextAnim !== animation) setAnimation(nextAnim);

    // Footsteps
    if (isGrounded && inputActive && speed > 0.5) {
      footstepTimer.current -= delta;
      if (footstepTimer.current <= 0) {
        footstepTimer.current = isRunning ? FOOTSTEP_INTERVAL.run : FOOTSTEP_INTERVAL.walk;
        const idx = Math.floor(Math.random() * footstepRefs.current.length);
        if (footstepRefs.current[idx] && !footstepRefs.current[idx].isPlaying) {
          footstepRefs.current[idx].setDetune(MathUtils.randFloat(-100, 100)); // Varied pitch
          footstepRefs.current[idx].play();
        }
      }
    }

    // Update global state for UI/others
    forwardVector.set(0, 0, 1).applyQuaternion(rotation);
    usePlayerState.getState()._setPlayerState({
      position: { x: position.x, y: position.y, z: position.z },
      forward: { x: forwardVector.x, y: forwardVector.y, z: forwardVector.z },
      speed,
      grounded: isGrounded,
      isMoving: inputActive
    });
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={START_POSITION}
      colliders={false}
      enabledRotations={[false, false, false]}
      gravityScale={0} // We handle gravity manually for tighter control
      linearDamping={0}
      angularDamping={0}
      friction={0} // We control friction manually via velocity
    >
      <CapsuleCollider args={[0.8, 0.35]} position={[0, 1.15, 0]} />

      {/* Visual Model */}
      <group ref={groupRef}>
        <PlayerCharacter animation={animation} />

        {/* Footsteps */}
        {FOOTSTEP_URLS.map((url, i) => (
          <PositionalAudio
            key={url}
            ref={(el) => { if (el) footstepRefs.current[i] = el; }}
            url={url}
            distance={5}
            loop={false}
          />
        ))}

        {/* Jump / Land */}
        <PositionalAudio
          ref={jumpAudioRef}
          url="/sounds/player/jump.wav"
          distance={5}
          loop={false}
        />
        <PositionalAudio
          ref={landAudioRef}
          url="/sounds/player/land.wav" // Assuming this exists, or use jump as fallback
          distance={5}
          loop={false}
        />
      </group>
    </RigidBody>
  );
}

// Utils
function moveToward(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

function lerpAngle(current: number, target: number, speed: number) {
  const diff = MathUtils.euclideanModulo(target - current + Math.PI, Math.PI * 2) - Math.PI;
  return current + diff * speed; // Simple lerp, speed should be < 1 generally or dt adjusted
}
