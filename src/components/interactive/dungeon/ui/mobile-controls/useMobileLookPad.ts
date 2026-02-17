import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { LOOK_DRAG_MIN_DELTA } from './constants';
import { resolvePointerId } from './math';

type Vec2 = { x: number; y: number };

type UseMobileLookPadParams = {
  blocked: boolean;
  addLookDelta: (delta: Vec2) => void;
};

export function useMobileLookPad({ blocked, addLookDelta }: UseMobileLookPadParams) {
  const lookPointerIdRef = useRef<number | null>(null);
  const lookLastRef = useRef<Vec2>({ x: 0, y: 0 });

  const handleLookPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked) return;
    const pointerId = resolvePointerId(event.pointerId);
    lookPointerIdRef.current = pointerId;
    lookLastRef.current = { x: event.clientX, y: event.clientY };
  }, [blocked]);

  const handleLookPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (blocked) return;
    const pointerId = resolvePointerId(event.pointerId);
    if (lookPointerIdRef.current !== pointerId) return;
    event.preventDefault();
    const dx = event.clientX - lookLastRef.current.x;
    const dy = event.clientY - lookLastRef.current.y;
    if (Math.abs(dx) >= LOOK_DRAG_MIN_DELTA || Math.abs(dy) >= LOOK_DRAG_MIN_DELTA) {
      addLookDelta({ x: dx, y: dy });
    }
    lookLastRef.current = { x: event.clientX, y: event.clientY };
  }, [addLookDelta, blocked]);

  const handleLookPointerRelease = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const pointerId = resolvePointerId(event.pointerId);
    if (lookPointerIdRef.current === pointerId) lookPointerIdRef.current = null;
  }, []);

  return {
    handleLookPointerDown,
    handleLookPointerMove,
    handleLookPointerRelease,
  };
}
