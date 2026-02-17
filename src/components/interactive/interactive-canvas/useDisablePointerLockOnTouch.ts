import { useEffect } from 'react';

export function useDisablePointerLockOnTouch(
  isTouchDevice: boolean,
  setPointerLocked: (locked: boolean) => void,
) {
  useEffect(() => {
    if (!isTouchDevice) return;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setPointerLocked(false);
  }, [isTouchDevice, setPointerLocked]);
}
