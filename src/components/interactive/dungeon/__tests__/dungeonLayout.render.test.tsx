import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Object3D } from 'three';

let layoutMock = [
  { key: 'Floor_Standard', pos: [0, 0, 0] },
  { key: 'Wall', pos: [0, 0, 2], rotY: 0 },
];

vi.mock('@/constants/DungeonLayout', () => ({
  get DUNGEON_LAYOUT() {
    return layoutMock;
  },
}));

vi.mock('@react-three/drei', () => {
  const useGLTF = () => ({
    nodes: {
      Floor_Standard: new Object3D(),
      Wall: new Object3D(),
    },
  });
  useGLTF.preload = () => undefined;
  return { useGLTF };
});

import DungeonLayout from '../DungeonLayout';

beforeEach(() => {
  layoutMock = [
    { key: 'Floor_Standard', pos: [0, 0, 0] },
    { key: 'Wall', pos: [0, 0, 2], rotY: 0 },
  ];
  window.history.pushState({}, '', '/');
});

describe('DungeonLayout rendering', () => {
  it('renders primitives for each placement without throwing', () => {
    const { container } = render(<DungeonLayout />);
    const primitives = container.querySelectorAll('primitive');
    expect(primitives.length).toBe(layoutMock.length);
  });

  it('warns on missing node keys but does not crash', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    layoutMock = [
      { key: 'MissingNode', pos: [0, 0, 0] },
      { key: 'Wall', pos: [0, 0, 2], rotY: 0 },
    ];
    render(<DungeonLayout />);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('adds debug node when debug query is enabled', () => {
    window.history.pushState({}, '', '/?debug=1');
    const { container } = render(<DungeonLayout />);
    const primitives = container.querySelectorAll('primitive');
    expect(primitives.length).toBe(layoutMock.length + 1);
  });
});
