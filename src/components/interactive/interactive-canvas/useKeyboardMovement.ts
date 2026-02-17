import { useEffect } from 'react';

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

type Vec2 = { x: number; y: number };

const KEY_BINDINGS: Record<string, keyof Required<DungeonKeysPatch> | undefined> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  KeyQ: 'dash',
  Space: 'jump',
  KeyC: 'roll',
  KeyR: 'attack',
};

export function useKeyboardMovement(
  setKeys: (patch: DungeonKeysPatch) => void,
  setMoveAxis: (axis: Vec2) => void,
) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      const bound = KEY_BINDINGS[event.code];
      if (!bound) return;
      setKeys({ [bound]: pressed });
    };

    const onKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => handleKey(event, false);
    const onBlur = () => {
      setMoveAxis({ x: 0, y: 0 });
      setKeys({
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        dash: false,
        jump: false,
        roll: false,
        attack: false,
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [setKeys, setMoveAxis]);
}
