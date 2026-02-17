import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ACTION_PULSE_MS,
  JOYSTICK_DEADZONE,
  JOYSTICK_RADIUS,
  type ActionKey,
} from './constants';
import { applyDeadzone, clampVector, resolvePointerId } from './math';

type Vec2 = { x: number; y: number };

type DungeonKeysPatch = Partial<{
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  dash: boolean;
  jump: boolean;
  roll: boolean;
  attack: boolean;
}>;

type UseMobileJoystickParams = {
  visible: boolean;
  blocked: boolean;
  setKeys: (patch: DungeonKeysPatch) => void;
  setMoveAxis: (axis: Vec2) => void;
};

export function useMobileJoystick({ visible, blocked, setKeys, setMoveAxis }: UseMobileJoystickParams) {
  const [stickOffset, setStickOffset] = useState<Vec2>({ x: 0, y: 0 });
  const joystickPointerIdRef = useRef<number | null>(null);
  const pulseTimersRef = useRef<number[]>([]);
  const joystickRef = useRef<HTMLDivElement | null>(null);

  const clearPulseTimers = useCallback(() => {
    for (let i = 0; i < pulseTimersRef.current.length; i += 1) {
      window.clearTimeout(pulseTimersRef.current[i]);
    }
    pulseTimersRef.current = [];
  }, []);

  const releaseMovement = useCallback(() => {
    joystickPointerIdRef.current = null;
    setStickOffset({ x: 0, y: 0 });
    setMoveAxis({ x: 0, y: 0 });
    setKeys({ run: false });
  }, [setKeys, setMoveAxis]);

  const applyJoystickPosition = useCallback((clientX: number, clientY: number) => {
    const root = joystickRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;
    const clamped = clampVector(clientX - centerX, clientY - centerY, JOYSTICK_RADIUS);
    const normalizedX = clamped.x / JOYSTICK_RADIUS;
    const normalizedY = clamped.y / JOYSTICK_RADIUS;
    const moveX = applyDeadzone(normalizedX, JOYSTICK_DEADZONE);
    const moveY = applyDeadzone(-normalizedY, JOYSTICK_DEADZONE);
    const magnitude = Math.min(1, Math.hypot(moveX, moveY));
    setStickOffset(clamped);
    setMoveAxis({ x: moveX, y: moveY });
    setKeys({ run: magnitude > 0.78 });
  }, [setKeys, setMoveAxis]);

  const pulseAction = useCallback((actionKey: ActionKey) => {
    if (blocked) return;
    setKeys({ [actionKey]: true });
    const timerId = window.setTimeout(() => setKeys({ [actionKey]: false }), ACTION_PULSE_MS);
    pulseTimersRef.current.push(timerId);
  }, [blocked, setKeys]);

  useEffect(() => {
    if (visible) return;
    releaseMovement();
    setKeys({
      jump: false, roll: false, dash: false, attack: false, run: false,
      forward: false, backward: false, left: false, right: false,
    });
  }, [releaseMovement, setKeys, visible]);

  useEffect(() => {
    if (!blocked) return;
    releaseMovement();
  }, [blocked, releaseMovement]);

  useEffect(() => {
    return () => {
      clearPulseTimers();
      setMoveAxis({ x: 0, y: 0 });
      setKeys({ jump: false, roll: false, dash: false, attack: false, run: false });
    };
  }, [clearPulseTimers, setKeys, setMoveAxis]);

  const handleJoystickPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked) return;
    event.preventDefault();
    const pointerId = resolvePointerId(event.pointerId);
    joystickPointerIdRef.current = pointerId;
    if ('setPointerCapture' in event.currentTarget) {
      try {
        event.currentTarget.setPointerCapture(pointerId);
      } catch {
        // Ignore pointer-capture errors in unsupported environments.
      }
    }
    applyJoystickPosition(event.clientX, event.clientY);
  }, [applyJoystickPosition, blocked]);

  const handleJoystickPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked) return;
    const pointerId = resolvePointerId(event.pointerId);
    if (joystickPointerIdRef.current !== pointerId) return;
    event.preventDefault();
    applyJoystickPosition(event.clientX, event.clientY);
  }, [applyJoystickPosition, blocked]);

  const handleJoystickPointerRelease = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const pointerId = resolvePointerId(event.pointerId);
    if (joystickPointerIdRef.current !== pointerId) return;
    event.preventDefault();
    releaseMovement();
  }, [releaseMovement]);

  return {
    joystickRef,
    stickOffset,
    pulseAction,
    handleJoystickPointerDown,
    handleJoystickPointerMove,
    handleJoystickPointerRelease,
  };
}
