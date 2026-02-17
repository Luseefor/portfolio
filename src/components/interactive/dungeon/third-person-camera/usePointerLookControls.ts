import { useEffect, type MutableRefObject } from 'react';
import { applyLookDelta, applyScrollZoom } from './lookInput';
import type { PointerDragState } from './types';

type UsePointerLookControlsParams = {
  canvas: HTMLCanvasElement | null;
  isPointerLocked: boolean;
  isTouchDevice: boolean;
  mouseSensitivity: number;
  desiredYawRef: MutableRefObject<number>;
  desiredPitchRef: MutableRefObject<number>;
  targetDistanceRef: MutableRefObject<number>;
  pointerDragStateRef: MutableRefObject<PointerDragState>;
};

export function usePointerLookControls({
  canvas,
  isPointerLocked,
  isTouchDevice,
  mouseSensitivity,
  desiredYawRef,
  desiredPitchRef,
  targetDistanceRef,
  pointerDragStateRef,
}: UsePointerLookControlsParams) {
  useEffect(() => {
    if (!canvas) return;
    const drag = pointerDragStateRef.current;
    const stopDragging = () => {
      drag.active = false;
      drag.hasPoint = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || isTouchDevice) return;
      if (event.button !== 0) return;
      drag.active = true;
      drag.hasPoint = false;
      canvas.focus();
      if (document.pointerLockElement !== canvas) {
        try {
          canvas.requestPointerLock();
        } catch {
          // Drag fallback still works when pointer lock is rejected.
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const locked = document.pointerLockElement === canvas || isPointerLocked;
      if (locked) {
        applyLookDelta({ desiredYawRef, desiredPitchRef }, event.movementX ?? 0, event.movementY ?? 0, mouseSensitivity);
        return;
      }

      if (!drag.active || event.buttons === 0) {
        stopDragging();
        return;
      }

      if (!drag.hasPoint) {
        drag.hasPoint = true;
        drag.x = event.clientX;
        drag.y = event.clientY;
        return;
      }

      applyLookDelta(
        { desiredYawRef, desiredPitchRef },
        event.clientX - drag.x,
        event.clientY - drag.y,
        mouseSensitivity,
      );
      drag.x = event.clientX;
      drag.y = event.clientY;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyScrollZoom(targetDistanceRef, event.deltaY);
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== canvas) {
        stopDragging();
      }
    };

    const handlePointerCancel = () => {
      stopDragging();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('pointercancel', handlePointerCancel);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('blur', stopDragging);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('blur', stopDragging);
    };
  }, [
    canvas,
    isPointerLocked,
    isTouchDevice,
    mouseSensitivity,
    desiredYawRef,
    desiredPitchRef,
    targetDistanceRef,
    pointerDragStateRef,
  ]);
}
