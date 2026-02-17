import { useEffect } from 'react';

export function useCanvasFocusOnKey(
  canvasEl: HTMLCanvasElement | null,
  setHasFocus: (focused: boolean) => void,
) {
  useEffect(() => {
    if (!canvasEl) return;
    const focusCanvas = () => {
      canvasEl.focus();
      setHasFocus(true);
    };
    window.addEventListener('keydown', focusCanvas);
    return () => window.removeEventListener('keydown', focusCanvas);
  }, [canvasEl, setHasFocus]);
}
