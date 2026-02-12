import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Object3D } from 'three';

let layoutMock = [
  { key: 'Floor_Standard', pos: [0, 0, 0] },
  { key: 'Wall', pos: [0, 0, 2], rotY: 0 },
];

vi.mock('@/constants/dungeonLayout', () => ({
  get DUNGEON_LAYOUT() {
    return layoutMock;
  },
  DUNGEON_SCALE: 1,
  DUNGEON_TILE_SIZE: 4,
  DUNGEON_FLOOR_THICKNESS: 1,
  DUNGEON_WALL_HEIGHT: 6,
  DUNGEON_WALL_THICKNESS: 1,
  DUNGEON_COLUMN_HEIGHT: 6,
  DUNGEON_COLUMN_RADIUS: 0.6,
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
  it('renders mesh geometry for the mocked placements without throwing', () => {
    const { container } = render(<DungeonLayout />);
    const meshes = container.querySelectorAll('mesh');
    expect(meshes.length).toBeGreaterThanOrEqual(layoutMock.length);
  });

  it('handles missing node keys without crashing', () => {
    layoutMock = [
      { key: 'MissingNode', pos: [0, 0, 0] },
      { key: 'Wall', pos: [0, 0, 2], rotY: 0 },
    ];
    const { container } = render(<DungeonLayout />);
    expect(container.querySelectorAll('mesh').length).toBeGreaterThan(0);
  });

  it('renders safely when debug query is enabled', () => {
    window.history.pushState({}, '', '/?debug=1');
    const { container } = render(<DungeonLayout />);
    expect(container.querySelectorAll('mesh').length).toBeGreaterThan(0);
  });
});
