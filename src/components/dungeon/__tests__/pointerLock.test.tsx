import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import InteractiveCanvas from '@/components/interactive/InteractiveCanvas';
import { useDungeonInput } from '@/lib/dungeonInput';

let pointerLockElement: Element | null = null;

vi.mock('@react-three/fiber', async () => {
  const react = await import('react');
  return {
    Canvas: ({ children, onCreated, ...props }: any) => {
      const ref = react.useRef<HTMLCanvasElement | null>(null);
      react.useEffect(() => {
        if (ref.current && onCreated) {
          onCreated({ gl: { domElement: ref.current } });
        }
      }, [onCreated]);
      return (
        <canvas ref={ref} data-testid="r3f-canvas" {...props}>
          {children}
        </canvas>
      );
    },
  };
});

vi.mock('@react-three/rapier', () => ({
  Physics: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/dungeon/DungeonScene', () => ({
  default: () => <div data-testid="dungeon-scene" />,
}));

beforeEach(() => {
  pointerLockElement = null;
  Object.defineProperty(document, 'pointerLockElement', {
    configurable: true,
    get: () => pointerLockElement,
  });
  useDungeonInput.getState().reset();
});

afterEach(() => {
  useDungeonInput.getState().reset();
});

describe('pointer lock + focus integration', () => {
  it('clicking the canvas requests pointer lock and focuses the canvas', () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    const canvas = getByTestId('r3f-canvas') as HTMLCanvasElement;
    const focusSpy = vi.spyOn(canvas, 'focus');
    const requestSpy = vi.fn();
    (canvas as any).requestPointerLock = requestSpy;

    fireEvent.pointerDown(canvas);

    expect(canvas.tabIndex).toBe(0);
    expect(focusSpy).toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalled();
  });

  it('updates isPointerLocked on pointerlockchange', () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    const canvas = getByTestId('r3f-canvas') as HTMLCanvasElement;

    pointerLockElement = canvas;
    document.dispatchEvent(new Event('pointerlockchange'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(true);

    pointerLockElement = null;
    document.dispatchEvent(new Event('pointerlockchange'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(false);
  });

  it('tracks focus state with focus/blur', () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    const canvas = getByTestId('r3f-canvas') as HTMLCanvasElement;

    fireEvent.focus(canvas);
    expect(useDungeonInput.getState().hasFocus).toBe(true);

    fireEvent.blur(canvas);
    expect(useDungeonInput.getState().hasFocus).toBe(false);
  });
});
