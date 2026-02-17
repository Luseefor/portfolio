import { useEffect, type MutableRefObject } from 'react';

type UseCanvasPointerEventsParams = {
  canvasEl: HTMLCanvasElement | null;
  isTouchDevice: boolean;
  setHasFocus: (focused: boolean) => void;
  setPointerLocked: (locked: boolean) => void;
  setMouseDown: (down: boolean) => void;
  unlockRequestRef: MutableRefObject<number>;
};

export function useCanvasPointerEvents({
  canvasEl,
  isTouchDevice,
  setHasFocus,
  setPointerLocked,
  setMouseDown,
  unlockRequestRef,
}: UseCanvasPointerEventsParams) {
  useEffect(() => {
    if (!canvasEl) return;

    const requestUnlock = (event?: Event) => {
      unlockRequestRef.current = Date.now();
      if (event) {
        event.preventDefault();
        if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
      }
      if (document.pointerLockElement) {
        document.exitPointerLock();
        setTimeout(() => {
          if (document.pointerLockElement) document.exitPointerLock();
        }, 0);
        requestAnimationFrame(() => {
          if (document.pointerLockElement) document.exitPointerLock();
        });
      }
      setPointerLocked(false);
      setHasFocus(true);
    };

    const handleNativeMouseDown = (event: MouseEvent) => {
      if (isTouchDevice) return;
      setMouseDown(true);
      if (event.button === 2) return requestUnlock(event);
      if (document.pointerLockElement !== canvasEl && event.target === canvasEl) {
        try {
          canvasEl.requestPointerLock();
        } catch {
          // Ignore pointer lock request errors and keep keyboard focus flow alive.
        }
      }
    };

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (isTouchDevice) return;
      setMouseDown(true);
      if (event.button === 2) requestUnlock(event);
    };
    const handleMouseUp = () => setMouseDown(false);
    const handleMouseLeave = () => setMouseDown(false);
    const handleContextMenu = (event: MouseEvent) => requestUnlock(event);
    const handlePointerDown = (event: PointerEvent) => {
      if (isTouchDevice || event.pointerType === 'touch') return;
      if (event.button === 2) requestUnlock(event);
    };
    const handlePointerUp = () => setMouseDown(false);

    canvasEl.addEventListener('mousedown', handleNativeMouseDown);
    canvasEl.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);
    canvasEl.addEventListener('contextmenu', handleContextMenu);
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mousedown', handleDocumentMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('pointerup', handlePointerUp, true);
    document.addEventListener('auxclick', handleContextMenu, true);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvasEl.removeEventListener('mousedown', handleNativeMouseDown);
      canvasEl.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('mouseleave', handleMouseLeave);
      canvasEl.removeEventListener('contextmenu', handleContextMenu);
      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      canvasEl.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('pointerup', handlePointerUp, true);
      document.removeEventListener('auxclick', handleContextMenu, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [canvasEl, isTouchDevice, setHasFocus, setMouseDown, setPointerLocked, unlockRequestRef]);
}
