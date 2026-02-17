import { useEffect, type MutableRefObject } from 'react';
import { useDungeonInput } from '@/lib/dungeonInput';

type UsePointerLockSyncParams = {
  canvasEl: HTMLCanvasElement | null;
  isTouchDevice: boolean;
  isSettingsOpen: boolean;
  hasActivePanel: boolean;
  isWelcomeOpen: boolean;
  handleOpenSettings: () => void;
  setHasFocus: (focused: boolean) => void;
  setPointerLocked: (locked: boolean) => void;
  unlockRequestRef: MutableRefObject<number>;
};

export function usePointerLockSync({
  canvasEl,
  isTouchDevice,
  isSettingsOpen,
  hasActivePanel,
  isWelcomeOpen,
  handleOpenSettings,
  setHasFocus,
  setPointerLocked,
  unlockRequestRef,
}: UsePointerLockSyncParams) {
  useEffect(() => {
    if (!canvasEl) return;
    if (isTouchDevice) {
      setPointerLocked(false);
      return;
    }

    const handlePointerLockChange = () => {
      const wasLocked = useDungeonInput.getState().isPointerLocked;
      const isLocked = document.pointerLockElement === canvasEl;
      if (isLocked && Date.now() - unlockRequestRef.current < 200) {
        document.exitPointerLock();
        return;
      }
      setPointerLocked(isLocked);
      if (isLocked) {
        setHasFocus(true);
      } else {
        if (document.activeElement !== canvasEl) setHasFocus(false);
        const unlockedByMouseRequest = Date.now() - unlockRequestRef.current < 260;
        if (wasLocked && !unlockedByMouseRequest && !isSettingsOpen && !hasActivePanel && !isWelcomeOpen) {
          handleOpenSettings();
        }
      }
    };

    const handlePointerLockError = () => {
      setPointerLocked(false);
      if (document.activeElement !== canvasEl) setHasFocus(false);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
    };
  }, [
    canvasEl,
    handleOpenSettings,
    hasActivePanel,
    isSettingsOpen,
    isTouchDevice,
    isWelcomeOpen,
    setHasFocus,
    setPointerLocked,
    unlockRequestRef,
  ]);
}
