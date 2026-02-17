import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import InteractiveCanvas from '../../InteractiveCanvas';
import { useDungeonInput } from '@/lib/dungeonInput';

let pointerLockElement: Element | null = null;

vi.mock('@react-three/fiber', async () => {
  const react = await import('react');
  type MockCanvasProps = React.ComponentProps<'canvas'> & {
    children?: React.ReactNode;
    onCreated?: (args: {
      gl: {
        domElement: HTMLCanvasElement;
        shadowMap: { enabled: boolean };
        toneMapping: number;
        toneMappingExposure: number;
      };
    }) => void;
  };
  return {
    Canvas: ({ children, onCreated, ...props }: MockCanvasProps) => {
      const ref = react.useRef<HTMLCanvasElement | null>(null);
      react.useEffect(() => {
        if (ref.current && onCreated) {
          onCreated({
            gl: {
              domElement: ref.current,
              shadowMap: { enabled: false },
              toneMapping: 0,
              toneMappingExposure: 1,
            },
          });
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
  Physics: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('../DungeonScene', () => ({
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
    const requestSpy = vi.fn();
    const pointerCanvas = canvas as HTMLCanvasElement & { requestPointerLock: () => void };
    pointerCanvas.requestPointerLock = requestSpy;

    fireEvent.mouseDown(canvas, { button: 0 });

    expect(canvas.tabIndex).toBe(0);
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

  it('recovers pointer lock after ESC-style unlock', () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    const canvas = getByTestId('r3f-canvas') as HTMLCanvasElement;
    const pointerCanvas = canvas as HTMLCanvasElement & { requestPointerLock: () => void };
    const requestSpy = vi.fn();
    pointerCanvas.requestPointerLock = requestSpy;

    pointerLockElement = canvas;
    document.dispatchEvent(new Event('pointerlockchange'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(true);

    pointerLockElement = null;
    document.dispatchEvent(new Event('pointerlockchange'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(false);

    fireEvent.mouseDown(canvas, { button: 0 });
    expect(requestSpy).toHaveBeenCalledTimes(1);

    pointerLockElement = canvas;
    document.dispatchEvent(new Event('pointerlockchange'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(true);
  });

  it('clears pointer lock state when pointerlockerror is raised', () => {
    const { getByTestId } = render(<InteractiveCanvas />);
    const canvas = getByTestId('r3f-canvas') as HTMLCanvasElement;

    pointerLockElement = canvas;
    document.dispatchEvent(new Event('pointerlockchange'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(true);

    document.dispatchEvent(new Event('pointerlockerror'));
    expect(useDungeonInput.getState().isPointerLocked).toBe(false);
  });
});
