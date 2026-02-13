import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import MobileControls from '../ui/MobileControls';
import { useDungeonInput } from '@/lib/dungeonInput';

describe('mobile controls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useDungeonInput.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
    useDungeonInput.getState().reset();
  });

  it('pulses jump action key on tap', () => {
    const onInteract = vi.fn();
    const onOpenSettings = vi.fn();
    const { getByTestId } = render(
      <MobileControls
        visible
        blocked={false}
        canInteract
        onInteract={onInteract}
        onOpenSettings={onOpenSettings}
      />,
    );

    fireEvent.pointerDown(getByTestId('mobile-action-jump'));
    expect(useDungeonInput.getState().keys.jump).toBe(true);

    vi.advanceTimersByTime(140);
    expect(useDungeonInput.getState().keys.jump).toBe(false);
  });

  it('moves joystick axis and resets on release', () => {
    const onInteract = vi.fn();
    const onOpenSettings = vi.fn();
    const { getByTestId } = render(
      <MobileControls
        visible
        blocked={false}
        canInteract
        onInteract={onInteract}
        onOpenSettings={onOpenSettings}
      />,
    );
    const joystick = getByTestId('mobile-joystick');
    vi.spyOn(joystick, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 112,
      height: 112,
      top: 0,
      left: 0,
      right: 112,
      bottom: 112,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.pointerDown(joystick, { pointerId: 1, clientX: 110, clientY: 56, pointerType: 'touch' });
    const movedAxis = useDungeonInput.getState().moveAxis;
    expect(movedAxis.x).toBeGreaterThan(0.5);
    expect(movedAxis.y).toBeCloseTo(0, 2);

    fireEvent.pointerUp(joystick, { pointerId: 1, pointerType: 'touch' });
    expect(useDungeonInput.getState().moveAxis.x).toBe(0);
    expect(useDungeonInput.getState().moveAxis.y).toBe(0);
  });

  it('adds look delta from touch drag', () => {
    const onInteract = vi.fn();
    const onOpenSettings = vi.fn();
    const { getByTestId } = render(
      <MobileControls
        visible
        blocked={false}
        canInteract
        onInteract={onInteract}
        onOpenSettings={onOpenSettings}
      />,
    );
    const lookPad = getByTestId('mobile-look-pad');

    fireEvent.pointerDown(lookPad, { pointerId: 4, clientX: 200, clientY: 100, pointerType: 'touch' });
    fireEvent.pointerMove(lookPad, { pointerId: 4, clientX: 218, clientY: 124, pointerType: 'touch' });
    fireEvent.pointerUp(lookPad, { pointerId: 4, pointerType: 'touch' });

    const delta = useDungeonInput.getState().consumeLookDelta();
    expect(delta.x).toBeCloseTo(18, 1);
    expect(delta.y).toBeCloseTo(24, 1);
  });
});
