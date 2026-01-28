'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import SubmarineModel from './SubmarineModel';

interface SubmarineControllerProps {
  modelUrl?: string;
}

export default function SubmarineController({ modelUrl }: SubmarineControllerProps) {
  const bodyRef = useRef<THREE.Object3D>(null);
  const rigidRef = useRef<any>(null);
  const { gl } = useThree();

  const input = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const direction = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          input.current.forward = true;
          break;
        case 'KeyS':
          input.current.back = true;
          break;
        case 'KeyA':
          input.current.left = true;
          break;
        case 'KeyD':
          input.current.right = true;
          break;
        case 'KeyQ':
          input.current.down = true;
          break;
        case 'KeyE':
          input.current.up = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          input.current.forward = false;
          break;
        case 'KeyS':
          input.current.back = false;
          break;
        case 'KeyA':
          input.current.left = false;
          break;
        case 'KeyD':
          input.current.right = false;
          break;
        case 'KeyQ':
          input.current.down = false;
          break;
        case 'KeyE':
          input.current.up = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;

      const sensitivity = 0.002;
      yawRef.current -= event.movementX * sensitivity;
      pitchRef.current -= event.movementY * sensitivity;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current, -0.6, 0.6);
    };

    const handlePointerLock = () => {
      if (document.pointerLockElement !== gl.domElement) {
        return;
      }
    };

    gl.domElement.addEventListener('click', () => {
      gl.domElement.requestPointerLock();
    });

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLock);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLock);
    };
  }, [gl.domElement]);

  useFrame((state, delta) => {
    const rigidbody = rigidRef.current;
    if (!rigidbody) return;

    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ'),
    );
    rigidbody.setRotation(quaternion, true);

    const inputState = input.current;
    direction.set(0, 0, 0);

    if (inputState.forward) direction.z -= 1;
    if (inputState.back) direction.z += 1;
    if (inputState.left) direction.x -= 1;
    if (inputState.right) direction.x += 1;
    if (inputState.up) direction.y += 1;
    if (inputState.down) direction.y -= 1;

    if (direction.lengthSq() > 0) direction.normalize();

    const rotation = new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ');
    forward.set(0, 0, -1).applyEuler(rotation);
    right.set(1, 0, 0).applyEuler(rotation);

    const moveSpeed = 3.2;
    const verticalSpeed = 2.4;
    const desiredVelocity = new THREE.Vector3();

    desiredVelocity.addScaledVector(forward, direction.z * moveSpeed);
    desiredVelocity.addScaledVector(right, direction.x * moveSpeed);
    desiredVelocity.addScaledVector(up, direction.y * verticalSpeed);

    const currentVel = rigidbody.linvel();
    const currentVelocity = new THREE.Vector3(currentVel.x, currentVel.y, currentVel.z);

    const accel = 4.0;
    const drag = 3.0;
    const smoothing = direction.lengthSq() > 0 ? accel : drag;

    currentVelocity.lerp(desiredVelocity, 1 - Math.exp(-smoothing * delta));

    rigidbody.setLinvel(
      { x: currentVelocity.x, y: currentVelocity.y, z: currentVelocity.z },
      true,
    );
  });

  return (
    <RigidBody
      ref={rigidRef}
      type="dynamic"
      colliders={false}
      linearDamping={2.4}
      angularDamping={3.0}
      gravityScale={0.1}
      position={[0, -1.0, 0]}
      enabledRotations={[true, true, true]}
    >
      <CapsuleCollider args={[1.0, 0.45]} restitution={0.2} friction={0.8} />
      <group ref={bodyRef}>
        <SubmarineModel modelUrl={modelUrl} position={[0, 0, 0]} />
      </group>
    </RigidBody>
  );
}
