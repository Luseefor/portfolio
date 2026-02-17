import { describe, expect, it, vi } from 'vitest';
import { Object3D } from 'three';
import {
  hasRenderableVisualObjects,
  warnAboutDungeonLayoutNodes,
} from '../dungeon-world/renderDiagnostics';

describe('dungeon render diagnostics', () => {
  it('warns when layout is empty without throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnAboutDungeonLayoutNodes([], {});
    expect(warnSpy).toHaveBeenCalledWith('[DungeonWorld] DUNGEON_LAYOUT is empty; render diagnostics enabled.');
    warnSpy.mockRestore();
  });

  it('warns with available keys for missing node names', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnAboutDungeonLayoutNodes(
      [{ key: 'MissingWall', pos: [0, 0, 0] }],
      { Floor_Standard: new Object3D(), Wall: new Object3D() },
    );
    expect(warnSpy).toHaveBeenCalledWith('Missing node:', 'MissingWall', ['Floor_Standard', 'Wall']);
    warnSpy.mockRestore();
  });

  it('detects renderable objects across standard and pot visuals', () => {
    const visible = hasRenderableVisualObjects(
      [{ object: null }],
      [{ intactObject: new Object3D(), brokenObject: null }],
    );
    expect(visible).toBe(true);

    const hidden = hasRenderableVisualObjects([{ object: null }], [{ intactObject: null, brokenObject: null }]);
    expect(hidden).toBe(false);
  });
});
