import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { useKeyboardMovement } from '../../interactive-canvas/useKeyboardMovement';

function KeyboardHarness({
  setKeys,
  setMoveAxis,
}: {
  setKeys: (patch: Record<string, boolean>) => void;
  setMoveAxis: (axis: { x: number; y: number }) => void;
}) {
  useKeyboardMovement(setKeys, setMoveAxis);
  return <div data-testid="keyboard-harness" />;
}

describe('keyboard movement stress handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles rapid key spam and releases without stuck movement flags', () => {
    const setKeys = vi.fn();
    const setMoveAxis = vi.fn();
    render(<KeyboardHarness setKeys={setKeys} setMoveAxis={setMoveAxis} />);

    for (let i = 0; i < 20; i += 1) {
      fireEvent.keyDown(window, { code: 'KeyW' });
      fireEvent.keyDown(window, { code: 'KeyD' });
      fireEvent.keyUp(window, { code: 'KeyW' });
      fireEvent.keyUp(window, { code: 'KeyD' });
    }

    expect(setKeys).toHaveBeenCalledWith({ forward: false });
    expect(setKeys).toHaveBeenCalledWith({ right: false });
  });

  it('resets movement state on blur to avoid stuck input', () => {
    const setKeys = vi.fn();
    const setMoveAxis = vi.fn();
    render(<KeyboardHarness setKeys={setKeys} setMoveAxis={setMoveAxis} />);

    fireEvent.keyDown(window, { code: 'KeyW' });
    fireEvent.blur(window);

    expect(setMoveAxis).toHaveBeenCalledWith({ x: 0, y: 0 });
    expect(setKeys).toHaveBeenCalledWith({
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
  });

  it('cleans up window listeners on unmount to avoid duplicate handlers', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const setKeys = vi.fn();
    const setMoveAxis = vi.fn();

    const { unmount } = render(<KeyboardHarness setKeys={setKeys} setMoveAxis={setMoveAxis} />);
    unmount();

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });
});
