'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDungeonInput } from '@/lib/dungeonInput';
import { useDungeonUiTheme } from './useDungeonUiTheme';

type ActionKey = 'jump' | 'roll' | 'dash' | 'attack';

const JOYSTICK_RADIUS = 46;
const JOYSTICK_DEADZONE = 0.14;
const LOOK_DRAG_MIN_DELTA = 0.25;
const ACTION_PULSE_MS = 115;

type Vec2 = { x: number; y: number };

interface MobileControlsProps {
  visible: boolean;
  blocked: boolean;
  canInteract: boolean;
  onInteract: () => void;
  onOpenSettings: () => void;
}

function clampVector(x: number, y: number, radius: number): Vec2 {
  const length = Math.hypot(x, y);
  if (length <= radius || length <= 1e-5) return { x, y };
  const scale = radius / length;
  return { x: x * scale, y: y * scale };
}

function applyDeadzone(value: number, deadzone: number) {
  if (Math.abs(value) <= deadzone) return 0;
  const sign = Math.sign(value);
  const magnitude = (Math.abs(value) - deadzone) / (1 - deadzone);
  return sign * Math.min(1, Math.max(0, magnitude));
}

export default function MobileControls({
  visible,
  blocked,
  canInteract,
  onInteract,
  onOpenSettings,
}: MobileControlsProps) {
  const theme = useDungeonUiTheme();
  const setKeys = useDungeonInput((state) => state.setKeys);
  const setMoveAxis = useDungeonInput((state) => state.setMoveAxis);
  const addLookDelta = useDungeonInput((state) => state.addLookDelta);

  const [stickOffset, setStickOffset] = useState<Vec2>({ x: 0, y: 0 });
  const joystickPointerIdRef = useRef<number | null>(null);
  const lookPointerIdRef = useRef<number | null>(null);
  const lookLastRef = useRef<Vec2>({ x: 0, y: 0 });
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

  const applyJoystickPosition = useCallback(
    (clientX: number, clientY: number) => {
      const root = joystickRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const clamped = clampVector(dx, dy, JOYSTICK_RADIUS);
      const normalizedX = clamped.x / JOYSTICK_RADIUS;
      const normalizedY = clamped.y / JOYSTICK_RADIUS;
      const moveX = applyDeadzone(normalizedX, JOYSTICK_DEADZONE);
      const moveY = applyDeadzone(-normalizedY, JOYSTICK_DEADZONE);
      const magnitude = Math.min(1, Math.hypot(moveX, moveY));
      setStickOffset(clamped);
      setMoveAxis({ x: moveX, y: moveY });
      setKeys({ run: magnitude > 0.78 });
    },
    [setKeys, setMoveAxis],
  );

  const pulseAction = useCallback(
    (actionKey: ActionKey) => {
      if (blocked) return;
      setKeys({ [actionKey]: true });
      const timerId = window.setTimeout(() => {
        setKeys({ [actionKey]: false });
      }, ACTION_PULSE_MS);
      pulseTimersRef.current.push(timerId);
    },
    [blocked, setKeys],
  );

  useEffect(() => {
    if (visible) return;
    releaseMovement();
    setKeys({
      jump: false,
      roll: false,
      dash: false,
      attack: false,
      run: false,
      forward: false,
      backward: false,
      left: false,
      right: false,
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

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      <div className="pointer-events-auto absolute right-4 top-4 pb-[env(safe-area-inset-top)]">
        <button
          type="button"
          data-testid="mobile-settings"
          onPointerDown={(event) => {
            event.preventDefault();
            onOpenSettings();
          }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border bg-stone-900/90 shadow-[0_0_18px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          style={{ borderColor: theme.accentBorderStrong, color: theme.accentText }}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.9}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-4 pb-[env(safe-area-inset-bottom)]">
        <div
          ref={joystickRef}
          data-testid="mobile-joystick"
          onPointerDown={(event) => {
            if (blocked) return;
            event.preventDefault();
            const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
            joystickPointerIdRef.current = pointerId;
            if ('setPointerCapture' in event.currentTarget) {
              try {
                event.currentTarget.setPointerCapture(pointerId);
              } catch {
                // Ignore pointer-capture errors in unsupported environments.
              }
            }
            applyJoystickPosition(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (blocked) return;
            const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
            if (joystickPointerIdRef.current !== pointerId) return;
            event.preventDefault();
            applyJoystickPosition(event.clientX, event.clientY);
          }}
          onPointerUp={(event) => {
            const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
            if (joystickPointerIdRef.current !== pointerId) return;
            event.preventDefault();
            releaseMovement();
          }}
          onPointerCancel={(event) => {
            const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
            if (joystickPointerIdRef.current !== pointerId) return;
            event.preventDefault();
            releaseMovement();
          }}
          style={{ touchAction: 'none' }}
          className="relative h-28 w-28 rounded-full border border-stone-600/80 bg-stone-900/65 shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute inset-[11px] rounded-full border border-stone-700/70" />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              borderColor: theme.accentBorderStrong,
              backgroundColor: theme.accentBgStrong,
              boxShadow: `0 0 20px ${theme.accentGlow}`,
              transform: `translate(calc(-50% + ${stickOffset.x}px), calc(-50% + ${stickOffset.y}px))`,
            }}
          />
        </div>
      </div>

      <div
        data-testid="mobile-look-pad"
        onPointerDown={(event) => {
          if (blocked) return;
          const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
          lookPointerIdRef.current = pointerId;
          lookLastRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (blocked) return;
          const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
          if (lookPointerIdRef.current !== pointerId) return;
          event.preventDefault();
          const dx = event.clientX - lookLastRef.current.x;
          const dy = event.clientY - lookLastRef.current.y;
          if (Math.abs(dx) >= LOOK_DRAG_MIN_DELTA || Math.abs(dy) >= LOOK_DRAG_MIN_DELTA) {
            addLookDelta({ x: dx, y: dy });
          }
          lookLastRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
          if (lookPointerIdRef.current === pointerId) lookPointerIdRef.current = null;
        }}
        onPointerCancel={(event) => {
          const pointerId = Number.isFinite(event.pointerId) ? event.pointerId : 1;
          if (lookPointerIdRef.current === pointerId) lookPointerIdRef.current = null;
        }}
        style={{ touchAction: 'none' }}
        className="pointer-events-auto absolute bottom-0 right-0 top-0 w-[52%]"
      />

      <div className="pointer-events-auto absolute bottom-4 right-4 grid grid-cols-2 gap-2 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          data-testid="mobile-action-jump"
          disabled={blocked}
          onPointerDown={(event) => {
            event.preventDefault();
            pulseAction('jump');
          }}
          className="h-12 min-w-[72px] rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgSoft,
            boxShadow: `0 0 12px ${theme.accentGlow}`,
          }}
        >
          Jump
        </button>
        <button
          type="button"
          data-testid="mobile-action-roll"
          disabled={blocked}
          onPointerDown={(event) => {
            event.preventDefault();
            pulseAction('roll');
          }}
          className="h-12 min-w-[72px] rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgSoft,
            boxShadow: `0 0 12px ${theme.accentGlow}`,
          }}
        >
          Roll
        </button>
        <button
          type="button"
          data-testid="mobile-action-dash"
          disabled={blocked}
          onPointerDown={(event) => {
            event.preventDefault();
            pulseAction('dash');
          }}
          className="h-12 min-w-[72px] rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgSoft,
            boxShadow: `0 0 12px ${theme.accentGlow}`,
          }}
        >
          Dash
        </button>
        <button
          type="button"
          data-testid="mobile-action-attack"
          disabled={blocked}
          onPointerDown={(event) => {
            event.preventDefault();
            pulseAction('attack');
          }}
          className="h-12 min-w-[72px] rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgSoft,
            boxShadow: `0 0 12px ${theme.accentGlow}`,
          }}
        >
          Attack
        </button>
        <button
          type="button"
          data-testid="mobile-action-interact"
          disabled={blocked || !canInteract}
          onPointerDown={(event) => {
            event.preventDefault();
            onInteract();
          }}
          className="col-span-2 h-12 rounded-xl border px-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
          style={{
            borderColor: theme.accentBorderStrong,
            backgroundColor: theme.accentBgStrong,
            boxShadow: `0 0 16px ${theme.accentGlowStrong}`,
          }}
        >
          {canInteract ? 'Interact' : 'No Target'}
        </button>
      </div>
    </div>
  );
}
